import { Env } from '../types/env';

export class Logger {
  constructor(
    private module: string,
    private env: Env
  ) {}

  private log(level: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data,
      environment: this.env.ENVIRONMENT
    };

    // In production, you could send to an analytics service
    // For now, just console log
    console.log(JSON.stringify(logEntry));
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  error(message: string, error?: any) {
    this.log('ERROR', message, {
      error: error?.message || error,
      stack: error?.stack
    });
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  debug(message: string, data?: any) {
    if (this.env.ENVIRONMENT === 'development') {
      this.log('DEBUG', message, data);
    }
  }
}