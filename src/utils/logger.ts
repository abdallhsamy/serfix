const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error(message: string, err?: Error | unknown, meta?: Record<string, unknown>) {
    const errMeta = err instanceof Error ? { error: err.message, stack: isProd ? undefined : err.stack } : { error: String(err) };
    console.error(JSON.stringify({ level: 'error', message, ...errMeta, ...meta, timestamp: new Date().toISOString() }));
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }));
  },
};
