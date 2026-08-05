import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Gem, Building2, Zap, Crown, Diamond, Star, Layers, Globe, X, Upload, Sparkles, Palette, Coins, Fingerprint, Scan, ZapOff, Workflow } from "lucide-react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { Button, Input, Select, Textarea, Card, Badge, AnimateIn } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import { z } from "zod";

interface Skin {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    animatedUrl?: string | null;
    model3dUrl?: string | null;
    previewUrl?: string | null;
    thumbnailUrl?: string | null;
    xpCost: number;
    priceCents?: number | null;
    currency?: string | null;
    acquisitionMode?: SkinAcquisitionMode;
    assetType?: SkinAssetType;
    rarity: SkinRarity;
    active: boolean;
    eventOnly?: boolean;
    tenantId: string | null;
    _count?: { owners?: number; visitorSkins?: number };
}

interface Tenant {
    id: string;
    name: string;
}

type SkinRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "EXCLUSIVE";
type SkinAcquisitionMode = "FREE" | "XP_ONLY" | "MONEY_ONLY" | "XP_OR_MONEY" | "XP_PLUS_MONEY";
type SkinAssetType = "IMAGE_2D" | "SPRITESHEET" | "ANIMATED_GIF" | "LOTTIE" | "MODEL_3D" | "VIDEO";

interface SkinFormState {
    name: string;
    description: string;
    imageUrl: string;
    previewUrl: string;
    thumbnailUrl: string;
    animatedUrl: string;
    model3dUrl: string;
    xpCost: number;
    priceCents: number;
    currency: string;
    acquisitionMode: SkinAcquisitionMode;
    assetType: SkinAssetType;
    rarity: SkinRarity;
    tenantId: string;
    active: boolean;
    eventOnly: boolean;
    aiPrompt: string;
}

interface UploadResponse {
    url?: string;
}

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

const skinSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome da skin."),
    description: z.string().trim().optional(),
    imageUrl: z.string().trim().url("Informe uma URL valida para o ativo visual."),
    previewUrl: z.string().trim().url("Informe uma URL valida para a previa.").or(z.literal("")).optional(),
    thumbnailUrl: z.string().trim().url("Informe uma URL valida para a miniatura.").or(z.literal("")).optional(),
    animatedUrl: z.string().trim().url("Informe uma URL valida para animacao.").or(z.literal("")).optional(),
    model3dUrl: z.string().trim().url("Informe uma URL valida para modelo 3D.").or(z.literal("")).optional(),
    xpCost: z.number().int("O custo em XP precisa ser inteiro.").min(0, "O custo em XP nao pode ser negativo."),
    priceCents: z.number().int("O valor pago precisa ser inteiro em centavos.").min(0, "O valor pago nao pode ser negativo."),
    currency: z.string().trim().default("BRL"),
    acquisitionMode: z.enum(["FREE", "XP_ONLY", "MONEY_ONLY", "XP_OR_MONEY", "XP_PLUS_MONEY"]),
    assetType: z.enum(["IMAGE_2D", "SPRITESHEET", "ANIMATED_GIF", "LOTTIE", "MODEL_3D", "VIDEO"]),
    rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY", "EXCLUSIVE"]),
    tenantId: z.string().trim().nullable(),
    active: z.boolean(),
    eventOnly: z.boolean(),
    aiPrompt: z.string().trim().optional()
});

function getApiErrorMessage(err: unknown, fallback: string) {
    if (isAxiosError<ApiErrorResponse>(err)) {
        return err.response?.data?.message || err.response?.data?.error || fallback;
    }
    return fallback;
}

const rarities = [
  { value: 'COMMON', label: 'Comum', icon: <Star size={14} />, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', shadow: 'shadow-slate-400/5', glow: 'rgba(148, 163, 184, 0.1)' },
  { value: 'RARE', label: 'Raro', icon: <Zap size={14} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', shadow: 'shadow-blue-400/5', glow: 'rgba(96, 165, 250, 0.1)' },
  { value: 'EPIC', label: 'Épico', icon: <Crown size={14} />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', shadow: 'shadow-purple-400/10', glow: 'rgba(192, 132, 252, 0.1)' },
  { value: 'LEGENDARY', label: 'Lendário', icon: <Diamond size={14} />, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', shadow: 'shadow-amber-500/20', glow: 'rgba(245, 158, 11, 0.2)' },
  { value: 'EXCLUSIVE', label: 'Exclusivo', icon: <Sparkles size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', shadow: 'shadow-emerald-400/10', glow: 'rgba(52, 211, 153, 0.15)' }
];

export const MasterSkinManager: React.FC = () => {
    const { t: _t } = useTranslation();
    const [skins, setSkins] = useState<Skin[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [skinForm, setSkinForm] = useState<SkinFormState>({
        name: "",
        description: "",
        imageUrl: "",
        previewUrl: "",
        thumbnailUrl: "",
        animatedUrl: "",
        model3dUrl: "",
        xpCost: 500,
        priceCents: 0,
        currency: "BRL",
        acquisitionMode: "XP_ONLY",
        assetType: "IMAGE_2D",
        rarity: "COMMON",
        tenantId: "",
        active: true,
        eventOnly: false,
        aiPrompt: ""
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Skin | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [skinsRes, tenantsRes] = await Promise.all([
                api.get<Skin[]>("/skins"),
                api.get<Tenant[]>("/tenants")
            ]);
            setSkins(Array.isArray(skinsRes.data) ? skinsRes.data : []);
            setTenants(Array.isArray(tenantsRes.data) ? tenantsRes.data : []);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Erro ao sincronizar ateliê de identidades."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSkinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = skinSchema.safeParse({
            ...skinForm,
            tenantId: skinForm.tenantId || null
        });
        if (!validation.success) {
            toast.error(validation.error.issues[0]?.message || "Revise os dados da skin.");
            return;
        }

        try {
            if (editingId) {
                await api.put(`/skins/${editingId}`, validation.data);
                toast.success("Identidade atualizada no registro global.");
            } else {
                await api.post("/skins", validation.data);
                toast.success("Nova skin digital forjada com sucesso!");
            }
            resetForms();
            loadData();
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Falha no protocolo de salvamento cosmético."));
        }
    };

    const resetForms = () => {
        setShowForm(false);
        setEditingId(null);
        setSkinForm({
            name: "",
            description: "",
            imageUrl: "",
            previewUrl: "",
            thumbnailUrl: "",
            animatedUrl: "",
            model3dUrl: "",
            xpCost: 500,
            priceCents: 0,
            currency: "BRL",
            acquisitionMode: "XP_ONLY",
            assetType: "IMAGE_2D",
            rarity: "COMMON",
            tenantId: "",
            active: true,
            eventOnly: false,
            aiPrompt: ""
        });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            await api.delete(`/skins/${deleteTarget.id}`);
            setDeleteTarget(null);
            toast.success("Identidade removida do registro visual.");
            loadData();
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Erro na remoção do ativo cosmético."));
        }
    };

    if (loading && skins.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Acessando Ateliê de Identidades...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-purple-600/10 text-purple-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            RPG Aesthetic Module & Sovereign Identity Matrix
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Ateliê de <span className="text-purple-600">Skins</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Curadoria global de identidades cosméticas e recompensas de prestígio para a jornada gamificada dos visitantes.
                    </p>
                </div>
                
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className={`h-16 px-10 rounded-[28px] font-black uppercase text-xs tracking-[0.3em] transition-all shadow-2xl active:scale-95 flex items-center gap-4 ${showForm ? 'bg-white/5 text-slate-400 border-2 border-white/10 hover:text-white' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-600/30'}`}
                >
                    {showForm ? <><X size={20} /> Abortar Forja</> : <><Plus size={20} /> Forjar Identidade</>}
                </Button>
            </div>

            {/* Creation Chamber Overlay */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    >
                        <Card className="p-14 bg-[#0b1120]/60 border-2 border-purple-500/20 rounded-[64px] shadow-[0_0_80px_rgba(168,85,247,0.1)] grid grid-cols-1 lg:grid-cols-2 gap-16 relative overflow-hidden border-t-white/10 backdrop-blur-xl">
                            <div className="space-y-12 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xl">
                                        <Palette size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">{editingId ? 'Revisar Ativo' : 'Parâmetros da Skin'}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-2 italic">Definição de Atributos e Prestígio Visual</p>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleSkinSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Nome da Identidade</label>
                                            <Input 
                                                value={skinForm.name} 
                                                onChange={e => setSkinForm({...skinForm, name: e.target.value})} 
                                                placeholder="Ex: Guardião Ancestral"
                                                required 
                                                className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight uppercase focus:border-purple-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Nível de Raridade</label>
                                            <div className="relative group/sel">
                                                <Select 
                                                    value={skinForm.rarity} 
                                                    onChange={e => setSkinForm({...skinForm, rarity: e.target.value as SkinRarity})}
                                                    className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight appearance-none cursor-pointer hover:border-purple-500/30 transition-all uppercase"
                                                >
                                                    {rarities.map(r => <option key={r.value} value={r.value} className="bg-slate-950">{r.label}</option>)}
                                                </Select>
                                                <Layers size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover/sel:text-purple-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Custo de Desbloqueio (XP)</label>
                                            <div className="relative group">
                                                <Input 
                                                    type="number" 
                                                    value={skinForm.xpCost} 
                                                    onChange={e => setSkinForm({...skinForm, xpCost: e.target.value === "" ? 0 : Number(e.target.value)})} 
                                                    required 
                                                    className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 font-black text-amber-500 focus:border-amber-500/50 transition-all"
                                                />
                                                <Coins size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-500/30 group-hover:text-amber-500 transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Modo de Aquisição</label>
                                            <div className="relative group/sel">
                                                <Select
                                                    value={skinForm.acquisitionMode}
                                                    onChange={e => setSkinForm({...skinForm, acquisitionMode: e.target.value as SkinAcquisitionMode})}
                                                    className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight appearance-none cursor-pointer hover:border-purple-500/30 transition-all uppercase"
                                                >
                                                    <option value="FREE" className="bg-slate-950">Gratis</option>
                                                    <option value="XP_ONLY" className="bg-slate-950">Somente XP</option>
                                                    <option value="MONEY_ONLY" className="bg-slate-950">Somente pagamento</option>
                                                    <option value="XP_OR_MONEY" className="bg-slate-950">XP ou pagamento</option>
                                                    <option value="XP_PLUS_MONEY" className="bg-slate-950">XP + pagamento</option>
                                                </Select>
                                                <Coins size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover/sel:text-purple-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Valor Pago (centavos)</label>
                                            <Input
                                                type="number"
                                                value={skinForm.priceCents}
                                                onChange={e => setSkinForm({...skinForm, priceCents: e.target.value === "" ? 0 : Number(e.target.value)})}
                                                className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 font-black text-blue-300 focus:border-blue-400/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Tipo do Ativo</label>
                                            <div className="relative group/sel">
                                                <Select
                                                    value={skinForm.assetType}
                                                    onChange={e => setSkinForm({...skinForm, assetType: e.target.value as SkinAssetType})}
                                                    className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight appearance-none cursor-pointer hover:border-purple-500/30 transition-all uppercase"
                                                >
                                                    <option value="IMAGE_2D" className="bg-slate-950">Imagem 2D</option>
                                                    <option value="SPRITESHEET" className="bg-slate-950">Spritesheet</option>
                                                    <option value="ANIMATED_GIF" className="bg-slate-950">GIF animado</option>
                                                    <option value="LOTTIE" className="bg-slate-950">Lottie</option>
                                                    <option value="MODEL_3D" className="bg-slate-950">Modelo 3D</option>
                                                    <option value="VIDEO" className="bg-slate-950">Video</option>
                                                </Select>
                                                <Layers size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover/sel:text-purple-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Exclusividade Regional</label>
                                            <div className="relative group/sel">
                                                <Select 
                                                    value={skinForm.tenantId} 
                                                    onChange={e => setSkinForm({...skinForm, tenantId: e.target.value})}
                                                    className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight appearance-none cursor-pointer hover:border-purple-500/30 transition-all"
                                                >
                                                    <option value="" className="bg-slate-950">Disponibilidade Global (Toda a Rede)</option>
                                                    {tenants.map(item => <option key={item.id} value={item.id} className="bg-slate-950">{item.name}</option>)}
                                                </Select>
                                                <Globe size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover/sel:text-purple-500 transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Publicação</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button type="button" onClick={() => setSkinForm({...skinForm, active: !skinForm.active})} className={`h-16 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest ${skinForm.active ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300" : "bg-white/5 border-white/10 text-slate-500"}`}>
                                                    {skinForm.active ? "Ativa" : "Inativa"}
                                                </button>
                                                <button type="button" onClick={() => setSkinForm({...skinForm, eventOnly: !skinForm.eventOnly})} className={`h-16 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest ${skinForm.eventOnly ? "bg-amber-500/10 border-amber-400/30 text-amber-300" : "bg-white/5 border-white/10 text-slate-500"}`}>
                                                    {skinForm.eventOnly ? "Evento" : "Loja"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Ativo Visual (Spritesheet/PNG)</label>
                                        <div className="flex gap-6">
                                            <Input 
                                                value={skinForm.imageUrl} 
                                                onChange={e => setSkinForm({...skinForm, imageUrl: e.target.value})} 
                                                placeholder="URL da Imagem ou Provisionamento Direto..."
                                                required
                                                className="flex-1 h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-medium italic"
                                            />
                                            <label className="h-16 px-10 rounded-2xl bg-purple-600 text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/30 active:scale-95 group/up">
                                                <Upload size={20} className="mr-3 group-hover/up:translate-y-[-2px] transition-transform" /> Upload Ativo
                                                <input 
                                                    type="file" accept="image/*" className="hidden" 
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const formData = new FormData();
                                                        formData.append("file", file);
                                                        try {
                                                            const res = await api.post<UploadResponse>("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
                                                            if (!res.data.url) throw new Error("Upload sem URL de retorno.");
                                                            const uploadedUrl = res.data.url;
                                                            setSkinForm({ ...skinForm, imageUrl: uploadedUrl });
                                                            toast.success("Ativo carregado na malha.");
                                                        } catch (err) { toast.error(getApiErrorMessage(err, "Falha no upload do ativo.")); }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Preview / Thumbnail</label>
                                            <Input
                                                value={skinForm.previewUrl}
                                                onChange={e => setSkinForm({...skinForm, previewUrl: e.target.value})}
                                                placeholder="URL opcional de preview..."
                                                className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-medium italic"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Ativo Animado / 3D</label>
                                            <Input
                                                value={skinForm.animatedUrl || skinForm.model3dUrl}
                                                onChange={e => skinForm.assetType === "MODEL_3D" ? setSkinForm({...skinForm, model3dUrl: e.target.value}) : setSkinForm({...skinForm, animatedUrl: e.target.value})}
                                                placeholder="URL opcional de animacao ou modelo 3D..."
                                                className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-medium italic"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Lore e Descrição Cosmética</label>
                                        <Textarea 
                                            value={skinForm.description} 
                                            onChange={e => setSkinForm({...skinForm, description: e.target.value})} 
                                            placeholder="Detalhes sobre a história e o estilo desta skin..."
                                            rows={3}
                                            className="bg-white/5 border-2 border-white/10 rounded-[32px] p-8 text-white font-medium italic leading-relaxed resize-none min-h-[140px] focus:border-purple-500/50 transition-all"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full h-20 rounded-[28px] bg-emerald-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-4 group/save">
                                        {editingId ? 'Atualizar Identidade Digital' : 'Forjar Skin no Grimório'} <Sparkles size={24} className="group-hover/save:rotate-12 transition-transform" />
                                    </Button>
                                </form>
                            </div>

                            <div className="space-y-12 flex flex-col items-center justify-center relative">
                                <div className="absolute top-0 left-0 flex items-center gap-4 text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic">
                                    <Scan size={20} className="text-blue-500" /> Live Hologram Preview
                                </div>
                                
                                {/* Avatar Preview Card - Elite Component */}
                                {(() => {
                                    const r = rarities.find(ra => ra.value === skinForm.rarity) || rarities[0];
                                    return (
                                        <motion.div 
                                            key={skinForm.rarity}
                                            initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
                                            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                                            exit={{ rotateY: -90, opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.6, ease: "circOut" }}
                                            className={`w-full max-w-[360px] aspect-[4/5] rounded-[64px] border-[6px] p-12 relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex flex-col items-center text-center group/preview ${r.bg} ${r.border} border-t-white/20`}
                                            style={{ boxShadow: `0 0 60px ${r.glow}` }}
                                        >
                                            <Badge variant="glass" className={`bg-white/10 border-none text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-xl italic mb-10 ${r.color}`}>
                                                {r.icon} <span className="ml-3">{r.label}</span>
                                            </Badge>
                                            
                                            <div className="w-48 h-48 bg-slate-950 rounded-full border-[6px] border-white/10 flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] mb-10 group-hover/preview:scale-[1.05] transition-transform duration-1000">
                                                <div className={`absolute inset-0 opacity-20 blur-[40px] rounded-full ${r.bg} animate-pulse`} />
                                                {skinForm.imageUrl ? (
                                                    <img src={skinForm.imageUrl} className="w-32 h-32 object-contain z-10 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] relative group-hover/preview:rotate-6 transition-transform duration-700" alt="" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/5 gap-4">
                                                        <Gem size={64} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Asset Needed</span>
                                                    </div>
                                                )}
                                                {/* Scan Effect */}
                                                <div className="absolute inset-x-0 top-0 h-1 bg-white/10 blur-sm group-hover/preview:top-full transition-all duration-[2s] pointer-events-none" />
                                            </div>

                                            <div className="space-y-4 flex-1 relative z-10">
                                                <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none group-hover/preview:text-purple-400 transition-colors">{skinForm.name || 'Nova Identidade'}</h3>
                                                <p className="text-xs text-slate-500 font-medium italic line-clamp-3 leading-relaxed">
                                                    "{skinForm.description || 'A narrativa e os detalhes estéticos desta identidade RPG aparecerão aqui após o provisionamento.'}"
                                                </p>
                                            </div>

                                            <div className="mt-10 pt-8 border-t border-white/10 w-full flex justify-between items-center relative z-10">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none italic">XP Reward Tier</span>
                                                    <span className="text-xl font-black text-amber-500 tracking-tighter italic leading-none">{skinForm.xpCost} XP</span>
                                                </div>
                                                <div className="flex flex-col items-end text-right gap-1">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none italic">Availability</span>
                                                    <span className="text-xl font-black text-white tracking-tighter italic leading-none uppercase">{skinForm.tenantId ? 'Regional' : 'Global'}</span>
                                                </div>
                                            </div>
                                            {/* Aura Glow */}
                                            <div className={`absolute -right-24 -bottom-24 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none ${r.bg}`} />
                                        </motion.div>
                                    );
                                })()}
                                
                                <div className="w-full max-w-[360px] p-8 bg-[#0f172a] rounded-[40px] border-2 border-white/5 flex items-center gap-6 shadow-xl">
                                    <div className="w-14 h-14 bg-purple-600/10 rounded-[20px] flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-lg">
                                        <Workflow size={28} />
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic">
                                        Identidades forjadas são propagadas em tempo real para todos os dispositivos e PWAs da malha federada.
                                    </p>
                                </div>
                            </div>
                            {/* Chamber Atmospheric Aura */}
                            <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[200px] pointer-events-none" />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Skins Repository Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                <AnimatePresence mode="popLayout">
                    {skins.map((skin, idx) => {
                        const r = rarities.find(ra => ra.value === skin.rarity) || rarities[0];
                        return (
                            <motion.div
                                key={skin.id}
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                                transition={{ delay: idx * 0.05, ease: "circOut" }}
                            >
                                <Card className={`group/card h-full bg-[#0b1120]/60 border-2 rounded-[56px] p-10 flex flex-col items-center text-center hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden ${r.border} shadow-2xl border-t-white/10`}>
                                    {/* Command Overlay */}
                                    <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-x-4 group-hover/card:translate-x-0 z-20">
                                        <button 
                                            onClick={() => { 
                                                setSkinForm({
                                                    name: skin.name,
                                                    description: skin.description || '',
                                                    imageUrl: skin.imageUrl || '',
                                                    previewUrl: skin.previewUrl || '',
                                                    thumbnailUrl: skin.thumbnailUrl || '',
                                                    animatedUrl: skin.animatedUrl || '',
                                                    model3dUrl: skin.model3dUrl || '',
                                                    xpCost: skin.xpCost,
                                                    priceCents: skin.priceCents || 0,
                                                    currency: skin.currency || 'BRL',
                                                    acquisitionMode: skin.acquisitionMode || 'XP_ONLY',
                                                    assetType: skin.assetType || 'IMAGE_2D',
                                                    rarity: skin.rarity,
                                                    tenantId: skin.tenantId || '',
                                                    active: skin.active,
                                                    eventOnly: Boolean(skin.eventOnly),
                                                    aiPrompt: ''
                                                }); 
                                                setEditingId(skin.id); 
                                                setShowForm(true); 
                                            }}
                                            className="w-12 h-12 rounded-2xl bg-white/5 text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border-2 border-white/5 shadow-2xl group/edit"
                                        >
                                            <Edit2 size={18} className="group-hover/edit:rotate-12" />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteTarget(skin)} 
                                            className="w-12 h-12 rounded-2xl bg-white/5 text-rose-500/40 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border-2 border-white/5 shadow-2xl group/del"
                                        >
                                            <Trash2 size={18} className="group-hover/del:scale-110" />
                                        </button>
                                    </div>

                                    <Badge variant="glass" className={`bg-white/5 border-none text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl mb-12 italic ${r.color}`}>
                                        {r.icon} <span className="ml-2">{r.label}</span>
                                    </Badge>

                                    <div className="w-36 h-36 bg-slate-950 rounded-full border-4 border-white/10 flex items-center justify-center relative shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] mb-10 group-hover/card:scale-110 transition-transform duration-1000">
                                        <div className={`absolute inset-0 opacity-10 blur-2xl rounded-full ${r.bg} group-hover/card:opacity-30 transition-opacity`} />
                                        <img src={skin.previewUrl || skin.thumbnailUrl || skin.imageUrl || "/default_avatar.png"} alt={skin.name} className="w-24 h-24 object-contain z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] relative group-hover/card:rotate-6 transition-transform duration-700" />
                                    </div>

                                    <div className="space-y-3 flex-1 relative z-10">
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter leading-none group-hover/card:text-purple-400 transition-colors uppercase">{skin.name}</h3>
                                        <p className="text-[11px] text-slate-500 font-medium italic line-clamp-2 leading-relaxed group-hover/card:text-slate-400 transition-colors">
                                            {skin.description || "Identidade cosmética de prestígio para embaixadores da cultura."}
                                        </p>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-white/5 w-full flex flex-wrap gap-6 justify-between items-center relative z-10">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-none">Unlock Cost</span>
                                            <span className="text-lg font-black text-amber-500 tracking-tighter italic leading-none">{skin.xpCost} XP</span>
                                        </div>
                                        <div className="flex flex-col items-end text-right gap-1">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-none">Holders</span>
                                            <span className="text-lg font-black text-white tracking-tighter italic uppercase leading-none">{skin._count?.visitorSkins || skin._count?.owners || 0} Masters</span>
                                        </div>
                                    </div>

                                    {skin.tenantId && (
                                        <div className="mt-6 flex items-center gap-3 text-[9px] text-blue-400 uppercase font-black tracking-[0.2em] italic relative z-10 bg-blue-600/5 px-4 py-2 rounded-xl border border-blue-500/10">
                                            <Building2 size={12} /> {tenants.find(item => item.id === skin.tenantId)?.name} Exclusive
                                        </div>
                                    )}

                                    {/* Card Ambient Aura */}
                                    <div className={`absolute -right-20 -bottom-20 w-56 h-56 rounded-full blur-[80px] opacity-10 group-hover/card:opacity-30 transition-all duration-1000 pointer-events-none ${r.bg}`} />
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {skins.length === 0 && !loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-48 text-center opacity-30 flex flex-col items-center gap-12 shadow-inner rounded-[64px] bg-white/[0.01] border-2 border-dashed border-white/5"
                    >
                        <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border-2 border-white/5">
                            <ZapOff size={64} className="text-slate-700" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-2xl font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">Ateliê Vazio</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700 italic">Nenhuma identidade cosmética forjada para a rede.</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setDeleteTarget(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 12 }}
                            className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-950 p-7 shadow-2xl"
                        >
                            <div className="mb-6 flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                                    <Trash2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Remover identidade</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                                        "{deleteTarget.name}" será removida da rede de recompensas visuais.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button type="button" variant="glass" className="h-12 rounded-2xl" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
                                <Button type="button" className="h-12 rounded-2xl bg-rose-600 text-white font-black hover:bg-rose-500" onClick={handleDelete}>Remover</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* RPG Identity Governance Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-purple-600/10 rounded-[32px] flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-purple-500/20 shadow-2xl relative overflow-hidden">
                        <Palette size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Soberania Estética de Avatar</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            As identidades cosméticas definem o prestígio e a jornada visual do visitante no ecossistema MSV. Cada skin forjada é um node de representação cultural que unifica a experiência física e digital.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-purple-500/20">
                        <Fingerprint size={24} /> Identity Protocol: Verified
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
