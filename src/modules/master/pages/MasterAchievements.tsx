import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { Trophy, PlusCircle, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import "./MasterShared.css";

interface Tenant {
    id: string;
    name: string;
}

interface Achievement {
    id: string;
    code: string;
    title: string;
    description: string;
    imageUrl?: string;
}

export const MasterAchievements: React.FC = () => {
    const { t } = useTranslation();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>("");
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);

    const loadTenants = useCallback(async () => {
        try {
            const res = await api.get("/tenants");
            setTenants(res.data);
            if (res.data.length > 0) {
                setSelectedTenantId(res.data[0].id);
            }
        } catch (err) {
            console.error("Erro ao carregar tenants", err);
            alert(t("master.achievements.errorLoad"));
        }
    }, [t]);

    const loadAchievements = useCallback(async (tenantId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/achievements?tenantId=${tenantId}`);
            setAchievements(res.data);
        } catch (err) {
            console.error("Erro ao carregar conquistas", err);
            alert(t("master.achievements.errorLoad"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadTenants();
    }, [loadTenants]);

    useEffect(() => {
        if (selectedTenantId) {
            loadAchievements(selectedTenantId);
        } else {
            setAchievements([]);
        }
    }, [selectedTenantId, loadAchievements]);

    const handleDelete = async (id: string) => {
        if (!confirm(t("master.achievements.confirmDelete"))) return;
        try {
            await api.delete(`/achievements/${id}`);
            if (selectedTenantId) loadAchievements(selectedTenantId);
        } catch (err) {
            console.error("Erro ao excluir", err);
            alert(t("master.achievements.errorDelete"));
        }
    };

    return (
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero">
                <div className="master-hero-content">
                    <span className="master-badge">
                        🏆 Gamificação
                    </span>
                    <h1 className="master-title">
                        Conquistas e Medalhas
                    </h1>
                    <p className="master-subtitle">
                        Gerencie as recompensas, conquistas e medalhas que os visitantes podem desbloquear.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
                        <Link to={`/master/achievements/novo?tenantId=${selectedTenantId}`}>
                            <button className="master-btn btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                                <PlusCircle size={18} />
                                {t("master.achievements.new")}
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FILTER CARD */}
            <div className="master-card" style={{ marginBottom: "2rem" }}>
                <div className="master-form">
                    <div className="master-input-group">
                        <label>{t("master.achievements.selectTenant")}</label>
                        <select
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value)}
                            style={{ maxWidth: '400px' }}
                        >
                            <option value="">{t("master.achievements.select")}</option>
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="master-card">
                    <p style={{ textAlign: "center", color: "#94a3b8" }}>{t("master.achievements.loading")}</p>
                </div>
            ) : achievements.length === 0 ? (
                <div className="master-card" style={{ textAlign: "center", padding: "4rem" }}>
                    <div className="master-icon-wrapper master-icon-yellow" style={{ margin: "0 auto 1.5rem auto" }}>
                        <Trophy size={32} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", color: "#fff", marginBottom: "0.5rem" }}>Nenhuma conquista encontrada</h3>
                    <p className="master-card-desc" style={{ marginBottom: 0 }}>
                        {t("master.achievements.empty")}
                    </p>
                </div>
            ) : (
                <div className="master-grid-3">
                    {achievements.map((ach) => (
                        <article key={ach.id} className="master-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <div className="master-badge" style={{ margin: 0, fontSize: "0.75rem" }}>
                                    {ach.code}
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Link to={`/master/achievements/${ach.id}`}>
                                        <button className="master-btn btn-outline" style={{ padding: "0.4rem", width: "auto", marginTop: 0 }}>
                                            <Edit size={14} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(ach.id)}
                                        className="master-btn btn-danger"
                                        style={{ padding: "0.4rem", width: "auto", marginTop: 0 }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1rem", marginBottom: "1rem" }}>
                                {ach.imageUrl ? (
                                    <img
                                        src={ach.imageUrl.startsWith("http") ? ach.imageUrl : `${import.meta.env.VITE_API_URL}${ach.imageUrl}`}
                                        alt={ach.title}
                                        style={{ width: "80px", height: "80px", objectFit: "contain", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "0.5rem" }}
                                    />
                                ) : (
                                    <div className="master-icon-wrapper master-icon-yellow" style={{ width: "80px", height: "80px", borderRadius: "50%" }}>
                                        <Trophy size={40} />
                                    </div>
                                )}

                                <div>
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#fff" }}>{ach.title}</h3>
                                    <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.4" }}>
                                        {ach.description}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};
