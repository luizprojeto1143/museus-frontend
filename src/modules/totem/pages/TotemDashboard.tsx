import React from "react";
import { Link } from "react-router-dom";
import { QrCode, Ticket, Calendar, Search } from "lucide-react";

export const TotemDashboard: React.FC = () => {
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
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#d4af37"
                        }}>
                            <QrCode size={40} />
                        </div>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Validar Ingresso</h2>
                            <p style={{ color: "rgba(255,255,255,0.6)" }}>Escanear QR Code para entrada rápida</p>
                        </div>
                    </div>
                </Link>

                {/* Card Lista de Eventos (Manual) */}
                <Link to="/totem/eventos" style={{ textDecoration: "none" }}>
                    <div className="totem-card" style={{
                        background: "linear-gradient(145deg, #1e1e24, #15151a)",
                        border: "1px solid rgba(255,255,255,0.1)",
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
                            background: "rgba(59, 130, 246, 0.1)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#3b82f6"
                        }}>
                            <Calendar size={40} />
                        </div>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Eventos do Dia</h2>
                            <p style={{ color: "rgba(255,255,255,0.6)" }}>Ver lista de participantes e check-in manual</p>
                        </div>
                    </div>
                </Link>

                {/* Card Busca Manual (Reserva) */}
                <Link to="/totem/busca" style={{ textDecoration: "none" }}>
                    <div className="totem-card" style={{
                        background: "linear-gradient(145deg, #1e1e24, #15151a)",
                        border: "1px solid rgba(255,255,255,0.1)",
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
                            background: "rgba(16, 185, 129, 0.1)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#10b981"
                        }}>
                            <Search size={40} />
                        </div>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Busca Manual</h2>
                            <p style={{ color: "rgba(255,255,255,0.6)" }}>Buscar por nome, CPF ou código</p>
                        </div>
                    </div>
                </Link>
            </div>
            <style>{`
                .totem-card:hover {
                    transform: translateY(-5px);
                    border-color: #d4af37 !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
};
