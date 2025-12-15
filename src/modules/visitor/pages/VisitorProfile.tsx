import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export const VisitorProfile: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { name, email, logout } = useAuth();

    return (
        <div className="fade-in">
            <h1 className="page-title">{t("visitor.sidebar.profile")}</h1>
            <p className="page-subtitle">Gerencie suas informações</p>

            <div className="card" style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--primary-color)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold"
                    }}>
                        {name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{name}</h2>
                        <p style={{ margin: 0, opacity: 0.8 }}>{email}</p>
                    </div>
                </div>

                <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={() => navigate("/conquistas")}>
                        🏆 {t("visitor.achievements.title", "Conquistas")}
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate("/passaporte")}>
                        🛂 {t("visitor.passport.title", "Passaporte")}
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate("/favoritos")}>
                        ❤️ {t("visitor.favorites.title", "Favoritos")}
                    </button>

                    <button className="btn btn-logout" style={{ marginTop: "1rem" }} onClick={logout}>
                        {t("visitor.sidebar.logout")}
                    </button>
                </div>
            </div>
        </div>
    );
};
