type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  function: string;
  timestamp: string;
  message: string;
  traceId?: string;
  context?: Record<string, unknown>;
}

export function createLogger(functionName: string, traceId?: string) {
  function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      function: functionName,
      timestamp: new Date().toISOString(),
      message,
      ...(traceId ? { traceId } : {}),
      ...(context ? { context } : {}),
    };
    const output = JSON.stringify(entry);
    if (level === 'error' || level === 'warn') {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  return {
    debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
    info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
    warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
    error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
    async withDuration<T>(label: string, fn: () => Promise<T>): Promise<T> {
      log('info', `${label} started`);
      const start = performance.now();
      try {
        const result = await fn();
        const durationMs = Math.round(performance.now() - start);
        log('info', `${label} completed`, { durationMs });
        return result;
      } catch (err) {
        const durationMs = Math.round(performance.now() - start);
        log('error', `${label} failed`, {
          durationMs,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  };
}

export function createRequestLogger(functionName: string, req: Request) {
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  return createLogger(functionName, traceId);
}
