
/**
 * Inspection Service
 * Lógica de negocio para inspecciones próximas
 */

import { ExpiringService } from './types.ts';
import { calculateDaysUntilExpiration, getDateRangeForNotifications } from '../../../src/lib/utils/dateUtils.ts';
import { EXPIRATION_CONFIG } from '../../../src/lib/constants/expirationThresholds.ts';

export async function getUpcomingInspections(supabaseClient: any): Promise<ExpiringService[]> {
  const { to } = getDateRangeForNotifications(EXPIRATION_CONFIG.NOTIFICATION_WINDOW_DAYS);

  const { data: systems, error } = await supabaseClient
    .from("self_protection_systems")
    .select(`
      id,
      expiration_date,
      intervener,
      registration_number,
      company_id,
      companies!inner (
        name,
        user_id,
        auth.users!inner (email)
      )
    `)
    .lte("expiration_date", to.toISOString())
    .gte("expiration_date", new Date().toISOString());

  if (error) {
    console.error("Error fetching upcoming inspections:", error);
    throw new Error(`Failed to fetch inspections: ${error.message}`);
  }

  if (!systems || systems.length === 0) {
    return [];
  }

  return systems.map((system: any) => {
    const daysUntilExpiration = calculateDaysUntilExpiration(system.expiration_date);

    return {
      id: system.id,
      type: "inspection" as const,
      name: `Sistema de Autoprotección - ${system.intervener} (Mat. ${system.registration_number})`,
      expirationDate: system.expiration_date,
      daysUntilExpiration,
      companyId: system.company_id,
      companyName: system.companies.name,
      userEmail: system.companies.auth.users.email,
    };
  });
}

