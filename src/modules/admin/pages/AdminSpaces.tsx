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
        <div className="admin-page animate-fadeIn">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">
                        {t("admin.spaces.title", "Gestão de Espaços")}
                    </h1>
                    <p className="section-subtitle">
                        {t("admin.spaces.subtitle", "Gerencie salas, auditórios e estúdios do centro cultural.")}
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/admin/espacos/novo")}
                    className="btn btn-primary"
                    leftIcon={<Plus size={20} />}
                >
                    {t("admin.spaces.add", "Novo Espaço")}
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t("common.search", "Buscar espaços...")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input w-full pl-12"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : filteredSpaces.length === 0 ? (
                <div className="text-center p-20 bg-gray-50/5 rounded-3xl border border-gray-200 border-dashed">
                    <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-500">
                        {t("admin.spaces.empty", "Nenhum espaço cadastrado")}
                    </h3>
                    <p className="text-gray-400 mt-2 mb-6">Comece adicionando seu primeiro ambiente.</p>
                    <Button onClick={() => navigate("/admin/espacos/novo")} variant="outline">
                        Adicionar Espaço
                    </Button>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Capacidade</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSpaces.map(space => (
                            <tr key={space.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                            <MapPin size={16} />
                                        </div>
                                        <span className="font-semibold">{space.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="chip">
                                        {space.type}
                                    </span>
                                </td>
                                <td>{space.capacity} pessoas</td>
                                <td>
                                    <span className={`chip ${space.isBookable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                        {space.isBookable ? 'Reservável' : 'Interno'}
                                    </span>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/espacos/${space.id}`)}
                                            className="btn btn-sm btn-secondary"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(space.id)}
                                            className="btn btn-sm btn-secondary hover:text-red-500 hover:border-red-500"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
