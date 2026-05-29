import React, { useState } from "react";
import { 
    Users, UserPlus, Search, Filter, 
    Star, Phone, Mail, Award, 
    Calendar, CheckCircle2, XCircle, Clock,
    Sparkles, ArrowUpRight, MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Input } from "../../../components/ui";

import { theaterApi } from "../../../api/theater";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const TheaterCast: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [castMembers, setCastMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMembers = async () => {
        try {
            const res = await theaterApi.getMembers();
            setCastMembers(res.data);
        } catch (err) {
            toast.error(t("theater.cast.load_error", "Erro ao carregar elenco"));
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadMembers();
    }, []);

    const filteredMembers = castMembers.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch(status) {
            case "READY": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "REHEARSING": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "AWAY": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4">
            {/* ═══ HEADER ═══════════ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">{t("theater.cast.management_system", "Talent Management System")}</span>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">{t("theater.cast.title", "Elenco & Crew")}</h1>
                    <p className="text-slate-500 font-medium mt-2">{t("theater.cast.subtitle", "Gerencie sua força criativa, elencos e equipes técnicas.")}</p>
                </div>
                <div className="flex gap-4">
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 rounded-3xl font-black italic shadow-2xl shadow-red-600/20 flex items-center gap-3">
                        <UserPlus size={20} /> {t("theater.cast.new_talent", "Novo Talento")}
                    </Button>
                </div>
            </div>

            {/* ═══ AI MATCHMAKING BANNER ═════════ */}
            <div className="premium-glass p-8 rounded-[40px] border-red-500/30 bg-red-500/5 flex items-center gap-8 group">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-black rounded-3xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-red-600/30 group-hover:scale-110 transition-transform">
                    <Sparkles size={32} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black text-white italic">{t("theater.cast.ai_matchmaking", "IA Matchmaking: Sugestão de Casting")}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mt-1">
                        {t("theater.cast.ai_suggestion", "\"Para o papel de Carlotta Giudicelli, identifiquei que Christine Daaé possui a tessitura vocal ideal e 98% de compatibilidade com o cronograma de ensaios.\"")}
                    </p>
                </div>
                <Button variant="secondary" className="text-[10px] px-6">{t("theater.cast.view_analysis", "Ver Análise")}</Button>
            </div>

            {/* ═══ SEARCH & FILTERS ═════════ */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-red-500 transition-colors" size={20} />
                    <Input 
                        placeholder={t("theater.cast.search_placeholder", "Buscar por nome, papel ou especialidade...")}
                        className="bg-black/40 border-white/5 text-white pl-16 py-8 rounded-[32px] focus:border-red-500/50"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="secondary" className="px-8 py-8 rounded-[32px] flex items-center gap-3 font-black text-xs uppercase tracking-widest">
                    <Filter size={20} /> {t("theater.cast.advanced_filters", "Filtros Avançados")}
                </Button>
            </div>

            {/* ═══ CAST GRID ═════════ */}
            {loading ? (
                <div className="flex justify-center p-20 text-white font-black italic animate-pulse">{t("theater.cast.syncing", "Sincronizando Talentos...")}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredMembers.map((member, idx) => (
                    <motion.div 
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="premium-glass p-8 rounded-[48px] border-white/5 hover:border-red-500/20 group transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-slate-800 to-black flex items-center justify-center text-white text-2xl font-black shadow-xl group-hover:scale-110 transition-transform border border-white/5">
                                {member.name.charAt(0)}
                            </div>
                            <button className="text-slate-700 hover:text-white transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="space-y-1 mb-6">
                            <h4 className="text-lg font-black text-white">{member.name}</h4>
                            <p className="text-xs text-red-500 font-black uppercase tracking-widest">{member.role}</p>
                        </div>

                        <div className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest w-fit mb-6 ${getStatusStyle(member.status)}`}>
                            {member.status}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {member.tags.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-slate-500">#{tag}</span>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} className={i < member.rating ? "text-gold-500 fill-gold-500" : "text-slate-800"} />
                                ))}
                            </div>
                            <button className="text-slate-500 hover:text-red-500 transition-colors">
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                </div>
            )}

            {/* ═══ TECHNICAL CREW MINI LIST ═════════ */}
            <section className="premium-glass p-10 rounded-[48px] border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                        <Award className="text-red-500" /> {t("theater.cast.technical_crew", "Equipe Técnica (Backstage)")}
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("theater.cast.active_members", "12 Membros Ativos")}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: "Luan Silva", skill: "Iluminação", active: true },
                        { name: "Beatriz M.", skill: "Sonorização", active: true },
                        { name: "Ricardo P.", skill: "Cenografia", active: false },
                    ].map((tech, i) => (
                        <div key={tech.name} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className={`w-3 h-3 rounded-full ${tech.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                            <div className="flex-1">
                                <p className="text-sm font-black text-white">{tech.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{tech.skill}</p>
                            </div>
                            <div className="flex gap-2">
                                <Phone size={14} className="text-slate-600 hover:text-white cursor-pointer" />
                                <Mail size={14} className="text-slate-600 hover:text-white cursor-pointer" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
