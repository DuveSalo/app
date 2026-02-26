/**
 * Logger Singleton
 * Sistema centralizado de logging con niveles configurables
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableContext: boolean;
  prefix?: string;
  externalLogger?: (level: string, message: string, context?: LogContext) => void;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableTimestamp: true,
  enableContext: true,
  prefix: '[App]',
};

/**
 * Logger Singleton - Única instancia compartida en toda la aplicación
 */
class Logger {
  private static instance: Logger;
  private config: LoggerConfig;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Obtiene la instancia única del Logger
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    } else if (config) {
      // Permite actualizar la configuración después de la primera instancia
      Logger.instance.updateConfig(config);
    }
    return Logger.instance;
  }

  /**
   * Actualiza la configuración del logger
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Formatea el mensaje de log
   */
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const parts: string[] = [];

    if (this.config.enableTimestamp) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }

    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }

    parts.push(`[${level}]`);
    parts.push(message);

    if (this.config.enableContext && context && Object.keys(context).length > 0) {
      parts.push(JSON.stringify(context, null, 2));
    }

    return parts.join(' ');
  }

  /**
   * Método genérico de log
   */
  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: LogContext,
    consoleMethod: 'log' | 'info' | 'warn' | 'error' = 'log'
  ): void {
    // Verificar si el nivel está habilitado
    if (level < this.config.level) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context);

    // Log a consola
    console[consoleMethod](formattedMessage);

    // Log a servicio externo si está configurado
    if (this.config.externalLogger) {
      this.config.externalLogger(levelName, message, context);
    }
  }

  /**
   * Log nivel DEBUG
   */
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context, 'log');
  }

  /**
   * Log nivel INFO
   */
  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, 'INFO', message, context, 'info');
  }

  /**
   * Log nivel WARN
   */
  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, 'WARN', message, context, 'warn');
  }

  /**
   * Log nivel ERROR
   */
  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = { ...context };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = error;
    }

    this.log(LogLevel.ERROR, 'ERROR', message, errorContext, 'error');
  }

  /**
   * Crea un logger con contexto específico (útil para componentes)
   */
  public createContextLogger(contextName: string): ContextLogger {
    return new ContextLogger(this, contextName);
  }
}

/**
 * Logger con contexto específico
 */
class ContextLogger {
  constructor(private logger: Logger, private contextName: string) { }

  private addContext(context?: LogContext): LogContext {
    return {
      context: this.contextName,
      ...context,
    };
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.addContext(context));
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(message, this.addContext(context));
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.addContext(context));
  }

  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.logger.error(message, error, this.addContext(context));
  }
}

// Exportar instancia única
export const logger = Logger.getInstance();

// Exportar función para crear loggers con contexto
export const createLogger = (contextName: string): ContextLogger => {
  return logger.createContextLogger(contextName);
};

// Exportar clase para testing
export { Logger };
