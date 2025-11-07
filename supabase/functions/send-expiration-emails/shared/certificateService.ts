
/**
 * Certificate Service
 * Lógica de negocio para certificados próximos a vencer
 */

import { ExpiringService } from './types.ts';
import { calculateDaysUntilExpiration, getDateRangeForNotifications } from '../../../src/lib/utils/dateUtils.ts';
import { EXPIRATION_CONFIG } from '../../../src/lib/constants/expirationThresholds.ts';

export async function getExpiringCertificates(supabaseClient: any): Promise<ExpiringService[]> {
  const { to } = getDateRangeForNotifications(EXPIRATION_CONFIG.NOTIFICATION_WINDOW_DAYS);

  const { data: certificates, error } = await supabaseClient
    .from("conservation_certificates")
    .select(`
      id,
      expiration_date,
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
    console.error("Error fetching expiring certificates:", error);
    throw new Error(`Failed to fetch certificates: ${error.message}`);
  }

  if (!certificates || certificates.length === 0) {
    return [];
  }

  return certificates.map((cert: any) => {
    const daysUntilExpiration = calculateDaysUntilExpiration(cert.expiration_date);

    return {
      id: cert.id,
      type: "certificate" as const,
      name: `Certificado ${cert.registration_number}`,
      expirationDate: cert.expiration_date,
      daysUntilExpiration,
      companyId: cert.company_id,
      companyName: cert.companies.name,
      userEmail: cert.companies.auth.users.email,
    };
  });
}

