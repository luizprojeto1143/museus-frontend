/**
 * Normalized error structure used across the entire application.
 * All API and runtime errors should be converted to this format
 * before being exposed to UI components.
 */
export interface NormalizedError {
  /** Machine-readable error code (e.g. "NETWORK_ERROR", "UNAUTHORIZED") */
  code: string;
  /** Human-readable message — Portuguese */
  message: string;
  /** HTTP status code, if applicable */
  status?: number;
  /** Field that caused the error (for form validation) */
  field?: string;
  /** Original raw error, for debugging */
  raw?: unknown;
}

// ─── Code Map ──────────────────────────────────────────────────────
const HTTP_CODE_MAP: Record<number, { code: string; message: string }> = {
  400: { code: "BAD_REQUEST",      message: "Requisição inválida. Verifique os dados informados." },
  401: { code: "UNAUTHORIZED",     message: "Sessão expirada. Faça login novamente." },
  403: { code: "FORBIDDEN",        message: "Você não tem permissão para acessar este recurso." },
  404: { code: "NOT_FOUND",        message: "O recurso solicitado não foi encontrado." },
  409: { code: "CONFLICT",         message: "Conflito: este registro já existe." },
  422: { code: "VALIDATION_ERROR", message: "Dados inválidos. Verifique os campos e tente novamente." },
  429: { code: "RATE_LIMIT",       message: "Muitas tentativas. Aguarde um momento antes de tentar novamente." },
  500: { code: "SERVER_ERROR",     message: "Erro interno do servidor. Tente novamente em instantes." },
  502: { code: "BAD_GATEWAY",      message: "Serviço temporariamente indisponível." },
  503: { code: "UNAVAILABLE",      message: "Serviço indisponível no momento. Tente novamente em alguns minutos." },
  504: { code: "TIMEOUT",          message: "O servidor demorou muito para responder. Tente novamente." },
};

/**
 * Converts any thrown error (Axios, native Error, unknown) to a
 * consistent NormalizedError object safe for display in the UI.
 */
export function normalizeError(error: unknown): NormalizedError {
  // ─── Axios / Fetch response error ───────────────────────────
  if (isAxiosLike(error)) {
    const status = error.response?.status;
    const serverMessage: string | undefined =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === "string" ? error.response.data : undefined);

    const mapped = status ? HTTP_CODE_MAP[status] : undefined;

    return {
      code: mapped?.code ?? "API_ERROR",
      message: serverMessage || mapped?.message || error.message || "Erro de comunicação com o servidor.",
      status,
      field: error.response?.data?.field,
      raw: error,
    };
  }

  // ─── Network / timeout ──────────────────────────────────────
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("network") || error.message.toLowerCase().includes("timeout")) {
      return {
        code: "NETWORK_ERROR",
        message: "Sem conexão com o servidor. Verifique sua internet e tente novamente.",
        raw: error,
      };
    }

    return {
      code: "CLIENT_ERROR",
      message: error.message,
      raw: error,
    };
  }

  // ─── Unknown ────────────────────────────────────────────────
  return {
    code: "UNKNOWN_ERROR",
    message: "Ocorreu um erro inesperado. Tente novamente.",
    raw: error,
  };
}

/** Type guard for Axios-like errors */
function isAxiosLike(error: unknown): error is {
  response?: { status?: number; data?: { message?: string; error?: string; field?: string } };
  message: string;
  config?: { url?: string };
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    ("response" in error || "config" in error)
  );
}

/**
 * Extracts a user-friendly string from any error, with a fallback.
 * Returns the fallback if the error normalized to UNKNOWN_ERROR or has no message.
 */
export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado."): string {
  const normalized = normalizeError(error);
  if (normalized.code === "UNKNOWN_ERROR" || !normalized.message) return fallback;
  return normalized.message;
}
