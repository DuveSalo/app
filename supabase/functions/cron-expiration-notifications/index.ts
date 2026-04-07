/**
 * Edge Function: cron-expiration-notifications
 * Daily CRON job that creates in-app notifications for documents
 * expiring within 30 days or already expired.
 *
 * Deduplication: skips if an unread notification with same
 * related_table + related_id + type exists from the last 7 days.
 *
 * Security: Requires CRON_SECRET Bearer token.
 */

import { createLogger } from '../_shared/logger.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';

const log = createLogger('cron-expiration-notifications');

interface ExpiringItem {
  companyId: string;
  relatedTable: string;
  relatedId: string;
  category: string;
  name: string;
  daysLeft: number;
  link: string;
}

function daysBetween(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getNotificationType(daysLeft: number): string {
  if (daysLeft < 0) return 'error';
  if (daysLeft <= 10) return 'warning';
  return 'info';
}

function getTitle(daysLeft: number, name: string): string {
  if (daysLeft < 0) return `Documento vencido: ${name}`;
  if (daysLeft === 0) return `Documento vence hoy: ${name}`;
  return `Documento vence en ${daysLeft} día${daysLeft > 1 ? 's' : ''}: ${name}`;
}

function getMessage(daysLeft: number, name: string): string {
  if (daysLeft < 0)
    return `${name} venció hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) > 1 ? 's' : ''}.`;
  if (daysLeft === 0) return `${name} vence hoy.`;
  return `${name} vence en ${daysLeft} día${daysLeft > 1 ? 's' : ''}.`;
}

Deno.serve(async (req) => {
  const startTime = performance.now();

  try {
    // Verify this is called by the CRON scheduler (CRON_SECRET only)
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const cutoffDate = thirtyDaysFromNow.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const items: ExpiringItem[] = [];

    // 1. Conservation certificates
    const { data: certificates } = await supabaseAdmin
      .from('conservation_certificates')
      .select('id, company_id, registration_number, expiration_date')
      .lte('expiration_date', cutoffDate);

    if (certificates) {
      for (const cert of certificates) {
        items.push({
          companyId: cert.company_id,
          relatedTable: 'conservation_certificates',
          relatedId: cert.id,
          category: 'certificate_expiring',
          name: `Certificado Nro. ${cert.registration_number}`,
          daysLeft: daysBetween(cert.expiration_date),
          link: '/conservation-certificates',
        });
      }
    }

    // 2. Fire extinguishers — charge expiration
    const { data: extCharge } = await supabaseAdmin
      .from('fire_extinguishers')
      .select('id, company_id, extinguisher_number, charge_expiration_date')
      .lte('charge_expiration_date', cutoffDate);

    if (extCharge) {
      for (const ext of extCharge) {
        items.push({
          companyId: ext.company_id,
          relatedTable: 'fire_extinguishers',
          relatedId: `${ext.id}:charge`,
          category: 'security',
          name: `Extintor #${ext.extinguisher_number} (carga)`,
          daysLeft: daysBetween(ext.charge_expiration_date),
          link: '/fire-extinguishers',
        });
      }
    }

    // 3. Fire extinguishers — hydraulic pressure expiration
    const { data: extHydro } = await supabaseAdmin
      .from('fire_extinguishers')
      .select('id, company_id, extinguisher_number, hydraulic_pressure_expiration_date')
      .lte('hydraulic_pressure_expiration_date', cutoffDate);

    if (extHydro) {
      for (const ext of extHydro) {
        items.push({
          companyId: ext.company_id,
          relatedTable: 'fire_extinguishers',
          relatedId: `${ext.id}:hydraulic`,
          category: 'security',
          name: `Extintor #${ext.extinguisher_number} (presión hidráulica)`,
          daysLeft: daysBetween(ext.hydraulic_pressure_expiration_date),
          link: '/fire-extinguishers',
        });
      }
    }

    // 4. Self-protection systems
    const { data: systems } = await supabaseAdmin
      .from('self_protection_systems')
      .select('id, company_id, expiration_date')
      .not('expiration_date', 'is', null)
      .lte('expiration_date', cutoffDate);

    if (systems) {
      for (const sys of systems) {
        items.push({
          companyId: sys.company_id,
          relatedTable: 'self_protection_systems',
          relatedId: sys.id,
          category: 'system_inspection_due',
          name: 'Sistema de autoprotección',
          daysLeft: daysBetween(sys.expiration_date!),
          link: '/self-protection-systems',
        });
      }
    }

    if (items.length === 0) {
      const durationMs = Math.round(performance.now() - startTime);
      log.info('No expiring items found', { durationMs });
      return new Response(JSON.stringify({ success: true, created: 0, skipped: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch company owners to set user_id on notifications
    const companyIds = [...new Set(items.map((i) => i.companyId))];
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id, user_id')
      .in('id', companyIds);

    const companyOwnerMap = new Map<string, string>();
    if (companies) {
      for (const c of companies) {
        if (c.user_id) companyOwnerMap.set(c.id, c.user_id);
      }
    }

    // Fetch existing unread notifications from last 7 days for deduplication
    const { data: existingNotifs } = await supabaseAdmin
      .from('notifications')
      .select('related_table, related_id, type')
      .eq('is_read', false)
      .gte('created_at', sevenDaysAgoStr);

    const existingKeys = new Set<string>();
    if (existingNotifs) {
      for (const n of existingNotifs) {
        if (n.related_table && n.related_id && n.type) {
          existingKeys.add(`${n.related_table}:${n.related_id}:${n.type}`);
        }
      }
    }

    let created = 0;
    let skipped = 0;

    for (const item of items) {
      try {
        const type = getNotificationType(item.daysLeft);
        const dedupKey = `${item.relatedTable}:${item.relatedId}:${type}`;

        if (existingKeys.has(dedupKey)) {
          skipped++;
          continue;
        }

        const ownerId = companyOwnerMap.get(item.companyId);
        if (!ownerId) {
          log.warn('No owner found for company', { companyId: item.companyId });
          skipped++;
          continue;
        }

        const { error: insertError } = await supabaseAdmin.from('notifications').insert({
          company_id: item.companyId,
          user_id: ownerId,
          type,
          category: item.category,
          title: getTitle(item.daysLeft, item.name),
          message: getMessage(item.daysLeft, item.name),
          link: item.link,
          related_table: item.relatedTable,
          related_id: item.relatedId,
          is_read: false,
        });

        if (insertError) {
          log.error('Failed to insert notification', {
            error: insertError.message,
            relatedTable: item.relatedTable,
            relatedId: item.relatedId,
            companyId: item.companyId,
          });
        } else {
          existingKeys.add(dedupKey);
          created++;
        }
      } catch (err) {
        log.error('Error processing item', {
          error: err instanceof Error ? err.message : String(err),
          relatedTable: item.relatedTable,
          relatedId: item.relatedId,
        });
      }
    }

    const durationMs = Math.round(performance.now() - startTime);
    log.info('CRON complete', { created, skipped, totalItems: items.length, durationMs });

    return new Response(
      JSON.stringify({ success: true, created, skipped, totalItems: items.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    log.error('cron-expiration-notifications error', {
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
