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
                <Button onClick={() => navigate(-1)} variant="ghost" className="w-12 h-12 rounded-full p-0 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {id === 'new' ? "Novo Espaço" : "Editar Espaço"}
                    </h1>

                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Card */}
                <div className="card bg-white border border-gray-200 shadow-sm rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Layers className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Informações Básicas</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input
                                label="Nome do Espaço"
                                placeholder="Ex: Sala de Ensaio 1, Auditório Principal..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <Select
                            label="Tipo de Ambiente"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="ROOM">Sala Multiuso</option>
                            <option value="AUDITORIUM">Auditório</option>
                            <option value="LAB">Laboratório</option>
                            <option value="STUDIO">Estúdio</option>
                            <option value="OPEN_AIR">Área Externa</option>
                        </Select>

                        <Input
                            label="Capacidade (Pessoas)"
                            type="number"
                            value={formData.capacity}
                            onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                            className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        />

                        <div className="md:col-span-2">
                            <Textarea
                                label="Descrição"
                                placeholder="Descreva o espaço, dimensões, finalidade..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Resources Card */}
                <div className="card bg-white border border-gray-200 shadow-sm rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-purple-50 rounded-xl">
                            <Box className="text-purple-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Recursos & Comodidades</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {RESOURCE_OPTIONS.map(res => (
                            <button
                                key={res}
                                type="button"
                                onClick={() => toggleResource(res)}
                                className={`
                    p-4 rounded-2xl border text-sm font-bold text-left transition-all flex flex-col gap-2 relative overflow-hidden
                    ${formData.resources.includes(res)
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                                    }
                 `}
                            >
                                {formData.resources.includes(res) && (
                                    <div className="absolute top-2 right-2 text-blue-600">
                                        <CheckCircle size={14} />
                                    </div>
                                )}
                                <span className="z-10">{res}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Card */}
                <div className="card bg-white border border-gray-200 shadow-sm rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <Monitor className="text-green-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Configurações</h3>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex-1">
                            <h4 className="text-gray-900 font-bold mb-1">Disponível para Reserva</h4>
                            <p className="text-sm text-gray-500">Permitir que este espaço seja reservado no calendário.</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                            <input
                                type="checkbox"
                                className="peer absolute w-0 h-0 opacity-0"
                                checked={formData.isBookable}
                                onChange={e => setFormData({ ...formData, isBookable: e.target.checked })}
                            />
                            <span className={`block w-12 h-7 rounded-full transition-colors duration-300 ${formData.isBookable ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 shadow-sm ${formData.isBookable ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate("/admin/espacos")}
                        className="mr-4 text-gray-500 hover:text-gray-900"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 btn-primary"
                        leftIcon={loading ? <Loader2 className="animate-spin" /> : <Save />}
                    >
                        {loading ? "Salvando..." : "Salvar Espaço"}
                    </Button>
                </div>

            </form>
        </div>
    );
};
