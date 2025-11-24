import { Logger, Injectable } from '@nestjs/common';

export type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'verbose';

@Injectable()
export class AppLogger extends Logger {
  log(message: string, context?: string) {
    super.log(this.formatMessage('LOG', message), context);
  }

  warn(message: string, context?: string) {
    super.warn(this.formatMessage('WARN', message), context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(this.formatMessage('ERROR', message), trace, context);
  }

  debug(message: string, context?: string) {
    super.debug(this.formatMessage('DEBUG', message), context);
  }

  verbose(message: string, context?: string) {
    super.verbose(this.formatMessage('VERBOSE', message), context);
  }

  private formatMessage(level: string, message: string) {
    const timestamp = new Date().toISOString();
    return `${timestamp} - ${level} - ${message}`;
  }
}
