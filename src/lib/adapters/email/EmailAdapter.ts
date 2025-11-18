/**
 * Email Adapter Interface
 * Abstracción para proveedores de email (Resend, SendGrid, AWS SES, etc.)
 */

export interface EmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailResponse {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Interface común para todos los adaptadores de email
 */
export interface EmailAdapter {
  /**
   * Envía un email
   */
  sendEmail(params: EmailParams): Promise<EmailResponse>;

  /**
   * Envía múltiples emails (puede ser optimizado por el proveedor)
   */
  sendBulkEmails(emails: EmailParams[]): Promise<{
    successCount: number;
    failureCount: number;
    results: EmailResponse[];
  }>;

  /**
   * Verifica si el adaptador está configurado correctamente
   */
  isConfigured(): boolean;

  /**
   * Obtiene el nombre del proveedor
   */
  getProviderName(): string;
}

/**
 * Clase base abstracta con funcionalidad común
 */
export abstract class BaseEmailAdapter implements EmailAdapter {
  abstract sendEmail(params: EmailParams): Promise<EmailResponse>;
  abstract isConfigured(): boolean;
  abstract getProviderName(): string;

  /**
   * Implementación por defecto de sendBulkEmails
   * Los adaptadores específicos pueden sobrescribir si el proveedor
   * tiene una API optimizada para envíos masivos
   */
  async sendBulkEmails(emails: EmailParams[]): Promise<{
    successCount: number;
    failureCount: number;
    results: EmailResponse[];
  }> {
    const results = await Promise.all(
      emails.map(email => this.sendEmail(email))
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return { successCount, failureCount, results };
  }

  /**
   * Valida parámetros básicos del email
   */
  protected validateEmailParams(params: EmailParams): void {
    if (!params.to || (Array.isArray(params.to) && params.to.length === 0)) {
      throw new Error('El campo "to" es requerido');
    }
    if (!params.subject || params.subject.trim() === '') {
      throw new Error('El campo "subject" es requerido');
    }
    if (!params.html || params.html.trim() === '') {
      throw new Error('El campo "html" es requerido');
    }
  }
}
