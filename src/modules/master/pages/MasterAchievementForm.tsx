import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { 
    Trophy, 
    Upload, 
    ArrowLeft, 
    Save, 
    Building2, 
    Tag, 
    FileText, 
    ImageIcon,
    Zap,
    ShieldCheck,
    Globe,
    Layers,
    ArrowUpRight,
    Star,
    Award,
    Crown,
    X,
    Sparkles,
    Settings,
    Package,
    Terminal,
    CloudUpload,
    Medal,
    Gem
} from "lucide-react";
import { 
    Button, 
    Input, 
    Select, 
    Textarea, 
    Card, 
    Badge, 
    AnimateIn 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

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
            toast.error("Falha na sincronização da medalha.");
            navigate("/master/achievements");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadTenants();
        if (isEditing && id) {
            loadAchievement(id);
        }
    }, [id, isEditing, loadTenants, loadAchievement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tenantId) {
            toast.error("Domínio municipal obrigatório.");
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                await api.put(`/achievements/${id}`, formData);
                toast.success("Medalha atualizada no registro global.");
            } else {
                await api.post("/achievements", formData);
                toast.success("Nova conquista forjada!");
            }
            navigate("/master/achievements");
        } catch (err) {
            toast.error("Falha no protocolo de salvamento.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Acessando Câmara de Forja...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                            {isEditing ? 'Medal Revision Protocol' : 'Achievement Creation Chamber'}
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        {isEditing ? 'Revisar' : 'Forjar'} <span className="text-amber-500">Conquista</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Definição de parâmetros estéticos e requisitos técnicos para medalhas de reconhecimento global.
                    </p>
                </div>
                
                <Button 
                    variant="glass"
                    onClick={() => navigate('/master/achievements')}
                    className="h-16 px-10 rounded-2xl border-white/5 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-white transition-all shadow-xl active:scale-95"
                >
                    <ArrowLeft size={20} className="mr-3" /> Abortar Operação
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Creation Form */}
                <Card className="p-12 bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] shadow-2xl space-y-12 relative overflow-hidden">
                    <div className="flex items-center gap-5 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] italic relative z-10">
                        <Settings size={18} className="animate-spin-slow" /> Configuração de Ativo
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Instância de Destino</label>
                            <div className="relative group">
                                <Select
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                    disabled={isEditing}
                                    required
                                    className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 text-white font-black uppercase tracking-widest appearance-none focus:border-amber-500/50"
                                >
                                    <option value="" className="bg-slate-950">Selecione o Município...</option>
                                    {tenants.map(item => (
                                        <option key={item.id} value={item.id} className="bg-slate-950">{item.name.toUpperCase()}</option>
                                    ))}
                                </Select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/30">
                                    <Globe size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Código do Protocolo</label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                                    placeholder="EX: VETERAN_MEDAL"
                                    required
                                    className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 font-mono text-amber-500 font-black uppercase placeholder:text-slate-800"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Título de Honra</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Nome da Conquista"
                                    required
                                    className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight placeholder:text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Narrativa de Conquista</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva o requisito para o visitante forjar este mérito..."
                                rows={4}
                                className="bg-white/5 border-white/10 rounded-[32px] p-8 text-white font-medium italic leading-relaxed placeholder:text-slate-800 focus:border-amber-500/50 min-h-[160px]"
                            />
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Vetor Visual da Medalha</label>
                            <div className="flex gap-4">
                                <Input
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="Source URL ou Injetar Arquivo"
                                    className="flex-1 h-16 bg-white/5 border-white/10 rounded-2xl px-8 text-slate-400 font-mono text-[10px] uppercase tracking-widest placeholder:text-slate-800"
                                />
                                <label className="h-16 px-8 rounded-2xl bg-amber-600 text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center cursor-pointer hover:bg-amber-500 transition-all shadow-2xl shadow-amber-600/20 active:scale-95 group">
                                    <CloudUpload size={20} className="mr-3 group-hover:-translate-y-1 transition-transform" /> Injetar
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
                                                toast.success("Ativo visual injetado com sucesso.");
                                            } catch (err) {
                                                toast.error("Falha na injeção de ativo.");
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="pt-12 flex gap-6">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-20 flex-1 rounded-[24px] bg-blue-600 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={20} className="animate-spin" /> Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        Confirmar Medalha <Save size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                    <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
                </Card>

                {/* Live Preview - Hall of Fame Tier */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                        <Terminal size={18} className="text-blue-500" /> Output: Hall of Glory Preview
                    </div>

                    <div className="flex justify-center perspective-1000">
                        <motion.div
                            initial={false}
                            animate={{ rotateY: 0 }}
                            whileHover={{ rotateY: 5, rotateX: 5 }}
                            className="w-full max-w-[450px]"
                        >
                            <Card className="h-full bg-[#0b1120]/80 border-2 border-amber-500/30 rounded-[64px] p-16 flex flex-col items-center text-center shadow-[0_0_80px_rgba(245,158,11,0.15)] relative overflow-hidden group border-t-white/20">
                                {/* Protocol Overlay */}
                                <Badge variant="glass" className="bg-amber-500/5 border-amber-500/10 text-amber-500/60 text-[9px] font-black uppercase tracking-[0.4em] mb-16 italic px-6 py-2.5 rounded-xl">
                                    {formData.code || 'UNNAMED_ASSET'}
                                </Badge>

                                {/* Medal Core Preview */}
                                <div className="relative mb-16 scale-110">
                                    <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-slate-900 via-[#0b1120] to-slate-800 border-2 border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden group-hover:border-amber-500/40 transition-all duration-700">
                                        {formData.imageUrl ? (
                                            <img
                                                src={formData.imageUrl.startsWith("http") ? formData.imageUrl : `${import.meta.env.VITE_API_URL}${formData.imageUrl}`}
                                                alt="Preview"
                                                className="w-28 h-28 object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <Medal size={80} className="text-amber-500/10 group-hover:text-amber-500/20 transition-all" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-50" />
                                    </div>
                                    <div className="absolute inset-[-30%] bg-amber-500/10 rounded-full blur-[60px] animate-pulse" />
                                    <div className="absolute inset-[-5%] bg-amber-500/5 rounded-full blur-[20px]" />
                                </div>

                                {/* Content Matrix Preview */}
                                <div className="space-y-8 flex-1 relative z-20">
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight group-hover:text-amber-500 transition-colors duration-500">
                                        {formData.title || 'Título da Medalha'}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-4 group-hover:text-slate-400 transition-colors">
                                        "{formData.description || 'A narrativa de conquista e requisitos de mérito aparecerão aqui conforme o Master preencher os registros no ateliê.'}"
                                    </p>
                                </div>

                                {/* Prestige Indicators */}
                                <div className="mt-16 pt-10 border-t border-white/5 w-full flex justify-center gap-10">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
                                        <Gem size={16} className="text-amber-500/40" /> Elite Tier
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
                                        <Crown size={16} className="text-amber-500/40" /> Sovereign
                                    </div>
                                </div>

                                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />
                            </Card>
                        </motion.div>
                    </div>

                    <Card className="p-10 bg-indigo-600/5 border border-indigo-500/10 rounded-[48px] flex items-center gap-10 group relative overflow-hidden shadow-2xl">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 shadow-xl border border-white/5 group-hover:rotate-12 transition-transform">
                            <Package size={36} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h4 className="text-white font-black text-xl italic tracking-tighter uppercase italic leading-none">Distribuição Master</h4>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed italic">
                                Ativos forjados aqui são sincronizados via CDN em tempo real para todos os terminais da rede.
                            </p>
                        </div>
                        <div className="absolute top-[-50%] right-[-10%] w-60 h-60 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                    </Card>
                </div>
            </div>
            
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .animate-spin-slow { animation: spin 10s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AnimateIn>
    );
};
