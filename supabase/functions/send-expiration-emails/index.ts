/**
 * Edge Function: send-expiration-emails
 * CRON job that sends email digests for upcoming expirations.
 *
 * Queries certificates, fire extinguishers, and self-protection systems
 * expiring within 30 days, groups by company, and sends a single
 * digest email per company owner.
 *
 * Security: Requires service_role key (same pattern as cron-check-subscriptions).
 */

import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import { expirationWarningEmail } from '../_shared/email-templates.ts';

interface ExpiringItem {
  type: string;
  name: string;
  expiresAt: string;
  daysLeft: number;
  companyId: string;
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
    // Verify this is called by service role (CRON or admin)
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
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

    // 1. Conservation certificates expiring within 30 days
    const { data: certificates } = await supabaseAdmin
      .from('conservation_certificates')
      .select('company_id, registration_number, expiration_date')
      .gte('expiration_date', todayStr)
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

    // 2. Fire extinguishers — charge expiration
    const { data: extinguishersCharge } = await supabaseAdmin
      .from('fire_extinguishers')
      .select('company_id, extinguisher_number, charge_expiration_date')
      .gte('charge_expiration_date', todayStr)
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

    // 3. Fire extinguishers — hydraulic pressure expiration
    const { data: extinguishersHydro } = await supabaseAdmin
      .from('fire_extinguishers')
      .select('company_id, extinguisher_number, hydraulic_pressure_expiration_date')
      .gte('hydraulic_pressure_expiration_date', todayStr)
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

    // 4. Self-protection systems expiration
    const { data: systems } = await supabaseAdmin
      .from('self_protection_systems')
      .select('company_id, expiration_date')
      .not('expiration_date', 'is', null)
      .gte('expiration_date', todayStr)
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
        JSON.stringify({ success: true, emailsSent: 0 }),
        { headers: { 'Content-Type': 'application/json' } },
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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch companies' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Get user emails
    const userIds = companies.map((c) => c.user_id).filter(Boolean);
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const userMap = new Map<string, { email: string; name: string }>();
    if (usersData?.users) {
      for (const u of usersData.users) {
        if (userIds.includes(u.id)) {
          userMap.set(u.id, {
            email: u.email || '',
            name: u.user_metadata?.name || u.email || 'Usuario',
          });
        }
      }
    }

    // Send one digest email per company
    let emailsSent = 0;
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

      await sendEmailSafe({
        to: user.email,
        subject: `${companyItems.length} vencimiento${companyItems.length > 1 ? 's' : ''} próximo${companyItems.length > 1 ? 's' : ''} — ${company.name}`,
        html: expirationWarningEmail(user.name, companyItems),
      });
      emailsSent++;
    }

    console.log(
      `send-expiration-emails complete: ${items.length} items, ${emailsSent} emails sent`,
    );

    return new Response(
      JSON.stringify({ success: true, itemsFound: items.length, emailsSent }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('send-expiration-emails error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
