/**
 * Mock Email Adapter
 * Implementación mock para desarrollo y testing
 */

import { BaseEmailAdapter, EmailParams, EmailResponse } from './EmailAdapter';
import { logger } from '../../utils/logger';

const adapterLogger = logger.createContextLogger('MockAdapter');

export interface MockAdapterConfig {
  /**
   * Si es true, simula fallos aleatorios
   */
  simulateFailures?: boolean;
  /**
   * Porcentaje de fallos (0-100)
   */
  failureRate?: number;
  /**
   * Delay en ms antes de responder
   */
  delay?: number;
  /**
   * Almacena los emails enviados
   */
  storeEmails?: boolean;
}

/**
 * Adaptador Mock para desarrollo y testing
 * No envía emails reales, solo simula el comportamiento
 */
export class MockAdapter extends BaseEmailAdapter {
  private config: Required<MockAdapterConfig>;
  private sentEmails: EmailParams[] = [];

  constructor(config: MockAdapterConfig = {}) {
    super();
    this.config = {
      simulateFailures: config.simulateFailures ?? false,
      failureRate: config.failureRate ?? 10,
      delay: config.delay ?? 100,
      storeEmails: config.storeEmails ?? true,
    };

    adapterLogger.info('MockAdapter inicializado', {
      config: this.config,
    });
  }

  /**
   * Siempre está configurado
   */
  public isConfigured(): boolean {
    return true;
  }

  /**
   * Nombre del proveedor
   */
  public getProviderName(): string {
    return 'Mock (Development)';
  }

  /**
   * Simula el envío de un email
   */
  public async sendEmail(params: EmailParams): Promise<EmailResponse> {
    try {
      // Validar parámetros
      this.validateEmailParams(params);

      // Simular delay
      if (this.config.delay > 0) {
        await this.sleep(this.config.delay);
      }

      // Simular fallo aleatorio
      if (this.config.simulateFailures && this.shouldSimulateFailure()) {
        const error = 'Fallo simulado por MockAdapter';
        adapterLogger.warn('Simulando fallo de envío', {
          to: params.to,
          subject: params.subject,
        });
        return { success: false, error };
      }

      // Almacenar email si está configurado
      if (this.config.storeEmails) {
        this.sentEmails.push({ ...params });
      }

      const emailId = this.generateMockId();

      adapterLogger.info('Email simulado exitosamente', {
        emailId,
        to: params.to,
        subject: params.subject,
      });

      // Log detallado en consola para desarrollo
      console.log('\n📧 ===== MOCK EMAIL ENVIADO =====');
      console.log('De:', params.from);
      console.log('Para:', params.to);
      console.log('Asunto:', params.subject);
      if (params.replyTo) console.log('Responder a:', params.replyTo);
      if (params.cc) console.log('CC:', params.cc);
      if (params.bcc) console.log('BCC:', params.bcc);
      console.log('Email ID:', emailId);
      console.log('HTML Preview (primeros 200 chars):');
      console.log(params.html.substring(0, 200) + '...');
      console.log('================================\n');

      return {
        success: true,
        emailId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      adapterLogger.error('Error simulando envío de email', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Obtiene todos los emails enviados (útil para testing)
   */
  public getSentEmails(): EmailParams[] {
    return [...this.sentEmails];
  }

  /**
   * Obtiene el último email enviado (útil para testing)
   */
  public getLastSentEmail(): EmailParams | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  /**
   * Limpia el historial de emails enviados
   */
  public clearSentEmails(): void {
    this.sentEmails = [];
    adapterLogger.debug('Historial de emails limpiado');
  }

  /**
   * Actualiza la configuración
   */
  public updateConfig(config: Partial<MockAdapterConfig>): void {
    this.config = { ...this.config, ...config };
    adapterLogger.info('Configuración actualizada', { config: this.config });
  }

  /**
   * Determina si debe simular un fallo
   */
  private shouldSimulateFailure(): boolean {
    return Math.random() * 100 < this.config.failureRate;
  }

  /**
   * Genera un ID mock
   */
  private generateMockId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Utilidad para simular delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
