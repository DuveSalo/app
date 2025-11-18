/**
 * Email Adapter Factory
 * Factory para crear instancias de adaptadores de email
 */

import { EmailAdapter } from './EmailAdapter';
import { ResendAdapter } from './ResendAdapter';
import { MockAdapter } from './MockAdapter';
import { ConsoleAdapter } from './ConsoleAdapter';
import { logger } from '../../utils/logger';

const factoryLogger = logger.createContextLogger('EmailAdapterFactory');

export type EmailAdapterType = 'resend' | 'mock' | 'console';

export interface EmailAdapterFactoryConfig {
  type: EmailAdapterType;
  resend?: {
    apiKey: string;
    defaultFrom?: string;
  };
  mock?: {
    simulateFailures?: boolean;
    failureRate?: number;
    delay?: number;
    storeEmails?: boolean;
  };
}

/**
 * Factory Singleton para crear y gestionar adaptadores de email
 */
class EmailAdapterFactory {
  private static instance: EmailAdapterFactory;
  private currentAdapter: EmailAdapter | null = null;

  private constructor() {}

  /**
   * Obtiene la instancia única del factory
   */
  public static getInstance(): EmailAdapterFactory {
    if (!EmailAdapterFactory.instance) {
      EmailAdapterFactory.instance = new EmailAdapterFactory();
    }
    return EmailAdapterFactory.instance;
  }

  /**
   * Crea o actualiza el adaptador de email actual
   */
  public createAdapter(config: EmailAdapterFactoryConfig): EmailAdapter {
    factoryLogger.info('Creando adaptador de email', { type: config.type });

    switch (config.type) {
      case 'resend':
        if (!config.resend?.apiKey) {
          factoryLogger.warn('ResendAdapter requiere apiKey, usando ConsoleAdapter como fallback');
          this.currentAdapter = new ConsoleAdapter();
        } else {
          this.currentAdapter = new ResendAdapter({
            apiKey: config.resend.apiKey,
            defaultFrom: config.resend.defaultFrom,
          });
        }
        break;

      case 'mock':
        this.currentAdapter = new MockAdapter(config.mock);
        break;

      case 'console':
        this.currentAdapter = new ConsoleAdapter();
        break;

      default:
        const exhaustiveCheck: never = config.type;
        throw new Error(`Tipo de adaptador desconocido: ${exhaustiveCheck}`);
    }

    factoryLogger.info('Adaptador creado exitosamente', {
      provider: this.currentAdapter.getProviderName(),
      configured: this.currentAdapter.isConfigured(),
    });

    return this.currentAdapter;
  }

  /**
   * Obtiene el adaptador actual
   */
  public getCurrentAdapter(): EmailAdapter | null {
    return this.currentAdapter;
  }

  /**
   * Crea un adaptador basado en variables de entorno
   */
  public createFromEnvironment(): EmailAdapter {
    const isDevelopment = import.meta.env.DEV;
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const senderEmail = import.meta.env.VITE_SENDER_EMAIL;
    const useMock = import.meta.env.VITE_USE_MOCK_EMAIL === 'true';

    factoryLogger.info('Creando adaptador desde variables de entorno', {
      isDevelopment,
      hasResendKey: !!resendApiKey,
      useMock,
    });

    // En desarrollo, usar mock o console por defecto
    if (isDevelopment && !resendApiKey) {
      return this.createAdapter({
        type: useMock ? 'mock' : 'console',
        mock: {
          storeEmails: true,
          delay: 500,
        },
      });
    }

    // Si se fuerza mock
    if (useMock) {
      return this.createAdapter({
        type: 'mock',
        mock: {
          storeEmails: true,
          delay: 500,
        },
      });
    }

    // En producción con API key de Resend
    if (resendApiKey) {
      return this.createAdapter({
        type: 'resend',
        resend: {
          apiKey: resendApiKey,
          defaultFrom: senderEmail,
        },
      });
    }

    // Fallback a console
    factoryLogger.warn('No se encontró configuración de email, usando ConsoleAdapter');
    return this.createAdapter({ type: 'console' });
  }
}

// Exportar instancia única del factory
export const emailAdapterFactory = EmailAdapterFactory.getInstance();

// Función helper para obtener el adaptador actual
export const getEmailAdapter = (): EmailAdapter => {
  let adapter = emailAdapterFactory.getCurrentAdapter();

  if (!adapter) {
    // Si no hay adaptador, crear uno desde el entorno
    adapter = emailAdapterFactory.createFromEnvironment();
  }

  return adapter;
};
