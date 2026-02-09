import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { Trophy, Upload, ArrowLeft, Save, Building2, Tag, FileText, ImageIcon } from "lucide-react";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
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
    const { addToast } = useToast();
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
            addToast(t("master.achievements.errorLoad"), "error");
            navigate("/master/achievements");
        } finally {
            setLoading(false);
        }
    }, [navigate, t, addToast]);

    useEffect(() => {
        loadTenants();
        if (isEditing && id) {
            loadAchievement(id);
        }
    }, [id, isEditing, loadTenants, loadAchievement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tenantId) {
            addToast(t("master.achievements.form.selectTenantAlert"), "info");
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                await api.put(`/achievements/${id}`, formData);
                addToast("Conquista atualizada com sucesso!", "success");
            } else {
                await api.post("/achievements", formData);
                addToast("Conquista criada com sucesso!", "success");
            }
            navigate("/master/achievements");
        } catch (err) {
            console.error("Erro ao salvar", err);
            addToast(t("master.achievements.form.errorSave"), "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="master-page-container flex justify-center items-center">
                <p className="text-slate-400">{t("master.achievements.loading")}</p>
            </div>
        );
    }

    return (
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero" style={{ padding: '2rem 1rem', marginBottom: '2rem', position: 'relative' }}>
                <div className="master-hero-content">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/master/achievements')}
                        className="absolute top-4 left-4 w-auto h-auto py-2 px-4 text-xs"
                        leftIcon={<ArrowLeft size={16} />}
                    >
                        {t("common.back")}
                    </Button>

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

                <div className="master-form space-y-4">
                    <Select
                        label={t("master.achievements.form.tenant")}
                        value={formData.tenantId}
                        onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                        disabled={isEditing}
                        required
                        leftIcon={<Building2 size={16} />}
                    >
                        <option value="">{t("master.achievements.select")}</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={t("master.achievements.form.code")}
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder={t("master.achievements.form.codePlaceholder")}
                            required
                            leftIcon={<Tag size={16} />}
                            helperText={t("master.achievements.form.codeHelp")}
                            style={{ textTransform: 'uppercase' }}
                        />

                        <Input
                            label={t("master.achievements.form.title")}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t("master.achievements.form.titlePlaceholder")}
                            required
                            leftIcon={<Trophy size={16} />}
                        />
                    </div>

                    <Textarea
                        label={t("master.achievements.form.description")}
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t("master.achievements.form.descriptionPlaceholder")}
                        className="w-full"
                    />

                    <div className="space-y-4">
                        <Input
                            label={t("master.achievements.form.imageUrl")}
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder={t("master.achievements.form.imageUrlPlaceholder")}
                            leftIcon={<ImageIcon size={16} />}
                        />

                        <div className="flex gap-4 items-center">
                            <label className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    as="span"
                                    className="w-full cursor-pointer"
                                    leftIcon={<Upload size={16} />}
                                >
                                    {t("master.achievements.form.upload")}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
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
                                                addToast("Imagem enviada com sucesso!", "success");
                                            } catch (err) {
                                                console.error("Upload error", err);
                                                addToast(t("master.achievements.form.errorUpload"), "error");
                                            }
                                        }}
                                    />
                                </Button>
                            </label>

                            {formData.imageUrl && (
                                <div className="w-24 h-24 bg-black/20 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 p-2">
                                    <img
                                        src={formData.imageUrl.startsWith("http") ? formData.imageUrl : `${import.meta.env.VITE_API_URL}${formData.imageUrl}`}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={saving}
                        leftIcon={<Save size={18} />}
                    >
                        {saving ? t("master.achievements.form.saving") : t("common.save")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/master/achievements")}
                        className="flex-1 border-white/10 text-slate-400"
                    >
                        {t("common.cancel")}
                    </Button>
                </div>
            </form>
        </div>
    );
};
