import { api } from "../api/client";

interface FrontendErrorPayload {
  message: string;
  stack?: string;
  path?: string;
  metadata?: any;
}

export async function reportFrontendError(payload: FrontendErrorPayload) {
  try {
    await api.post("/monitoring/frontend-error", {
      message: payload.message,
      stack: payload.stack,
      path: payload.path || window.location.pathname,
      metadata: payload.metadata || {}
    });
  } catch (error) {
    // Fail silently in the console to avoid infinite loops if error reporting fails
    console.error("Failed to report frontend error:", error);
  }
}
