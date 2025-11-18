/**
 * Email Adapter for Edge Functions
 * Versión simplificada del adaptador para Deno Edge Runtime
 */

export interface EmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResponse {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Interface para adaptadores de email
 */
export interface EmailAdapter {
  sendEmail(params: EmailParams): Promise<EmailResponse>;
  isConfigured(): boolean;
  getProviderName(): string;
}

/**
 * Adaptador para Resend API (versión Edge Function)
 */
export class ResendAdapter implements EmailAdapter {
  private apiKey: string;
  private readonly API_URL = 'https://api.resend.com/emails';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }

  public getProviderName(): string {
    return 'Resend';
  }

  public async sendEmail(params: EmailParams): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      console.error('ResendAdapter no está configurado (falta API key)');
      return {
        success: false,
        error: 'ResendAdapter no configurado',
      };
    }

    const requestBody = {
      from: params.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.text && { text: params.text }),
      ...(params.replyTo && { reply_to: params.replyTo }),
    };

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error enviando email a ${params.to}:`, errorText);
        return {
          success: false,
          error: errorText,
        };
      }

      const data = await response.json();
      console.log(`Email enviado exitosamente a ${params.to}`);

      return {
        success: true,
        emailId: data.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error enviando email a ${params.to}:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

/**
 * Adaptador de consola para desarrollo
 */
export class ConsoleAdapter implements EmailAdapter {
  public isConfigured(): boolean {
    return true;
  }

  public getProviderName(): string {
    return 'Console (Development)';
  }

  public async sendEmail(params: EmailParams): Promise<EmailResponse> {
    const emailId = `console_${Date.now()}`;

    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL (Console Adapter)');
    console.log('='.repeat(60));
    console.log(`ID:      ${emailId}`);
    console.log(`From:    ${params.from}`);
    console.log(`To:      ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log('-'.repeat(60));
    console.log('HTML (primeros 200 chars):');
    console.log(params.html.substring(0, 200) + '...');
    console.log('='.repeat(60) + '\n');

    return {
      success: true,
      emailId,
    };
  }
}

/**
 * Factory para crear adaptadores
 */
export function createEmailAdapter(): EmailAdapter {
  const apiKey = Deno.env.get('RESEND_API_KEY');

  if (apiKey && apiKey.trim() !== '') {
    console.log('Usando ResendAdapter');
    return new ResendAdapter(apiKey);
  }

  console.log('RESEND_API_KEY no configurada, usando ConsoleAdapter');
  return new ConsoleAdapter();
}
