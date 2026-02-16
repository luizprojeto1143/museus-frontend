import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import {
    Building2, Save, ArrowLeft, Layers, Users,
    Monitor, CheckCircle, Wifi, Box, Loader2
} from "lucide-react";
import { Button, Input, Select, Textarea } from "../../../components/ui";

type SpaceFormData = {
    name: string;
    description: string;
    capacity: number;
    type: string;
    resources: string[];
    isBookable: boolean;
    imageUrl: string;
};

const RESOURCE_OPTIONS = [
    "Projetor", "Sistema de Som", "Ar Condicionado", "WiFi",
    "Computadores", "Quadro Branco", "Iluminação Cênica", "Camarim"
];

export const AdminSpaceForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SpaceFormData>({
        name: "",
        description: "",
        capacity: 10,
        type: "ROOM",
        resources: [],
        isBookable: true,
        imageUrl: ""
    });

    useEffect(() => {
        if (id && id !== 'new') {
            fetchSpace();
        }
    }, [id]);

    const fetchSpace = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/spaces/${id}`);
            const data = res.data;

            // Parse resources if needed (backend sends string or array depending on strictness)
            let parsedResources = [];
            if (Array.isArray(data.resources)) {
                parsedResources = data.resources;
            } else if (typeof data.resources === 'string') {
                try { parsedResources = JSON.parse(data.resources); } catch { parsedResources = []; }
            }

            setFormData({
                name: data.name,
                description: data.description || "",
                capacity: data.capacity || 10,
                type: data.type || "ROOM",
                resources: parsedResources,
                isBookable: data.isBookable ?? true,
                imageUrl: data.imageUrl || ""
            });
        } catch {
            addToast(t("common.error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                resources: formData.resources // Backend handles serialization if needed
            };

            if (id && id !== 'new') {
                await api.put(`/spaces/${id}`, payload);
                addToast(t("common.successUpdate"), "success");
            } else {
                await api.post("/spaces", payload);
                addToast(t("common.successCreate"), "success");
            }
            navigate("/admin/espacos");
        } catch {
            addToast(t("common.errorSave"), "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleResource = (res: string) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.includes(res)
                ? prev.resources.filter(r => r !== res)
                : [...prev.resources, res]
        }));
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button onClick={() => navigate(-1)} variant="ghost" className="btn-ghost w-12 h-12 rounded-full p-0 flex items-center justify-center">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="section-title">
                        {id === 'new' ? t("admin.spaces.new") : t("admin.spaces.edit")}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Card */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <Layers className="text-[#d4af37]" size={24} />
                        </div>
                        <h3 className="card-title mb-0">Informações Básicas</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 form-group">
                            <label className="form-label">Nome do Espaço</label>
                            <input
                                type="text"
                                placeholder="Ex: Sala de Ensaio 1, Auditório Principal..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="input w-full"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tipo de Ambiente</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="input w-full"
                            >
                                <option value="ROOM">Sala Multiuso</option>
                                <option value="AUDITORIUM">Auditório</option>
                                <option value="LAB">Laboratório</option>
                                <option value="STUDIO">Estúdio</option>
                                <option value="OPEN_AIR">Área Externa</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Capacidade (Pessoas)</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                className="input w-full"
                            />
                        </div>

                        <div className="md:col-span-2 form-group">
                            <label className="form-label">Descrição</label>
                            <textarea
                                placeholder="Descreva o espaço, dimensões, finalidade..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="input w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Resources Card */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <Box className="text-[#d4af37]" size={24} />
                        </div>
                        <h3 className="card-title mb-0">Recursos & Comodidades</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {RESOURCE_OPTIONS.map(res => (
                            <button
                                key={res}
                                type="button"
                                onClick={() => toggleResource(res)}
                                className={`
                    p-4 rounded-xl border text-sm font-bold text-left transition-all flex flex-col gap-2 relative overflow-hidden
                    ${formData.resources.includes(res)
                                        ? 'bg-[rgba(212,175,55,0.1)] border-[#d4af37] text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-400 hover:border-[rgba(212,175,55,0.3)]'
                                    }
                 `}
                            >
                                {formData.resources.includes(res) && (
                                    <div className="absolute top-2 right-2 text-[#d4af37]">
                                        <CheckCircle size={14} />
                                    </div>
                                )}
                                <span className="z-10">{res}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Card */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <Monitor className="text-[#d4af37]" size={24} />
                        </div>
                        <h3 className="card-title mb-0">Configurações</h3>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(255,255,255,0.05)]">
                        <div className="flex-1">
                            <h4 className="text-[#f5e6d3] font-bold mb-1">Disponível para Reserva</h4>
                            <p className="text-sm text-gray-400">Permitir que este espaço seja reservado no calendário.</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                            <input
                                type="checkbox"
                                className="peer absolute w-0 h-0 opacity-0"
                                checked={formData.isBookable}
                                onChange={e => setFormData({ ...formData, isBookable: e.target.checked })}
                            />
                            <span className={`block w-12 h-7 rounded-full transition-colors duration-300 ${formData.isBookable ? 'bg-[#22c55e]' : 'bg-gray-600'}`}></span>
                            <span className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 shadow-sm ${formData.isBookable ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-8 gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/espacos")}
                        className="btn btn-ghost"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary px-8 py-3 rounded-xl font-bold text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        {loading ? "Salvando..." : "Salvar Espaço"}
                    </button>
                </div>

            </form>
        </div>
    );
};
