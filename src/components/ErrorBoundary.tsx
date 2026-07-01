import React, { Component, ErrorInfo, ReactNode } from "react";
import { reportFrontendError } from "../utils/reportError";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error boundary exception:", error, errorInfo);
    
    reportFrontendError({
      message: error.message || String(error),
      stack: error.stack,
      path: window.location.pathname,
      metadata: {
        componentStack: errorInfo.componentStack
      }
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030201] text-[#f7f3ed] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic text-white">Ops! Algo deu errado.</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Um erro inesperado aconteceu. O erro já foi reportado automaticamente para nossa equipe de engenharia analisar.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-black italic rounded-xl transition-all"
            >
              Recarregar Plataforma
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
