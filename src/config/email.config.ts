/**
 * Email Adapter Configuration
 * Configuración centralizada del adaptador de email
 */

import { emailAdapterFactory, getEmailAdapter } from '../lib/adapters/email';

/**
 * Inicializa el adaptador de email según el entorno
 */
export function initializeEmailAdapter(): void {
  // El factory ya tiene lógica para determinar el adaptador desde variables de entorno
  const adapter = emailAdapterFactory.createFromEnvironment();

  console.log(`Email Adapter inicializado: ${adapter.getProviderName()}`);
  console.log(`Configurado correctamente: ${adapter.isConfigured()}`);
}

/**
 * Obtiene el adaptador de email actual
 * Esta es una función helper para facilitar el uso
 */
export { getEmailAdapter };

/**
 * Variables de entorno necesarias:
 *
 * Para usar Resend en producción:
 * - VITE_RESEND_API_KEY: API key de Resend
 * - VITE_SENDER_EMAIL: Email del remitente (opcional)
 *
 * Para forzar modo mock:
 * - VITE_USE_MOCK_EMAIL=true
 *
 * En desarrollo sin estas variables, se usa ConsoleAdapter por defecto
 */
