/**
 * Edge Function: send-expiration-emails
 * CRON job that sends email digests for upcoming and expired documents.
 *
 * Queries certificates, fire extinguishers, and self-protection systems
 * expiring within 30 days or already expired, groups by company, and sends
 * separate digest emails per company owner so each message has one job.
 *
 * Security: Accepts CRON_SECRET and the legacy scheduler service-role Bearer token.
 */

import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import {
  expiredDocumentsEmail,
  expirationWarningEmail,
  type ExpirationEmailItem,
} from '../_shared/email-templates.ts';

interface ExpiringItem extends ExpirationEmailItem {
  companyId: string;
}

function isAuthorizedCronRequest(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const validTokens = [
    Deno.env.get('CRON_SECRET'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  ].filter((value): value is string => Boolean(value));

  return Boolean(token && validTokens.includes(token));
}

function daysBetween(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

Deno.serve(async (req) => {
  try {
    // Accept the dedicated CRON secret and the legacy scheduler service-role token.
    if (!isAuthorizedCronRequest(req)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const cutoffDate = thirtyDaysFromNow.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const items: ExpiringItem[] = [];

    // 1. Conservation certificates expiring within 30 days (includes already expired)
    const { data: certificates } = await supabaseAdmin
      .from('conservation_certificates')
      .select('company_id, registration_number, expiration_date')
      .lte('expiration_date', cutoffDate);

    if (certificates) {
      for (const cert of certificates) {
        items.push({
          type: 'Certificado de conservación',
          name: `Nro. ${cert.registration_number}`,
          expiresAt: cert.expiration_date,
          daysLeft: daysBetween(cert.expiration_date),
          companyId: cert.company_id,
        });
      }
    }

    // 2. Fire extinguishers — charge expiration (includes already expired)
    const { data: extinguishersCharge } = await supabaseAdmin
      .from('fire_extinguishers')
      .select('company_id, extinguisher_number, charge_expiration_date')
      .lte('charge_expiration_date', cutoffDate);

    if (extinguishersCharge) {
      for (const ext of extinguishersCharge) {
        items.push({
          type: 'Matafuego (carga)',
          name: `Extintor #${ext.extinguisher_number}`,
          expiresAt: ext.charge_expiration_date,
          daysLeft: daysBetween(ext.charge_expiration_date),
          companyId: ext.company_id,
        });
      }
    }

    // 3. Fire extinguishers — hydraulic pressure expiration (includes already expired)
    const { data: extinguishersHydro } = await supabaseAdmin
      .from('fire_extinguishers')
      .select('company_id, extinguisher_number, hydraulic_pressure_expiration_date')
      .lte('hydraulic_pressure_expiration_date', cutoffDate);

    if (extinguishersHydro) {
      for (const ext of extinguishersHydro) {
        items.push({
          type: 'Matafuego (presión hidráulica)',
          name: `Extintor #${ext.extinguisher_number}`,
          expiresAt: ext.hydraulic_pressure_expiration_date,
          daysLeft: daysBetween(ext.hydraulic_pressure_expiration_date),
          companyId: ext.company_id,
        });
      }
    }

    // 4. Self-protection systems expiration (includes already expired)
    const { data: systems } = await supabaseAdmin
      .from('self_protection_systems')
      .select('company_id, expiration_date')
      .not('expiration_date', 'is', null)
      .lte('expiration_date', cutoffDate);

    if (systems) {
      for (const sys of systems) {
        items.push({
          type: 'Sistema de autoprotección',
          name: 'Vencimiento del sistema',
          expiresAt: sys.expiration_date!,
          daysLeft: daysBetween(sys.expiration_date!),
          companyId: sys.company_id,
        });
      }
    }

    if (items.length === 0) {
      console.log('No expiring items found within 30 days');
      return new Response(
        JSON.stringify({
          success: true,
          itemsFound: 0,
          emailsSent: 0,
          upcomingEmailsSent: 0,
          expiredEmailsSent: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Group items by company
    const byCompany = new Map<string, ExpiringItem[]>();
    for (const item of items) {
      const list = byCompany.get(item.companyId) || [];
      list.push(item);
      byCompany.set(item.companyId, list);
    }

    // Get company owners with emails
    const companyIds = [...byCompany.keys()];
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id, name, user_id')
      .in('id', companyIds);

    if (!companies) {
      console.error('Failed to fetch companies');
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch companies' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user emails — targeted per-user lookup to avoid listUsers() 50-user truncation
    const userIds = companies.map((c) => c.user_id).filter(Boolean);
    const userMap = new Map<string, { email: string; name: string }>();
    const userResults = await Promise.all(
      userIds.map((id) => supabaseAdmin.auth.admin.getUserById(id))
    );
    for (const { data } of userResults) {
      if (data?.user) {
        const u = data.user;
        userMap.set(u.id, {
          email: u.email || '',
          name: u.user_metadata?.name || u.email || 'Usuario',
        });
      }
    }

    // Send separate digests per company: upcoming vs already expired.
    let emailsSent = 0;
    let upcomingEmailsSent = 0;
    let expiredEmailsSent = 0;

    for (const company of companies) {
      const companyItems = byCompany.get(company.id);
      if (!companyItems?.length) continue;

      const user = userMap.get(company.user_id);
      if (!user?.email) {
        console.warn(`No email for company ${company.id} (user ${company.user_id})`);
        continue;
      }

      // Sort: most urgent first
      companyItems.sort((a, b) => a.daysLeft - b.daysLeft);

      const expiredItems = companyItems.filter((item) => item.daysLeft < 0);
      const upcomingItems = companyItems.filter((item) => item.daysLeft >= 0);

      if (upcomingItems.length > 0) {
        const subjectLabel = `vencimiento${upcomingItems.length > 1 ? 's' : ''} próximo${upcomingItems.length > 1 ? 's' : ''}`;
        await sendEmailSafe({
          to: user.email,
          subject: `${upcomingItems.length} ${subjectLabel} — ${company.name}`,
          html: expirationWarningEmail(user.name, upcomingItems),
          idempotencyKey: `expiration-upcoming-${todayStr}-${company.id}`,
          tags: [
            { name: 'event', value: 'expiration-upcoming' },
            { name: 'source', value: 'send-expiration-emails' },
          ],
        });
        emailsSent++;
        upcomingEmailsSent++;
      }

      if (expiredItems.length > 0) {
        const subjectLabel = `documento${expiredItems.length > 1 ? 's' : ''} vencido${expiredItems.length > 1 ? 's' : ''}`;
        await sendEmailSafe({
          to: user.email,
          subject: `${expiredItems.length} ${subjectLabel} — ${company.name}`,
          html: expiredDocumentsEmail(user.name, expiredItems),
          idempotencyKey: `expiration-expired-${todayStr}-${company.id}`,
          tags: [
            { name: 'event', value: 'documents-expired' },
            { name: 'source', value: 'send-expiration-emails' },
          ],
        });
        emailsSent++;
        expiredEmailsSent++;
      }
    }

    console.log(
      `send-expiration-emails complete: ${items.length} items, ${emailsSent} emails sent`
    );

    return new Response(
      JSON.stringify({
        success: true,
        itemsFound: items.length,
        emailsSent,
        upcomingEmailsSent,
        expiredEmailsSent,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('send-expiration-emails error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
