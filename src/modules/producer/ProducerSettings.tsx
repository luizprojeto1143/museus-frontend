import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, Bell, Lock, User, Globe } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";

export const ProducerSettings: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        publicProfile: true,
        language: "pt-BR",
        twoFactor: false
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put("/users/me/settings", {
                preferences: settings
            });
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Error saving settings", error);
            alert("Erro ao salvar configurações");
        } finally {
            setLoading(false);
        }
    };

    // Load initial settings
    React.useEffect(() => {
        api.get("/auth/me").then(res => {
            if (res.data.preferences) {
                setSettings(prev => ({ ...prev, ...res.data.preferences }));
            }
        }).catch(console.error);
    }, []);

    return (
        <div className="producer-settings" style={{ paddingBottom: "4rem" }}>
            <h1 style={{ fontSize: "2rem", color: "#d4af37", marginBottom: "0.5rem" }}>Configurações</h1>
            <p style={{ opacity: 0.7, marginBottom: "2rem" }}>Gerencie suas preferências de conta e privacidade.</p>

            <div style={{ display: "grid", gap: "2rem" }}>

                {/* Notifications Section */}
                <section style={{ background: "#1e1e24", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                        <Bell size={20} color="#d4af37" /> Notificações
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span>Receber atualizações de projetos por e-mail</span>
                        <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            style={{ width: "20px", height: "20px" }}
                        />
                    </div>
                </section>

                {/* Privacy Section */}
                <section style={{ background: "#1e1e24", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                        <Globe size={20} color="#d4af37" /> Privacidade
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0" }}>
                        <span>Perfil Público visível na plataforma</span>
                        <input
                            type="checkbox"
                            checked={settings.publicProfile}
                            onChange={e => setSettings({ ...settings, publicProfile: e.target.checked })}
                            style={{ width: "20px", height: "20px" }}
                        />
                    </div>
                </section>

                {/* Security Section */}
                <section style={{ background: "#1e1e24", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                        <Lock size={20} color="#d4af37" /> Segurança
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0" }}>
                        <span>Ativar Autenticação de Dois Fatores (2FA)</span>
                        <input
                            type="checkbox"
                            checked={settings.twoFactor}
                            onChange={e => setSettings({ ...settings, twoFactor: e.target.checked })}
                            style={{ width: "20px", height: "20px" }}
                        />
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                        <button style={{ background: "transparent", border: "1px solid #d4af37", color: "#d4af37", padding: "0.5rem 1rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                            Alterar Senha
                        </button>
                    </div>
                </section>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-premium"
                        style={{
                            background: "#d4af37",
                            color: "#000",
                            border: "none",
                            padding: "1rem 2rem",
                            borderRadius: "0.5rem",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: loading ? "wait" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        <Save size={20} /> {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>

            </div>
        </div>
    );
};
