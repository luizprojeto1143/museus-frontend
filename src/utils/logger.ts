/**
 * Logger utilitário seguro para produção.
 * Em modo de desenvolvimento, ele usa console.* normalmente.
 * Em produção, ele não vaza dados sensíveis e pode ser integrado com Sentry/Datadog no futuro.
 */
class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    info(message: string, ...optionalParams: any[]) {
        if (!this.isProduction) {
            console.log(`[INFO] ${message}`, ...optionalParams);
        }
    }

    warn(message: string, ...optionalParams: any[]) {
        if (!this.isProduction) {
            console.warn(`[WARN] ${message}`, ...optionalParams);
        }
    }

    error(message: string, ...optionalParams: any[]) {
        if (!this.isProduction) {
            console.error(`[ERROR] ${message}`, ...optionalParams);
        } else {
            // Em produção, você pode enviar isso para o Sentry
            // Sentry.captureException(optionalParams[0] || new Error(message));
        }
    }

    debug(message: string, ...optionalParams: any[]) {
        if (!this.isProduction) {
            console.debug(`[DEBUG] ${message}`, ...optionalParams);
        }
    }
}

export const logger = new Logger();
