/**
 * Console Email Adapter
 * Implementación que solo imprime en consola (útil para desarrollo local)
 */

import { BaseEmailAdapter, EmailParams, EmailResponse } from './EmailAdapter';
import { logger } from '../../utils/logger';

const adapterLogger = logger.createContextLogger('ConsoleAdapter');

/**
 * Adaptador que solo imprime emails en consola
 * Útil para desarrollo local sin necesidad de configurar APIs externas
 */
export class ConsoleAdapter extends BaseEmailAdapter {
  constructor() {
    super();
    adapterLogger.info('ConsoleAdapter inicializado');
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
    return 'Console (Local Development)';
  }

  /**
   * "Envía" un email imprimiéndolo en consola
   */
  public async sendEmail(params: EmailParams): Promise<EmailResponse> {
    try {
      // Validar parámetros
      this.validateEmailParams(params);

      const emailId = `console_${Date.now()}`;

      // Imprimir email formateado en consola
      console.log('\n' + '='.repeat(80));
      console.log('📧 EMAIL (Console Adapter)');
      console.log('='.repeat(80));
      console.log(`ID:      ${emailId}`);
      console.log(`From:    ${params.from}`);
      console.log(`To:      ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
      if (params.cc && params.cc.length > 0) {
        console.log(`CC:      ${params.cc.join(', ')}`);
      }
      if (params.bcc && params.bcc.length > 0) {
        console.log(`BCC:     ${params.bcc.join(', ')}`);
      }
      if (params.replyTo) {
        console.log(`Reply:   ${params.replyTo}`);
      }
      console.log(`Subject: ${params.subject}`);
      console.log('-'.repeat(80));

      if (params.text) {
        console.log('TEXT CONTENT:');
        console.log(params.text);
        console.log('-'.repeat(80));
      }

      console.log('HTML CONTENT:');
      console.log(params.html);
      console.log('-'.repeat(80));

      if (params.attachments && params.attachments.length > 0) {
        console.log('ATTACHMENTS:');
        params.attachments.forEach((att, index) => {
          console.log(`  ${index + 1}. ${att.filename} (${att.contentType || 'unknown type'})`);
        });
        console.log('-'.repeat(80));
      }

      console.log('='.repeat(80) + '\n');

      adapterLogger.info('Email impreso en consola', {
        emailId,
        to: params.to,
        subject: params.subject,
      });

      return {
        success: true,
        emailId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      adapterLogger.error('Error imprimiendo email en consola', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
