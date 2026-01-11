import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import "./DialerModal.css";

interface DialerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DialerModal: React.FC<DialerModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setCode("");
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    const handleDigit = (digit: string) => {
        if (code.length < 6) {
            setCode((prev) => prev + digit);
            setError(null);
        }
    };

    const handleBackspace = () => {
        setCode((prev) => prev.slice(0, -1));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!code) return;
        setLoading(true);
        setError(null);

        try {
            const baseUrl = import.meta.env.VITE_API_URL as string;
            // Usar a rota pública de QR
            const res = await fetch(`${baseUrl}/qr/${code}`);

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error(t("visitor.dialer.notFound", "Código não encontrado"));
                }
                throw new Error(t("common.error"));
            }

            const data = await res.json();

            // Verificar se pertence ao tenant atual (opcional, mas bom para segurança)
            if (data.tenantId !== tenantId) {
                throw new Error(t("visitor.dialer.invalidTenant", "Código de outro museu"));
            }

            // Redirecionar baseado no tipo
            onClose();
            if (data.type === "WORK") navigate(`/obras/${data.referenceId}`);
            else if (data.type === "TRAIL") navigate(`/trilhas/${data.referenceId}`);
            else if (data.type === "EVENT") navigate(`/eventos/${data.referenceId}`);
            else navigate("/"); // Fallback

        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="dialer-overlay" onClick={onClose}>
            <div className="dialer-container" onClick={(e) => e.stopPropagation()}>
                <div className="dialer-header">
                    <h3>{t("visitor.dialer.title", "Digite o código")}</h3>
                    <button className="dialer-close" onClick={onClose}>×</button>
                </div>

                <div className="dialer-display">
                    <span className={`dialer-code ${!code ? "placeholder" : ""}`}>
                        {code || "---"}
                    </span>
                </div>

                {error && <div className="dialer-error">{error}</div>}

                <div className="dialer-keypad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            className="dialer-key"
                            onClick={() => handleDigit(num.toString())}
                        >
                            {num}
                        </button>
                    ))}
                    <button className="dialer-key action" onClick={handleBackspace}>⌫</button>
                    <button className="dialer-key" onClick={() => handleDigit("0")}>0</button>
                    <button
                        className="dialer-key action confirm"
                        onClick={handleSubmit}
                        disabled={loading || !code}
                    >
                        {loading ? "..." : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
};
