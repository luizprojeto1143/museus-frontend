import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";

import React, { useState, useEffect, useCallback } from "react";
import { 
    User, 
    Mail, 
    Phone, 
    FileText, 
    CheckCircle, 
    Tag, 
    Save, 
    TrendingUp, 
    Sparkles, 
    ArrowUpRight, 
    Camera, 
    Eye, 
    ShieldCheck, 
    Award,
    Briefcase,
    MapPin,
    Globe
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { 
    Button, 
    Input, 
    Textarea, 
    Card, 
    Badge, 
    AnimateIn 
} from "@/components/ui";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export const ProviderProfile: React.FC = () => {
    const { t } = useTranslation();
    const { name: authName } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<unknown>({
        id: "",
        name: "",
        email: "",
        phone: "",
        document: "",
        description: "",
        services: [],
        bannerUrl: "",
        avatarUrl: "",
        completedJobs: 0,
        rating: 4.9,
        location: "São Paulo, SP",
        website: ""
    });

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/providers/me");
            setProfile({
                ...profile,
                ...res.data,
                completedJobs: res.data.completedJobs || 12, // Mock if null
                rating: res.data.rating || 4.9
            });
        } catch (err) {
            logger.error("Error fetching provider profile", err);
            toast.error("Erro ao carregar dados do perfil.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        if (!profile.name || !profile.email) {
            toast.error("Nome e E-mail são campos obrigatórios.");
            return;
        }

        try {
            setSaving(true);
            await api.put(`/providers/${profile.id || 'me'}`, profile);
            toast.success("Portfólio atualizado com sucesso!");
        } catch (err) {
            logger.error("Error saving profile", err);
            toast.error("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Renderizando Portfólio...</p>
        </div>
    );

    return (
        <AnimateIn className="max-w-7xl mx-auto space-y-10 pb-32">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                        Meu <span className="text-indigo-500">Portfólio</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Sua vitrine profissional para museus e produtores de elite.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="glass"
                        className="h-14 px-6 rounded-2xl border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white"
                        leftIcon={<Eye size={18} />}
                    >
                        Ver Perfil Público
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={saving}
                        className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95"
                        leftIcon={<Save size={18} />}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            {/* Profile Hero / Banner */}
            <div className="relative">
                {/* Banner */}
                <div className="h-64 md:h-80 rounded-[48px] overflow-hidden relative group border border-white/5 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent z-10 opacity-80" />
                    <img 
                        src={profile.bannerUrl || "/placeholder-image.jpg"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        alt="Banner"
                    />
                    <div className="absolute top-6 right-8 z-20">
                        <Button variant="glass" className="bg-black/50 backdrop-blur-md border-white/10 text-white text-[10px] h-10 px-6 rounded-xl font-black uppercase tracking-widest">
                            <Camera size={16} className="mr-2" /> Alterar Capa
                        </Button>
                    </div>

                    {/* Quick Stats Overlay */}
                    <div className="absolute bottom-10 left-10 md:left-48 z-20 hidden md:flex items-center gap-6">
                        <div className="flex flex-col">
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 leading-none">Avaliação Média</span>
                             <div className="flex items-center gap-1.5 text-2xl font-black text-white">
                                 {profile.rating} <StarIcon className="text-gold-400 fill-gold-400" />
                             </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col">
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 leading-none">Projetos Executados</span>
                             <div className="text-2xl font-black text-white">
                                 {profile.completedJobs}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Avatar Profile Box */}
                <div className="absolute -bottom-12 left-10 hidden md:block z-30">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[32px] p-1 shadow-2xl group-hover:rotate-3 transition-transform duration-500">
                            <div className="w-full h-full bg-[#0a0a1a] rounded-[28px] overflow-hidden flex items-center justify-center border-2 border-white/10">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-white">{profile.name?.slice(0, 2).toUpperCase() || "P"}</span>
                                )}
                            </div>
                        </div>
                        <button className="absolute -right-2 -bottom-2 w-10 h-10 bg-indigo-600 text-white rounded-xl border-4 border-[#05050a] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <Camera size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-16 md:mt-20">
                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">Verificação</h3>
                                <Badge variant="glass" className="mt-1 bg-green-500/10 text-green-400 border-green-500/20 uppercase text-[8px] font-black">Prestador Homologado</Badge>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-4 text-slate-400">
                                <MapPin size={18} className="text-indigo-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Localização Base</p>
                                    <p className="text-sm font-bold text-slate-300 truncate">{profile.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400">
                                <Globe size={18} className="text-indigo-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Site / Social</p>
                                    <p className="text-sm font-bold text-slate-300 truncate">{profile.website || "Não informado"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400">
                                <Award size={18} className="text-indigo-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Nível de Expertise</p>
                                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-tighter">Senior Specialist</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-indigo-600/5 to-transparent border-indigo-500/10 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3">
                            <Sparkles size={18} className="text-indigo-400" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Dica Estratégica</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                            "Perfis com biografia detalhada e categorias específicas recebem 40% mais solicitações de museus."
                        </p>
                    </Card>
                </div>

                {/* Main Form Area */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                                <FileText className="text-indigo-500" /> 
                                Detalhes do <span className="text-indigo-500">Portfólio</span>
                            </h3>
                            <Button variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-indigo-400 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-400/10">
                                <Sparkles size={14} className="mr-2" /> Otimizar com IA
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Nome de Exibição</label>
                                <Input
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="h-14 bg-white/5 border-white/5 text-white focus:border-indigo-500/50 rounded-2xl px-6"
                                    placeholder="Ex: Acessibilidade Digital Master"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">E-mail Profissional</label>
                                <Input
                                    value={profile.email}
                                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                                    className="h-14 bg-white/5 border-white/5 text-white focus:border-indigo-500/50 rounded-2xl px-6"
                                    placeholder="email@empresa.com"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Contato / WhatsApp</label>
                                <Input
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="h-14 bg-white/5 border-white/5 text-white focus:border-indigo-500/50 rounded-2xl px-6"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">CNPJ / CPF</label>
                                <Input
                                    value={profile.document}
                                    onChange={e => setProfile({ ...profile, document: e.target.value })}
                                    className="h-14 bg-white/5 border-white/5 text-white focus:border-indigo-500/50 rounded-2xl px-6"
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Apresentação Profissional</label>
                            <Textarea
                                value={profile.description}
                                onChange={e => setProfile({ ...profile, description: e.target.value })}
                                className="bg-white/5 border-white/5 text-white focus:border-indigo-500/50 min-h-[200px] rounded-[32px] p-8 text-sm leading-relaxed"
                                placeholder="Conte sua trajetória profissional, especialidades e como você pode transformar a experiência dos visitantes..."
                            />
                        </div>

                        {/* Service Categories */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3">
                                <Tag size={16} className="text-indigo-500" />
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Especialidades Estratégicas</label>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {["LIBRAS", "AUDIODESCRICAO", "LEGENDA", "ADAPTACAO_FISICA", "CONSULTORIA", "TREINAMENTO"].map(service => (
                                    <button
                                        key={service}
                                        onClick={() => {
                                            const services = profile.services.includes(service)
                                                ? profile.services.filter((s: string) => s !== service)
                                                : [...profile.services, service];
                                            setProfile({ ...profile, services });
                                        }}
                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all border duration-300 ${profile.services.includes(service)
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-400'
                                            }`}
                                    >
                                        {service.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AnimateIn>
    );
};

function StarIcon({ className }: { className?: string }) {
    return <Star size={20} className={className} />;
}

function Star({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
