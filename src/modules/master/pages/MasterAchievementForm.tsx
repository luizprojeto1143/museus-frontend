import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";

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

    if (loading) return <div className="p-8 text-center">{t("master.achievements.loading")}</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">
                {isEditing ? t("master.achievements.form.editTitle") : t("master.achievements.form.newTitle")}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("master.achievements.form.tenant")}</label>
                    <select
                        className="form-input w-full"
                        value={formData.tenantId}
                        onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                        disabled={isEditing} // Usually we don't move achievements between tenants
                        required
                    >
                        <option value="">{t("master.achievements.select")}</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("master.achievements.form.code")}</label>
                    <input
                        type="text"
                        className="form-input w-full uppercase"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder={t("master.achievements.form.codePlaceholder")}
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        {t("master.achievements.form.codeHelp")}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("master.achievements.form.title")}</label>
                    <input
                        type="text"
                        className="form-input w-full"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={t("master.achievements.form.titlePlaceholder")}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("master.achievements.form.description")}</label>
                    <textarea
                        className="form-textarea w-full"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t("master.achievements.form.descriptionPlaceholder")}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("master.achievements.form.imageUrl")}</label>

                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="form-input flex-1"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder={t("master.achievements.form.imageUrlPlaceholder")}
                        />
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const uploadData = new FormData();
                                    uploadData.append("file", file);

                                    try {
                                        // Show loading state if needed
                                        const res = await api.post("/upload/image", uploadData, {
                                            headers: { "Content-Type": "multipart/form-data" }
                                        });
                                        // Assuming backend returns { url: "..." }
                                        // We need to prepend API URL if it's a relative path, or backend returns full path
                                        // Based on upload.ts: returns { url: "/uploads/..." } or full R2 URL
                                        // If it's relative, we might need to handle it. 
                                        // But usually we store the relative path or full URL. 
                                        // Let's assume the frontend can handle whatever is returned or we prepend API_URL if needed.
                                        // For now, just setting what backend returns.

                                        // If backend returns relative path like /uploads/..., we might want to prepend the base URL for display
                                        // But for storage, we keep it as is? 
                                        // Let's just set it.

                                        // Actually, if it's local upload, it returns /uploads/filename.
                                        // We need to make sure the API serves this static folder.
                                        // Assuming backend serves /uploads.

                                        const url = res.data.url;
                                        if (url.startsWith("/uploads")) {
                                            // Make it a full URL for the frontend to display immediately
                                            // const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
                                            // url = `${apiUrl}${url}`;
                                            // Actually, let's just keep the relative path if the image component handles it, 
                                            // OR store the full URL if we want to be safe.
                                            // Let's store the relative path and let the Image component handle it?
                                            // No, let's try to store the full URL if possible, or just what the backend gave.
                                            // The user can edit it if they want.
                                        }

                                        setFormData(prev => ({ ...prev, imageUrl: url }));
                                    } catch (err) {
                                        console.error("Upload error", err);
                                        alert(t("master.achievements.form.errorUpload"));
                                    }
                                }}
                            />
                            <label
                                htmlFor="file-upload"
                                className="btn btn-secondary cursor-pointer"
                            >
                                {t("master.achievements.form.upload")}
                            </label>
                        </div>
                    </div>
                    {formData.imageUrl && (
                        <div className="mt-2">
                            <img
                                src={formData.imageUrl.startsWith("http") ? formData.imageUrl : `${import.meta.env.VITE_API_URL}${formData.imageUrl}`}
                                alt="Preview"
                                className="h-16 w-16 object-cover rounded border"
                                onError={() => {
                                    // Fallback if image fails to load (e.g. if it's a relative path but we didn't prepend API URL correctly)
                                    // (e.target as HTMLImageElement).src = 'placeholder.png';
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/master/achievements")}
                        className="btn btn-secondary"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? t("master.achievements.form.saving") : t("common.save")}
                    </button>
                </div>
            </form>
        </div>
    );
};
