import React from "react";
import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";

export const ProducerPlaceholder: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            textAlign: "center",
            color: "rgba(255,255,255,0.5)"
        }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "2rem", borderRadius: "50%", marginBottom: "2rem" }}>
                <Construction size={64} />
            </div>
            <h1 style={{ color: "white", marginBottom: "0.5rem" }}>{title}</h1>
            <p>Esta funcionalidade estará disponível na próxima atualização.</p>
        </div>
    );
};
