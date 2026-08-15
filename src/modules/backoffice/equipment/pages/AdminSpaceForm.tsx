import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../../api/client";
import { useToast } from "../../../../contexts/ToastContext";
import { Save, ArrowLeft, Layers, Monitor, CheckCircle2, Box, Loader2, Camera, Upload, Building2, Users, FileText, Check, Sparkles } from "lucide-react";
import { Button, Card, Badge, AnimateIn } from "@/components/ui";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";
import { z } from "zod";

const spaceTypes = ["ROOM", "AUDITORIUM", "LAB", "STUDIO", "OPEN_AIR"] as const;
type SpaceType = typeof spaceTypes[number];

type SpaceFormData = {
    name: string;
    description: string;
    capacity: number;
    type: SpaceType;
    resources: string[];
    isBookable: boolean;
    imageUrl: string;
};

interface SpaceResponse extends Partial<Omit<SpaceFormData, "resources">> {
    id: string;
    resources?: string[] | string;
}

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

const spaceSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome do espaço."),
    description: z.string().trim().optional().default(""),
    capacity: z.number().int().min(0, "A capacidade não pode ser negativa."),
    type: z.enum(spaceTypes),
    resources: z.array(z.string()),
    isBookable: z.boolean(),
    imageUrl: z.string().trim().url("Informe uma URL válida para a imagem.").or(z.literal(""))
});

function getApiErrorMessage(err: unknown, fallback: string) {
    if (isAxiosError<ApiErrorResponse>(err)) {
        return err.response?.data?.message || err.response?.data?.error || fallback;
    }
    return fallback;
}

function parseResources(resources: SpaceResponse["resources"]): string[] {
    if (Array.isArray(resources)) return resources.filter((item): item is string => typeof item === "string");
    if (typeof resources !== "string") return [];
    try {
        const parsed: unknown = JSON.parse(resources);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}

const RESOURCE_OPTIONS = [
    { name: "Projetor HD", category: "Vídeo" },
    { name: "Sistema de Som", category: "Áudio" },
    { name: "Ar Condicionado", category: "Conforto" },
    { name: "WiFi Alta Velocidade", category: "Rede" },
    { name: "Computadores", category: "TI" },
    { name: "Quadro Branco", category: "Didático" },
    { name: "Iluminação Cênica", category: "Palco" },
    { name: "Camarim", category: "Bastidores" }
];

export const AdminSpaceForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
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
            setFetching(true);
            const res = await api.get<SpaceResponse>(`/spaces/${id}`);
            const data = res.data;

            setFormData({
                name: data.name || "",
                description: data.description || "",
                capacity: data.capacity || 10,
                type: spaceTypes.includes(data.type as SpaceType) ? data.type as SpaceType : "ROOM",
                resources: parseResources(data.resources),
                isBookable: data.isBookable ?? true,
                imageUrl: data.imageUrl || ""
            });
        } catch (err: unknown) {
            addToast(getApiErrorMessage(err, "Falha ao carregar os dados do espaço."), "error");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const validation = spaceSchema.safeParse(formData);
            if (!validation.success) {
                addToast(validation.error.issues[0]?.message || "Revise os dados do formulário.", "error");
                setLoading(false);
                return;
            }
            const payload = validation.data.imageUrl
                ? validation.data
                : { ...validation.data, imageUrl: undefined };

            if (id && id !== 'new') {
                await api.put<SpaceResponse>(`/spaces/${id}`, payload);
                addToast("Espaço atualizado com sucesso!", "success");
            } else {
                await api.post<SpaceResponse>("/spaces", payload);
                addToast("Novo espaço criado com sucesso!", "success");
            }
            navigate("/admin/espacos");
        } catch (err: unknown) {
            addToast(getApiErrorMessage(err, "Erro ao salvar o espaço."), "error");
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

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                addToast("Foto do espaço carregada com sucesso!", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando dados do espaço...</p>
            </div>
        );
    }

    return (
        <AnimateIn className="max-w-4xl mx-auto pb-24 space-y-8 px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xl"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                🏛️ Gestão de Espaços & Ambientes
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
                            {id === 'new' ? 'Novo Espaço' : 'Editar Espaço'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/espacos")}
                        className="border-white/10 text-slate-400 hover:text-white rounded-2xl py-3 px-5 text-xs font-bold"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all text-xs uppercase flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {loading ? "Salvando..." : "Salvar Espaço"}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image & Photo Banner Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Camera size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Fotografia & Capa do Ambiente</h3>
                            <p className="text-xs text-slate-400">Imagem que será exibida para os visitantes e no mapa do equipamento.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
                        {formData.imageUrl ? (
                            <div className="relative w-full md:w-64 h-40 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl group">
                                <img src={formData.imageUrl} alt={formData.name} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                                    className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕ Remover
                                </button>
                            </div>
                        ) : (
                            <div className="w-full md:w-64 h-40 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 space-y-2">
                                <Camera size={32} className="text-amber-500/50" />
                                <span className="text-xs font-bold">Sem imagem</span>
                            </div>
                        )}

                        <div className="flex-1 space-y-3 w-full">
                            <label className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs cursor-pointer inline-flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20">
                                <Upload size={16} /> Fazer Upload de Imagem
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                            </label>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ou insira a URL direta da imagem:</label>
                                <input
                                    type="text"
                                    placeholder="https://imagens.exemplo.com/sala-1.jpg"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Info Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Informações Básicas</h3>
                            <p className="text-xs text-slate-400">Identificação, tipo de espaço e capacidade de público.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Nome do Espaço *
                            </label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Ex: Sala de Ensaio 1, Auditório Principal, Galeria de Arte..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Tipo de Ambiente *
                            </label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as SpaceType })}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-amber-500 transition-colors cursor-pointer"
                            >
                                <option value="ROOM">🚪 Sala Multiuso / Oficina</option>
                                <option value="AUDITORIUM">🎭 Auditório / Plateia</option>
                                <option value="LAB">🔬 Laboratório / Estúdio Digital</option>
                                <option value="STUDIO">🎬 Estúdio Ensaio / Gravação</option>
                                <option value="OPEN_AIR">🌳 Área Externa / Pátio</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Capacidade Máxima (Pessoas) *
                            </label>
                            <div className="relative">
                                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={e => {
                                        const value = Number(e.target.value);
                                        setFormData({ ...formData, capacity: Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0 });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Descrição e Finalidade
                            </label>
                            <textarea
                                placeholder="Descreva as dimensões, finalidade recomendada, regras de uso e características acústicas/iluminação..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-amber-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Resources Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Box size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Recursos & Comodidades Disponíveis</h3>
                            <p className="text-xs text-slate-400">Selecione os equipamentos técnicos disponíveis neste ambiente.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {RESOURCE_OPTIONS.map(res => {
                            const isSelected = formData.resources.includes(res.name);
                            return (
                                <div
                                    key={res.name}
                                    onClick={() => toggleResource(res.name)}
                                    className={`
                                        p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group
                                        ${isSelected
                                            ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400">{res.category}</span>
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                            isSelected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-black/20'
                                        }`}>
                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-white leading-tight">{res.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Settings & Availability Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Monitor size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Configurações & Disponibilidade</h3>
                            <p className="text-xs text-slate-400">Defina se este espaço aceita agendamentos e reservas públicas.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white">Disponível para Reserva Pública</h4>
                            <p className="text-xs text-slate-400">Permite que produtores e grupos agendem horários neste ambiente pelo calendário.</p>
                        </div>

                        <div 
                            onClick={() => setFormData(prev => ({ ...prev, isBookable: !prev.isBookable }))}
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${formData.isBookable ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        >
                            <motion.div
                                className="w-6 h-6 rounded-full bg-white shadow-md"
                                animate={{ x: formData.isBookable ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/espacos")}
                        className="border-white/10 text-slate-400 hover:text-white rounded-2xl py-3.5 px-6 text-xs font-bold"
                    >
                        Cancelar Alterações
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all text-xs uppercase flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {loading ? "Salvando..." : "Salvar e Concluir Espaço"}
                    </Button>
                </div>
            </form>
        </AnimateIn>
    );
};
