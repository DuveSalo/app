/**
 * Email Utilities
 * Funciones centralizadas para generación de emails y notificaciones
 */

import { ExpiringServiceNotification, EmailNotificationMetadata } from '../../types/expirable';
import { EXPIRATION_CONFIG, EMAIL_STYLES } from '../constants';
import { formatDateForEmail } from './dateUtils';

/**
 * Obtiene el label del tipo de servicio en español
 */
export const getServiceLabel = (type: 'certificate' | 'inspection' | 'event'): string => {
  const labels = {
    certificate: 'certificado de conservación',
    inspection: 'inspección del sistema de autoprotección',
    event: 'información de evento',
  };
  return labels[type];
};

/**
 * Obtiene el texto de acción recomendada según el tipo de servicio
 */
export const getActionText = (type: 'certificate' | 'inspection' | 'event'): string => {
  const actions = {
    certificate: 'renovar el certificado',
    inspection: 'programar la inspección',
    event: 'actualizar la información del evento',
  };
  return actions[type];
};

/**
 * Determina el color de urgencia según los días restantes
 */
export const getUrgencyColor = (daysUntilExpiration: number): string => {
  return daysUntilExpiration <= EXPIRATION_CONFIG.URGENCY_THRESHOLD_DAYS
    ? EMAIL_STYLES.COLORS.URGENT
    : EMAIL_STYLES.COLORS.WARNING;
};

/**
 * Genera el asunto del email de notificación
 */
export const getEmailSubject = (service: ExpiringServiceNotification): string => {
  const label = service.type === 'certificate' ? 'Certificado' : 'Inspección';
  return `⚠️ ${label} próximo a vencer - ${service.daysUntilExpiration} días restantes`;
};

/**
 * Genera el HTML del cuerpo del email
 */
export const generateEmailHTML = (service: ExpiringServiceNotification, appUrl?: string): string => {
  const serviceName = getServiceLabel(service.type);
  const actionText = getActionText(service.type);
  const urgencyColor = getUrgencyColor(service.daysUntilExpiration);
  const { COLORS, PADDING, FONT_SIZE } = EMAIL_STYLES;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Vencimiento</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${COLORS.BACKGROUND};">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.BACKGROUND}; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.WHITE}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                <!-- Header -->
                <tr>
                  <td style="background-color: ${COLORS.HEADER}; padding: ${PADDING.HEADER}; text-align: center;">
                    <h1 style="margin: 0; color: ${COLORS.WHITE}; font-size: ${FONT_SIZE.TITLE}; font-weight: bold;">
                      Recordatorio de Vencimiento
                    </h1>
                  </td>
                </tr>

                <!-- Alert Banner -->
                <tr>
                  <td style="background-color: ${urgencyColor}; padding: ${PADDING.ALERT};">
                    <p style="margin: 0; color: ${COLORS.WHITE}; font-size: ${FONT_SIZE.BODY}; font-weight: bold; text-align: center;">
                      ⚠️ Faltan ${service.daysUntilExpiration} días para el vencimiento
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: ${PADDING.CONTENT};">
                    <p style="margin: 0 0 20px; color: ${COLORS.TEXT_PRIMARY}; font-size: ${FONT_SIZE.BODY}; line-height: 1.6;">
                      Estimado/a,
                    </p>

                    <p style="margin: 0 0 20px; color: ${COLORS.TEXT_PRIMARY}; font-size: ${FONT_SIZE.BODY}; line-height: 1.6;">
                      Le recordamos que su <strong>${serviceName}</strong> está próximo a vencer.
                    </p>

                    <!-- Service Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.CARD_BACKGROUND}; border-radius: 8px; margin: 20px 0; border: 1px solid ${COLORS.BORDER};">
                      <tr>
                        <td style="padding: ${PADDING.CARD};">
                          <table width="100%" cellpadding="5" cellspacing="0">
                            <tr>
                              <td style="color: ${COLORS.TEXT_SECONDARY}; font-size: ${FONT_SIZE.SMALL}; font-weight: bold; width: 40%;">
                                Empresa:
                              </td>
                              <td style="color: ${COLORS.TEXT_DARK}; font-size: ${FONT_SIZE.SMALL};">
                                ${service.companyName}
                              </td>
                            </tr>
                            <tr>
                              <td style="color: ${COLORS.TEXT_SECONDARY}; font-size: ${FONT_SIZE.SMALL}; font-weight: bold; padding-top: 10px;">
                                Servicio:
                              </td>
                              <td style="color: ${COLORS.TEXT_DARK}; font-size: ${FONT_SIZE.SMALL}; padding-top: 10px;">
                                ${service.name}
                              </td>
                            </tr>
                            <tr>
                              <td style="color: ${COLORS.TEXT_SECONDARY}; font-size: ${FONT_SIZE.SMALL}; font-weight: bold; padding-top: 10px;">
                                Fecha de vencimiento:
                              </td>
                              <td style="color: ${COLORS.TEXT_DARK}; font-size: ${FONT_SIZE.SMALL}; padding-top: 10px;">
                                ${formatDateForEmail(service.expirationDate)}
                              </td>
                            </tr>
                            <tr>
                              <td style="color: ${COLORS.TEXT_SECONDARY}; font-size: ${FONT_SIZE.SMALL}; font-weight: bold; padding-top: 10px;">
                                Días restantes:
                              </td>
                              <td style="color: ${urgencyColor}; font-size: ${FONT_SIZE.SUBTITLE}; font-weight: bold; padding-top: 10px;">
                                ${service.daysUntilExpiration} días
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 20px 0; color: ${COLORS.TEXT_PRIMARY}; font-size: ${FONT_SIZE.BODY}; line-height: 1.6;">
                      Le recomendamos tomar acción lo antes posible para ${actionText} y evitar interrupciones en sus operaciones.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${appUrl || 'https://tuapp.com'}/dashboard"
                             style="display: inline-block; padding: 14px 28px; background-color: ${COLORS.PRIMARY}; color: ${COLORS.WHITE}; text-decoration: none; border-radius: 6px; font-size: ${FONT_SIZE.BODY}; font-weight: bold;">
                            Ir al Panel de Control
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: ${COLORS.CARD_BACKGROUND}; padding: ${PADDING.FOOTER}; border-top: 1px solid ${COLORS.BORDER};">
                    <p style="margin: 0 0 10px; color: ${COLORS.TEXT_SECONDARY}; font-size: ${FONT_SIZE.SMALL}; text-align: center;">
                      Este es un mensaje automático, por favor no responda a este correo.
                    </p>
                    <p style="margin: 0; color: ${COLORS.TEXT_MUTED}; font-size: ${FONT_SIZE.TINY}; text-align: center;">
                      © ${new Date().getFullYear()} Sistema de Gestión de Conservación. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

/**
 * Genera metadata completa para un email de notificación
 */
export const getEmailMetadata = (
  service: ExpiringServiceNotification,
  appUrl?: string
): EmailNotificationMetadata => ({
  subject: getEmailSubject(service),
  html: generateEmailHTML(service, appUrl),
});
