/**
 * Logger Configuration
 * Configuración centralizada del sistema de logging
 */

import { LogLevel, logger } from '../lib/utils/logger';

/**
 * Configura el logger según el entorno
 */
export function initializeLogger(): void {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const logLevelEnv = process.env.NEXT_PUBLIC_LOG_LEVEL;

  // Determinar nivel de log
  let level = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  // Permitir override desde variables de entorno
  if (logLevelEnv) {
    const levelMap: Record<string, LogLevel> = {
      DEBUG: LogLevel.DEBUG,
      INFO: LogLevel.INFO,
      WARN: LogLevel.WARN,
      ERROR: LogLevel.ERROR,
      NONE: LogLevel.NONE,
    };
    level = levelMap[logLevelEnv.toUpperCase()] ?? level;
  }

  // Configurar logger
  logger.updateConfig({
    level,
    enableTimestamp: true,
    enableContext: true,
    prefix: '[ConservationApp]',
  });

  // Log inicial
  logger.info('Logger inicializado', {
    level: LogLevel[level],
    environment: isDevelopment ? 'development' : 'production',
  });
}

/**
 * Configura un logger externo (ejemplo: Sentry, LogRocket)
 * Descomenta y configura cuando sea necesario
 */
export function configureExternalLogger(): void {
  // Ejemplo de integración con Sentry
  /*
  import * as Sentry from '@sentry/react';

  logger.updateConfig({
    externalLogger: (level, message, context) => {
      if (level === 'ERROR') {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: context,
        });
      }
    },
  });
  */
}
