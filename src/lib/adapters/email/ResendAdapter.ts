/**
 * Resend Email Adapter
 * Implementación del adaptador para Resend API
 */

import { BaseEmailAdapter, EmailParams, EmailResponse } from './EmailAdapter';
import { logger } from '../../utils/logger';

const adapterLogger = logger.createContextLogger('ResendAdapter');

export interface ResendConfig {
  apiKey: string;
  defaultFrom?: string;
}

/**
 * Adaptador para Resend API
 */
export class ResendAdapter extends BaseEmailAdapter {
  private apiKey: string;
  private defaultFrom?: string;
  private readonly API_URL = 'https://api.resend.com/emails';

  constructor(config: ResendConfig) {
    super();
    this.apiKey = config.apiKey;
    this.defaultFrom = config.defaultFrom;

    if (!this.isConfigured()) {
      adapterLogger.warn('ResendAdapter inicializado sin API key');
    }
  }

  /**
   * Verifica si el adaptador está configurado correctamente
   */
  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }

  /**
   * Obtiene el nombre del proveedor
   */
  public getProviderName(): string {
    return 'Resend';
  }

  /**
   * Envía un email usando Resend API
   */
  public async sendEmail(params: EmailParams): Promise<EmailResponse> {
    try {
      // Validar configuración
      if (!this.isConfigured()) {
        const error = 'ResendAdapter no está configurado (falta API key)';
        adapterLogger.error(error);
        return { success: false, error };
      }

      // Validar parámetros
      this.validateEmailParams(params);

      // Preparar datos para Resend
      const requestBody = {
        from: params.from || this.defaultFrom,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.text && { text: params.text }),
        ...(params.replyTo && { reply_to: params.replyTo }),
        ...(params.cc && params.cc.length > 0 && { cc: params.cc }),
        ...(params.bcc && params.bcc.length > 0 && { bcc: params.bcc }),
        ...(params.attachments && params.attachments.length > 0 && {
          attachments: params.attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            ...(att.contentType && { content_type: att.contentType }),
          })),
        }),
      };

      adapterLogger.debug('Enviando email via Resend', {
        to: requestBody.to,
        subject: params.subject,
      });

      // Hacer petición a Resend API
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Manejar respuesta
      if (!response.ok) {
        const errorText = await response.text();
        adapterLogger.error('Error enviando email via Resend', null, {
          status: response.status,
          error: errorText,
          to: requestBody.to,
        });
        return {
          success: false,
          error: `Resend API error (${response.status}): ${errorText}`,
        };
      }

      const data = await response.json();
      adapterLogger.info('Email enviado exitosamente via Resend', {
        emailId: data.id,
        to: requestBody.to,
      });

      return {
        success: true,
        emailId: data.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      adapterLogger.error('Excepción al enviar email via Resend', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Actualiza la API key
   */
  public updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    adapterLogger.info('API key actualizada');
  }

  /**
   * Actualiza el remitente por defecto
   */
  public updateDefaultFrom(defaultFrom: string): void {
    this.defaultFrom = defaultFrom;
    adapterLogger.info('Remitente por defecto actualizado', { defaultFrom });
  }
}
