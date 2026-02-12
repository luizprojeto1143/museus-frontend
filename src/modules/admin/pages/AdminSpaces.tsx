import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import {
    Building2, Plus, Edit2, Trash2, Users, MapPin,
    Settings, Loader2, Search, Filter
} from "lucide-react";
import { Button, Input } from "../../../components/ui";

type Space = {
    id: string;
    name: string;
    type: string;
    capacity: number;
    isBookable: boolean;
};

export const AdminSpaces: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchSpaces();
    }, []);

    const fetchSpaces = async () => {
        try {
            setLoading(true);
            const res = await api.get("/spaces");
            setSpaces(res.data);
        } catch {
            addToast(t("common.error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t("common.confirmDelete"))) return;
        try {
            await api.delete(`/spaces/${id}`);
            addToast(t("common.successDelete"), "success");
            setSpaces(spaces.filter(s => s.id !== id));
        } catch {
            addToast(t("common.errorDelete"), "error");
        }
    };

    const filteredSpaces = spaces.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page animate-fadeIn space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                            <Building2 size={24} />
                        </div>
                        {t("admin.spaces.title", "Gestão de Espaços")}
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        {t("admin.spaces.subtitle", "Gerencie salas, auditórios e estúdios do centro cultural.")}
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/admin/espacos/novo")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                    leftIcon={<Plus size={20} />}
                >
                    {t("admin.spaces.add", "Novo Espaço")}
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder={t("common.search", "Buscar espaços...")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-slate-400 hover:text-white px-6 rounded-2xl">
                    <Filter size={20} />
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : filteredSpaces.length === 0 ? (
                <div className="text-center p-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <Building2 size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">
                        {t("admin.spaces.empty", "Nenhum espaço cadastrado")}
                    </h3>
                    <p className="text-slate-500 mt-2 mb-6">Comece adicionando seu primeiro ambiente.</p>
                    <Button onClick={() => navigate("/admin/espacos/novo")} variant="outline">
                        Adicionar Espaço
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpaces.map(space => (
                        <div key={space.id} className="group bg-[#0f172a] hover:bg-[#1e293b] border border-white/5 hover:border-blue-500/30 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => navigate(`/admin/espacos/${space.id}`)}
                                    className="p-2 bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl text-slate-400 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(space.id)}
                                    className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded-xl text-slate-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{space.name}</h3>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 border border-white/10 px-2 py-0.5 rounded bg-white/5">
                                    {space.type}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-slate-400 bg-black/20 p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-slate-500" />
                                    <span>Capacidade: <strong className="text-white">{space.capacity}</strong></span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs font-bold ${space.isBookable ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                    {space.isBookable ? 'Reservável' : 'Interno'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
