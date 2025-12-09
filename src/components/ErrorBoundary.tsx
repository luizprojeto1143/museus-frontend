import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                    color: "#1f2937"
                }}>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Ops! Algo deu errado.</h1>
                    <p style={{ marginBottom: "2rem", color: "#4b5563" }}>
                        Desculpe pelo inconveniente. Tente recarregar a página.
                    </p>
                    {this.state.error && (
                        <details style={{ marginBottom: "2rem", textAlign: "left", maxWidth: "600px", overflow: "auto", background: "#e5e7eb", padding: "1rem", borderRadius: "0.5rem" }}>
                            <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>Ver detalhes do erro</summary>
                            <pre style={{ fontSize: "0.8rem" }}>{this.state.error.toString()}</pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            fontSize: "1rem"
                        }}
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
