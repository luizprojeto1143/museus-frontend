import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";

interface Tenant {
    id: string;
    name: string;
}

interface Achievement {
    id: string;
    code: string;
    title: string;
    description: string;
}

export const MasterAchievements: React.FC = () => {
    const { t } = useTranslation();
    // const navigate = useNavigate(); // Unused
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
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">{t("master.achievements.title")}</h1>
                <Link
                    to={`/master/achievements/novo?tenantId=${selectedTenantId}`}
                    className="btn btn-primary"
                >
                    + {t("master.achievements.new")}
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("master.achievements.selectTenant")}
                </label>
                <select
                    className="form-input w-full md:w-1/2"
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                >
                    <option value="">{t("master.achievements.select")}</option>
                    {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-500">{t("master.achievements.loading")}</div>
            ) : achievements.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">{t("master.achievements.empty")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((ach) => (
                        <div key={ach.id} className="bg-white p-4 rounded-lg shadow border border-slate-100 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded uppercase">
                                    {ach.code}
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/master/achievements/${ach.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        {t("master.achievements.edit")}
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(ach.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        {t("master.achievements.delete")}
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{ach.title}</h3>
                            <p className="text-slate-600 text-sm flex-1">{ach.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
