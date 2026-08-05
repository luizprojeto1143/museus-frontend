import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../../api/client";
import { useToast } from "../../../../contexts/ToastContext";
import { Save, ArrowLeft, Layers, Monitor, CheckCircle, Box, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui";
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
    name: z.string().trim().min(2, "Informe o nome do espaco."),
    description: z.string().trim().optional().default(""),
    capacity: z.number().int().min(0, "A capacidade nao pode ser negativa."),
    type: z.enum(spaceTypes),
    resources: z.array(z.string()),
    isBookable: z.boolean(),
    imageUrl: z.string().trim().url("Informe uma URL valida para a imagem.").or(z.literal(""))
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchSpace = async () => {
        try {
            setLoading(true);
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
            addToast(getApiErrorMessage(err, t("common.error")), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const validation = spaceSchema.safeParse(formData);
            if (!validation.success) {
                addToast(validation.error.issues[0]?.message || t("common.errorSave"), "error");
                return;
            }
            const payload = validation.data.imageUrl
                ? validation.data
                : { ...validation.data, imageUrl: undefined };

            if (id && id !== 'new') {
                await api.put<SpaceResponse>(`/spaces/${id}`, payload);
                addToast(t("common.successUpdate"), "success");
            } else {
                await api.post<SpaceResponse>("/spaces", payload);
                addToast(t("common.successCreate"), "success");
            }
            navigate("/admin/espacos");
        } catch (err: unknown) {
            addToast(getApiErrorMessage(err, t("common.errorSave")), "error");
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
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <Layers className="text-[var(--accent-primary)]" size={24} />
                        </div>
                        <h3 className="card-title mb-0">{t("admin.space.informaesBsicas", `Informações Básicas`)}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 form-group">
                            <label className="form-label">{t("admin.space.nomeDoEspao", `Nome do Espaço`)}</label>
                            <input
                                type="text"
                                placeholder={t("admin.space.exSalaDeEnsaio1AuditrioPrincipal", `Ex: Sala de Ensaio 1, Auditório Principal...`)}
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
                                onChange={e => setFormData({ ...formData, type: e.target.value as SpaceType })}
                                className="input w-full"
                            >
                                <option value="ROOM">Sala Multiuso</option>
                                <option value="AUDITORIUM">{t("admin.space.auditrio", `Auditório`)}</option>
                                <option value="LAB">{t("admin.space.laboratrio", `Laboratório`)}</option>
                                <option value="STUDIO">{t("admin.space.estdio", `Estúdio`)}</option>
                                <option value="OPEN_AIR">{t("admin.space.reaExterna", `Área Externa`)}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Capacidade (Pessoas)</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={e => {
                                    const value = Number(e.target.value);
                                    setFormData({ ...formData, capacity: Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0 });
                                }}
                                className="input w-full"
                            />
                        </div>

                        <div className="md:col-span-2 form-group">
                            <label className="form-label">{t("admin.space.descrio", `Descrição`)}</label>
                            <textarea
                                placeholder={t("admin.space.descrevaOEspaoDimensesFinalidade", `Descreva o espaço, dimensões, finalidade...`)}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="input w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Resources Card */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <Box className="text-[var(--accent-primary)]" size={24} />
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
                                        ? 'bg-[rgba(212,175,55,0.1)] border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-gray-400 hover:border-[rgba(212,175,55,0.3)]'
                                    }
                 `}
                            >
                                {formData.resources.includes(res) && (
                                    <div className="absolute top-2 right-2 text-[var(--accent-primary)]">
                                        <CheckCircle size={14} />
                                    </div>
                                )}
                                <span className="z-10">{res}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Card */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
                    <div className="flex items-center gap-3 mb-6 border-b border-[rgba(212,175,55,0.1)] pb-4">
                        <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                            <Monitor className="text-[var(--accent-primary)]" size={24} />
                        </div>
                        <h3 className="card-title mb-0">{t("admin.space.configuraes", `Configurações`)}</h3>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(255,255,255,0.05)]">
                        <div className="flex-1">
                            <h4 className="text-[#f5e6d3] font-bold mb-1">{t("admin.space.disponvelParaReserva", `Disponível para Reserva`)}</h4>
                            <p className="text-sm text-gray-400">{t("admin.space.permitirQueEsteEspaoSejaReservadoNoCalen", `Permitir que este espaço seja reservado no calendário.`)}</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                            <input
                                type="checkbox"
                                className="peer absolute w-0 h-0 opacity-0"
                                checked={formData.isBookable}
                                onChange={e => setFormData({ ...formData, isBookable: e.target.checked })}
                            />
                            <span className={`block w-12 h-7 rounded-full transition-colors duration-300 ${formData.isBookable ? 'bg-[#22c55e]' : 'bg-gray-600'}`}></span>
                            <span className={`absolute left-1 top-1 bg-zinc-900/40 w-5 h-5 rounded-full transition-transform duration-300 shadow-md shadow-black/20 ${formData.isBookable ? 'translate-x-5' : 'translate-x-0'}`}></span>
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

