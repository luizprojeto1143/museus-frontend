import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { Trophy, Upload, ArrowLeft, Save, Building2, Tag, FileText, ImageIcon } from "lucide-react";
import "./MasterShared.css";

interface Tenant {
    id: string;
    name: string;
}

export const MasterAchievementForm: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const initialTenantId = searchParams.get("tenantId") || "";

    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        tenantId: initialTenantId,
        code: "",
        title: "",
        description: "",
        imageUrl: ""
    });

    const isEditing = !!id;

    const loadTenants = useCallback(async () => {
        try {
            const res = await api.get("/tenants");
            setTenants(res.data);
        } catch (err) {
            console.error("Erro ao carregar tenants", err);
        }
    }, []);

    const loadAchievement = useCallback(async (achievementId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/achievements/${achievementId}`);
            setFormData({
                tenantId: res.data.tenantId,
                code: res.data.code,
                title: res.data.title,
                description: res.data.description || "",
                imageUrl: res.data.imageUrl || ""
            });
        } catch (err) {
            console.error("Erro ao carregar conquista", err);
            alert(t("master.achievements.errorLoad"));
            navigate("/master/achievements");
        } finally {
            setLoading(false);
        }
    }, [navigate, t]);

    useEffect(() => {
        loadTenants();
        if (isEditing && id) {
            loadAchievement(id);
        }
    }, [id, isEditing, loadTenants, loadAchievement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tenantId) {
            alert(t("master.achievements.form.selectTenantAlert"));
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                await api.put(`/achievements/${id}`, formData);
            } else {
                await api.post("/achievements", formData);
            }
            navigate("/master/achievements");
        } catch (err) {
            console.error("Erro ao salvar", err);
            alert(t("master.achievements.form.errorSave"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="master-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#94a3b8' }}>{t("master.achievements.loading")}</p>
            </div>
        );
    }

    return (
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero" style={{ padding: '2rem 1rem', marginBottom: '2rem' }}>
                <div className="master-hero-content">
                    <button
                        onClick={() => navigate('/master/achievements')}
                        className="master-btn btn-outline"
                        style={{ width: 'auto', position: 'absolute', top: '1rem', left: '1rem', marginTop: 0, padding: '0.5rem 1rem' }}
                    >
                        <ArrowLeft size={16} />
                        {t("common.back")}
                    </button>

                    <span className="master-badge">
                        {isEditing ? '✏️ Editar Conquista' : '✨ Nova Conquista'}
                    </span>
                    <h1 className="master-title">
                        {isEditing ? formData.title : t("master.achievements.form.newTitle")}
                    </h1>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="master-card" style={{ maxWidth: 800, margin: '0 auto' }}>

                <div className="master-card-header">
                    <div className="master-icon-wrapper master-icon-yellow">
                        <Trophy size={24} />
                    </div>
                    <h3>Detalhes da Medalha</h3>
                </div>

                <div className="master-form">
                    <div className="master-input-group">
                        <label>{t("master.achievements.form.tenant")}</label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
                            <select
                                value={formData.tenantId}
                                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                disabled={isEditing}
                                required
                                style={{ paddingLeft: '2.5rem' }}
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

                    <div className="master-grid-2">
                        <div className="master-input-group">
                            <label>{t("master.achievements.form.code")}</label>
                            <div style={{ position: 'relative' }}>
                                <Tag size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder={t("master.achievements.form.codePlaceholder")}
                                    required
                                    style={{ paddingLeft: '2.5rem', textTransform: 'uppercase' }}
                                />
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                                {t("master.achievements.form.codeHelp")}
                            </p>
                        </div>

                        <div className="master-input-group">
                            <label>{t("master.achievements.form.title")}</label>
                            <div style={{ position: 'relative' }}>
                                <Trophy size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t("master.achievements.form.titlePlaceholder")}
                                    required
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="master-input-group">
                        <label>{t("master.achievements.form.description")}</label>
                        <div style={{ position: 'relative' }}>
                            <FileText size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
                            <textarea
                                className="master-input"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t("master.achievements.form.descriptionPlaceholder")}
                                style={{
                                    paddingLeft: '2.5rem',
                                    width: '100%',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <div className="master-input-group">
                        <label>{t("master.achievements.form.imageUrl")}</label>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                                    <ImageIcon size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
                                    <input
                                        type="text"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder={t("master.achievements.form.imageUrlPlaceholder")}
                                        style={{ paddingLeft: '2.5rem', width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', color: '#fff', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <label className="master-btn btn-outline" style={{ cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}>
                                    <Upload size={16} />
                                    {t("master.achievements.form.upload")}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const uploadData = new FormData();
                                            uploadData.append("file", file);

                                            try {
                                                const res = await api.post("/upload/image", uploadData, {
                                                    headers: { "Content-Type": "multipart/form-data" }
                                                });
                                                setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
                                            } catch (err) {
                                                console.error("Upload error", err);
                                                alert(t("master.achievements.form.errorUpload"));
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {formData.imageUrl && (
                                <div style={{ width: '100px', height: '100px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img
                                        src={formData.imageUrl.startsWith("http") ? formData.imageUrl : `${import.meta.env.VITE_API_URL}${formData.imageUrl}`}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
                                        onError={(e) => {
                                            // Optional: Handle error
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
                    <button
                        type="submit"
                        className="master-btn btn-primary"
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? t("master.achievements.form.saving") : t("common.save")}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/master/achievements")}
                        className="master-btn btn-secondary"
                        style={{ border: '1px solid #334155', color: '#94a3b8' }}
                    >
                        {t("common.cancel")}
                    </button>
                </div>
            </form>
        </div>
    );
};
