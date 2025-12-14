import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface VisitorDetail {
    id: string;
    name: string;
    email: string;
    age?: number;
    xp: number;
    photoUrl?: string;
    createdAt: string;
    visits: {
        id: string;
        work?: { title: string };
        trail?: { title: string };
        event?: { title: string };
        createdAt: string;
        xpGained: number;
    }[];
    achievements: {
        id: string;
        unlockedAt: string;
        achievement: {
            title: string;
            iconUrl?: string;
            xpReward: number;
        };
    }[];
}

export const AdminVisitorProfile: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [visitor, setVisitor] = useState<VisitorDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && tenantId) {
            api.get(`/visitors/${id}`)
                .then(res => setVisitor(res.data))
                .catch(err => {
                    console.error("Erro ao carregar visitante", err);
                    alert(t("common.errorLoad"));
                    navigate("/admin/visitantes");
                })
                .finally(() => setLoading(false));
        }
    }, [id, tenantId, navigate, t]);

    if (loading) return <p>{t("common.loading")}</p>;
    if (!visitor) return null;

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button onClick={() => navigate("/admin/visitantes")} className="btn btn-secondary">
                    ← {t("common.back")}
                </button>
                <h1 className="section-title">{visitor.name || t("common.anonymous")}</h1>
            </div>

            <div className="card-grid" style={{ marginBottom: "2rem" }}>
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                background: visitor.photoUrl ? `url(${visitor.photoUrl}) center/cover` : "#ccc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2rem"
                            }}
                        >
                            {!visitor.photoUrl && "👤"}
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>{visitor.name}</h3>
                            <p style={{ margin: 0, color: "var(--text-secondary)" }}>{visitor.email}</p>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t("admin.visitors.table.age")}</label>
                            <p style={{ fontWeight: "bold" }}>{visitor.age || "-"}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t("admin.visitors.table.xp")}</label>
                            <p style={{ fontWeight: "bold", color: "#d4af37" }}>{visitor.xp} XP</p>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t("common.createdAt")}</label>
                            <p>{new Date(visitor.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">🏆 {t("admin.sidebar.achievements")}</h3>
                    {visitor.achievements.length === 0 ? (
                        <p style={{ color: "var(--text-secondary)" }}>{t("common.noData")}</p>
                    ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {visitor.achievements.map(a => (
                                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", background: "rgba(0,0,0,0.05)", borderRadius: "0.5rem" }}>
                                    <span style={{ fontSize: "1.2rem" }}>{a.achievement.iconUrl ? <img src={a.achievement.iconUrl} style={{ width: 24, height: 24 }} /> : "🏅"}</span>
                                    <div>
                                        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{a.achievement.title}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{new Date(a.unlockedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">📅 {t("admin.visitors.history")}</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t("common.date")}</th>
                            <th>{t("common.activity")}</th>
                            <th>XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitor.visits.map(visit => (
                            <tr key={visit.id}>
                                <td>{new Date(visit.createdAt).toLocaleString()}</td>
                                <td>
                                    {visit.work && `Obra: ${visit.work.title}`}
                                    {visit.trail && `Trilha: ${visit.trail.title}`}
                                    {visit.event && `Evento: ${visit.event.title}`}
                                </td>
                                <td style={{ color: "#10b981" }}>+{visit.xpGained}</td>
                            </tr>
                        ))}
                        {visitor.visits.length === 0 && (
                            <tr>
                                <td colSpan={3} style={{ textAlign: "center" }}>{t("common.noData")}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
