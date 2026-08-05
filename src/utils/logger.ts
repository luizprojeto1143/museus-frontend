/**
 * Logger utilitario seguro para producao.
 * Em modo de desenvolvimento, ele usa console.* normalmente.
 * Em producao, ele nao vaza dados sensiveis e pode ser integrado com Sentry/Datadog no futuro.
 */
class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    private formatMessage(message: unknown) {
        if (typeof message === "string") return message;
        if (message instanceof Error) return message.message;
        try {
            return JSON.stringify(message);
        } catch {
            return String(message);
        }
    }

    info(message: unknown, ...optionalParams: unknown[]) {
        if (!this.isProduction) {
            console.log(`[INFO] ${this.formatMessage(message)}`, ...optionalParams);
        }
    }

    warn(message: unknown, ...optionalParams: unknown[]) {
        if (!this.isProduction) {
            console.warn(`[WARN] ${this.formatMessage(message)}`, ...optionalParams);
        }
    }

    error(message: unknown, ...optionalParams: unknown[]) {
        if (!this.isProduction) {
            console.error(`[ERROR] ${this.formatMessage(message)}`, ...optionalParams);
        } else {
            // Em producao, voce pode enviar isso para o Sentry.
            // Sentry.captureException(optionalParams[0] || message);
        }
    }

    debug(message: unknown, ...optionalParams: unknown[]) {
        if (!this.isProduction) {
            console.debug(`[DEBUG] ${this.formatMessage(message)}`, ...optionalParams);
        }
    }
}

export const logger = new Logger();
