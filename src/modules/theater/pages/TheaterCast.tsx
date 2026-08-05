import React, { useState } from "react";
import { UserPlus, Search, Star, Phone, Mail, Award, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Input } from "../../../components/ui";

import { theaterApi } from "../../../api/theater";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

type CastStatus = "READY" | "REHEARSING" | "AWAY";

interface CastMember {
    id: string;
    name: string;
    role: string;
    status: CastStatus;
    rating: number;
    tags: string[];
    phone?: string | null;
    email?: string | null;
}

interface CastMemberForm {
    name: string;
    role: string;
    email: string;
    phone: string;
    tags: string;
}

export const TheaterCast: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [castMembers, setCastMembers] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"ALL" | CastStatus>("ALL");
    const [form, setForm] = useState<CastMemberForm>({ name: "", role: "", email: "", phone: "", tags: "" });

    const loadMembers = React.useCallback(async () => {
        try {
            const res = await theaterApi.getMembers();
            setCastMembers(res.data as CastMember[]);
        } catch {
            toast.error(t("theater.cast.load_error", "Erro ao carregar elenco"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    React.useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const saveMember = async () => {
        if (!form.name.trim() || !form.role.trim()) {
            toast.error("Nome e função são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                role: form.role.trim(),
                email: form.email.trim() || undefined,
                phone: form.phone.trim() || undefined,
                tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean),
                status: "READY" as CastStatus,
                rating: 5
            };
            const res = await theaterApi.saveMember(payload);
            setCastMembers(prev => [...prev, res.data as CastMember].sort((a, b) => a.name.localeCompare(b.name)));
            setForm({ name: "", role: "", email: "", phone: "", tags: "" });
            setShowForm(false);
            toast.success("Talento cadastrado.");
        } catch {
            toast.error("Erro ao salvar talento.");
        } finally {
            setSaving(false);
        }
    };

    const filteredMembers = castMembers.filter(m => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = m.name.toLowerCase().includes(term) || m.role.toLowerCase().includes(term);
        const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                    <Button onClick={() => setShowForm(value => !value)} className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 rounded-3xl font-black italic shadow-2xl shadow-red-600/20 flex items-center gap-3">
                        <UserPlus size={20} /> {t("theater.cast.new_talent", "Novo Talento")}
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="premium-glass p-8 rounded-[40px] border-red-500/30 bg-red-500/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Nome" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                    <Input placeholder="Função" value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                    <Input placeholder="Email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                    <Input placeholder="Telefone" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                    <Input placeholder="Tags separadas por vírgula" value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} className="bg-black/40 border-white/10 text-white md:col-span-2" />
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={saveMember} isLoading={saving} className="bg-red-600 text-white">Salvar Talento</Button>
                    </div>
                </div>
            )}

            {/* ═══ CAST SUMMARY ═════════ */}
            <div className="premium-glass p-8 rounded-[40px] border-red-500/30 bg-red-500/5 flex flex-col sm:flex-row sm:items-center gap-8 group">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-black rounded-3xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-red-600/30 group-hover:scale-110 transition-transform">
                    <Sparkles size={32} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-white italic">Resumo do elenco cadastrado</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mt-1">
                        {castMembers.length} talentos no cadastro, {castMembers.filter(member => member.status === "READY").length} prontos e {castMembers.filter(member => member.status === "REHEARSING").length} em ensaio.
                    </p>
                </div>
                <Button variant="secondary" onClick={loadMembers} className="text-[10px] px-6">Atualizar</Button>
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
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as "ALL" | CastStatus)}
                    className="px-8 py-5 rounded-[32px] bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest outline-none"
                >
                    <option value="ALL" className="bg-slate-900">Todos</option>
                    <option value="READY" className="bg-slate-900">Prontos</option>
                    <option value="REHEARSING" className="bg-slate-900">Em ensaio</option>
                    <option value="AWAY" className="bg-slate-900">Ausentes</option>
                </select>
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
                            {member.email && (
                                <a href={`mailto:${member.email}`} className="text-slate-700 hover:text-white transition-colors">
                                    <Mail size={20} />
                                </a>
                            )}
                        </div>

                        <div className="space-y-1 mb-6">
                            <h4 className="text-lg font-black text-white">{member.name}</h4>
                            <p className="text-xs text-red-500 font-black uppercase tracking-widest">{member.role}</p>
                        </div>

                        <div className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest w-fit mb-6 ${getStatusStyle(member.status)}`}>
                            {member.status}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {(member.tags ?? []).map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-slate-500">#{tag}</span>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} className={i < member.rating ? "text-gold-500 fill-gold-500" : "text-slate-800"} />
                                ))}
                            </div>
                            {member.email && (
                                <a href={`mailto:${member.email}`} className="text-slate-500 hover:text-red-500 transition-colors">
                                    <ArrowUpRight size={18} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
                </div>
            )}

            {/* ═══ CONTACT LIST ═════════ */}
            <section className="premium-glass p-10 rounded-[48px] border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                        <Award className="text-red-500" /> Contatos cadastrados
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{castMembers.length} registros</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {castMembers.filter(member => member.email || member.phone).slice(0, 6).map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className={`w-3 h-3 rounded-full ${member.status === "READY" ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white">{member.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{member.role}</p>
                            </div>
                            <div className="flex gap-2">
                                {member.phone && <a href={`tel:${member.phone}`}><Phone size={14} className="text-slate-600 hover:text-white cursor-pointer" /></a>}
                                {member.email && <a href={`mailto:${member.email}`}><Mail size={14} className="text-slate-600 hover:text-white cursor-pointer" /></a>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
