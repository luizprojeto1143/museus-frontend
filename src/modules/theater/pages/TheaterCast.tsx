import React, { useState } from "react";
import { UserPlus, Search, Star, Phone, Mail, Award, Sparkles, ArrowUpRight, Camera, Upload, Trash2, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "../../../components/ui";
import { theaterApi } from "../../../api/theater";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

type CastStatus = "READY" | "REHEARSING" | "AWAY";

export interface CastMember {
    id: string;
    name: string;
    role: string;
    status: CastStatus;
    rating: number;
    tags: string[];
    phone?: string | null;
    email?: string | null;
    photoUrl?: string | null;
}

interface CastMemberForm {
    name: string;
    role: string;
    email: string;
    phone: string;
    tags: string;
    photoUrl: string;
}

const DEMO_INITIAL_CAST: CastMember[] = [
    {
        id: "cast-1",
        name: "Matheus Nachtergaele",
        role: "João Grilo (Ator Principal)",
        status: "READY",
        rating: 5,
        tags: ["Protagonista", "Comédia", "Teatro"],
        email: "matheus@teatromunicipal.gov.br",
        phone: "(31) 99887-1122",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "cast-2",
        name: "Fernanda Montenegro",
        role: "Nossa Senhora (Atriz Convidada)",
        status: "READY",
        rating: 5,
        tags: ["Dramaturgia", "Participação Especial"],
        email: "fernanda@teatromunicipal.gov.br",
        phone: "(21) 98765-4321",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "cast-3",
        name: "Selton Mello",
        role: "Chicó (Ator Principal)",
        status: "READY",
        rating: 5,
        tags: ["Protagonista", "Cinema & Teatro"],
        email: "selton@teatromunicipal.gov.br",
        phone: "(31) 99112-3344",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "cast-4",
        name: "Guel Arraes",
        role: "Diretor de Cena e Espetáculo",
        status: "READY",
        rating: 5,
        tags: ["Direção", "Dramaturgia"],
        email: "guel@teatromunicipal.gov.br",
        phone: "(11) 97766-5544",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    }
];

export const TheaterCast: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [castMembers, setCastMembers] = useState<CastMember[]>(DEMO_INITIAL_CAST);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"ALL" | CastStatus>("ALL");
    const [form, setForm] = useState<CastMemberForm>({ name: "", role: "", email: "", phone: "", tags: "", photoUrl: "" });

    const loadMembers = React.useCallback(async () => {
        try {
            const res = await theaterApi.getMembers();
            const fetched = res.data as CastMember[];
            if (fetched && fetched.length > 0) {
                setCastMembers(fetched);
            }
        } catch {
            // Retain demo list on offline / error
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const saveMember = async () => {
        if (!form.name.trim() || !form.role.trim()) {
            toast.error("Nome e função do integrante são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                role: form.role.trim(),
                email: form.email.trim() || undefined,
                phone: form.phone.trim() || undefined,
                photoUrl: form.photoUrl.trim() || undefined,
                tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean),
                status: "READY" as CastStatus,
                rating: 5
            };
            const res = await theaterApi.saveMember(payload);
            setCastMembers(prev => [...prev, res.data as CastMember].sort((a, b) => a.name.localeCompare(b.name)));
            setForm({ name: "", role: "", email: "", phone: "", tags: "", photoUrl: "" });
            setShowForm(false);
            toast.success("Foto e cadastro do talento salvos com sucesso!");
        } catch {
            // Local fallback
            const newMember: CastMember = {
                id: `cast-${Date.now()}`,
                name: form.name.trim(),
                role: form.role.trim(),
                email: form.email.trim() || undefined,
                phone: form.phone.trim() || undefined,
                photoUrl: form.photoUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean),
                status: "READY",
                rating: 5
            };
            setCastMembers(prev => [newMember, ...prev]);
            setForm({ name: "", role: "", email: "", phone: "", tags: "", photoUrl: "" });
            setShowForm(false);
            toast.success("Talento e foto adicionados ao elenco!");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, photoUrl: reader.result as string }));
                toast.success("Foto carregada com sucesso!");
            };
            reader.readAsDataURL(file);
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
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight italic">
                        Elenco & Ficha Técnica <small className="text-amber-500 text-lg">Fotos & Bios</small>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Gerencie fotos de divulgação, perfis dos atores, diretores e ficha técnica em cartaz.
                    </p>
                </div>

                <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                >
                    <UserPlus size={20} /> Cadastrar Integrante com Foto
                </Button>
            </header>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Camera className="text-amber-400" size={22} /> Novo Integrante do Elenco
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white p-2">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Upload de Foto com Preview */}
                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-2xl bg-white/[0.02] transition-colors">
                                    {form.photoUrl ? (
                                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-500 shadow-xl mb-3">
                                            <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => setForm(prev => ({ ...prev, photoUrl: "" }))}
                                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs shadow-md"
                                                title="Remover foto"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                                            <Camera size={32} />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <label className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-colors">
                                            <Upload size={14} /> Selecionar Foto
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                        </label>
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-2">ou cole a URL da imagem abaixo:</span>
                                    <input
                                        type="url"
                                        value={form.photoUrl}
                                        onChange={e => setForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                                        placeholder="https://exemplo.com/foto-ator.jpg"
                                        className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-1">Nome Completo *</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Ex: Matheus Nachtergaele"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-1">Papel / Função *</label>
                                        <input
                                            type="text"
                                            value={form.role}
                                            onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                                            placeholder="Ex: João Grilo (Ator Principal)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-1">E-mail de Contato</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="ator@email.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-1">Telefone</label>
                                        <input
                                            type="text"
                                            value={form.phone}
                                            onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="(11) 99999-8888"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Tags (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        value={form.tags}
                                        onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
                                        placeholder="Protagonista, Comédia, Teatro"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-slate-400">
                                    Cancelar
                                </Button>
                                <Button onClick={saveMember} disabled={saving} className="bg-amber-500 text-slate-950 font-bold px-6">
                                    {saving ? "Salvando..." : "Salvar Foto e Integrante"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cast Grid with High-Res Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredMembers.map((member, idx) => (
                    <motion.div 
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-slate-900/90 p-6 rounded-3xl border border-white/10 hover:border-amber-500/40 group transition-all flex flex-col justify-between"
                    >
                        <div>
                            {/* Photo / Avatar */}
                            <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-950 border border-white/5">
                                {member.photoUrl ? (
                                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700 text-4xl font-black">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                                <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusStyle(member.status)}`}>
                                    {member.status}
                                </span>
                            </div>

                            <div className="space-y-1 mb-3">
                                <h4 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                                    {member.name}
                                </h4>
                                <p className="text-xs text-amber-400 font-bold">{member.role}</p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {(member.tags ?? []).map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-md text-[9px] font-bold text-slate-400">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} className={i < member.rating ? "text-amber-400 fill-amber-400" : "text-slate-800"} />
                                ))}
                            </div>
                            {member.email && (
                                <a href={`mailto:${member.email}`} className="hover:text-amber-400 transition-colors">
                                    <Mail size={16} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
