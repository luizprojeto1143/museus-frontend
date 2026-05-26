import { useTranslation } from "react-i18next";
import React from "react";
import { Link } from "react-router-dom";
import { QrCode, Ticket, Calendar, Search } from "lucide-react";

export const TotemDashboard: React.FC = () => {
  const { t } = useTranslation();
    return (
        <div style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
        }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "2rem",
                maxWidth: "1000px",
                width: "100%"
            }}>
                {/* Card Validação Rápida */}
                <Link to="/totem/validar" style={{ textDecoration: "none" }}>
                    <div className="totem-card" style={{
                        background: "linear-gradient(145deg, #1e1e24, #15151a)",
                        border: "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "20px",
                        padding: "3rem",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1.5rem"
                    }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            background: "rgba(212,175,55,0.1)",
                            borderRadius: "50%",
                            display: "flex",
                    border-color: var(--accent-primary) !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
};
