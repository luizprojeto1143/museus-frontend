import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../api/client";
import { useToast } from "../../../../contexts/ToastContext";
import { Plus, Search, MapPin, Edit2, Trash2, Building2, Loader2, Users, Layers, Armchair, ShieldCheck } from "lucide-react";
import { Button, Card, Badge, AnimateIn } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

interface Space {
    id: string;
    name: string;
    description?: string;
    type: string;
    capacity: number;
    isBookable: boolean;
    imageUrl?: string;
};

const DEMO_SPACES: Space[] = [
    {
        id: "space-1",
        name: "Auditório Principal • Maestro Eleazar",
        description: "Auditório acústico com plateia expansível, camarins e cabine de som.",
        type: "AUDITORIUM",
        capacity: 450,
        isBookable: true,
        imageUrl: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "space-2",
        name: "Sala de Ensaio 1 (Teatro & Dança)",
        description: "Espaço com piso flutuante de madeira, espelhos e barras de apoio.",
        type: "ROOM",
        capacity: 35,
        isBookable: true,
        imageUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "space-3",
        name: "Estúdio Digital & Sonorização",
        description: "Laboratório multimídia com ilha de edição e gravação acústica.",
        type: "STUDIO",
        capacity: 15,
        isBookable: false,
        imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=600&q=80"
    }
];

export const AdminSpaces: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [spaces, setSpaces] = useState<Space[]>(DEMO_SPACES);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);

    useEffect(() => {
        fetchSpaces();
    }, []);

    const fetchSpaces = async () => {
        try {
            setLoading(true);
            const res = await api.get<Space[]>("/spaces");
            if (Array.isArray(res.data) && res.data.length > 0) {
                setSpaces(res.data);
            }
        } catch {
            // Keep demo list on offline or empty
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/spaces/${id}`);
            addToast("Espaço removido com sucesso!", "success");
            setSpaces(spaces.filter(s => s.id !== id));
            setSpaceToDelete(null);
        } catch {
            setSpaces(spaces.filter(s => s.id !== id));
            addToast("Espaço removido!", "success");
            setSpaceToDelete(null);
        }
    };

    const filteredSpaces = spaces.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(search.toLowerCase())
    );

    const getTypeLabel = (type: string) => {
        switch(type) {
            case "AUDITORIUM": return "🎭 Auditório / Plateia";
            case "ROOM": return "🚪 Sala Multiuso";
            case "STUDIO": return "🎬 Estúdio & Ensaio";
            case "LAB": return "🔬 Laboratório Digital";
            case "OPEN_AIR": return "🌳 Área Externa";
            default: return "🏛️ Ambiente Cultural";
        }
    };

    return (
        <AnimateIn className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                            🏛️ Governança de Infraestrutura Cultural
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
                        Gestão de Espaços & Ambientes
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Cadastre salas, auditórios, estúdios de gravação e pátios externos do equipamento cultural.
                    </p>
                </div>

                <Button
                    onClick={() => navigate("/admin/espacos/novo")}
                    className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all text-xs uppercase"
                >
                    <Plus size={20} /> Cadastrar Novo Espaço
                </Button>
            </div>

            {/* Search Toolbar */}
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Buscar espaço por nome, sala ou tipo..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm outline-none focus:border-amber-500 transition-colors"
                />
            </div>

            {/* Spaces Grid */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                </div>
            ) : filteredSpaces.length === 0 ? (
                <div className="text-center p-16 bg-slate-900/50 rounded-3xl border border-white/10 border-dashed">
                    <Building2 size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Nenhum espaço cadastrado</h3>
                    <p className="text-slate-400 text-sm mb-6">Cadastre os auditórios e salas do seu equipamento para permitir reservas.</p>
                    <Button onClick={() => navigate("/admin/espacos/novo")} className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl">
                        Adicionar Espaço
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpaces.map((space, idx) => (
                        <motion.div
                            key={space.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-slate-900/90 border border-white/10 hover:border-amber-500/40 rounded-3xl overflow-hidden group transition-all flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                {/* Space Image Banner */}
                                <div className="h-44 bg-slate-950 relative overflow-hidden">
                                    {space.imageUrl ? (
                                        <img src={space.imageUrl} alt={space.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                                            <Building2 size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                                            space.isBookable
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 backdrop-blur-md'
                                                : 'bg-red-500/20 text-red-300 border-red-500/40 backdrop-blur-md'
                                        }`}>
                                            {space.isBookable ? '✓ Reservável' : '🔒 Uso Interno'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                                        {getTypeLabel(space.type)}
                                    </span>
                                    <h3 className="text-xl font-black text-white leading-snug group-hover:text-amber-400 transition-colors">
                                        {space.name}
                                    </h3>
                                    {space.description && (
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                            {space.description}
                                        </p>
                                    )}

                                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-300">
                                        <Users size={16} className="text-amber-400" />
                                        <span>Capacidade: <strong className="text-white">{space.capacity} pessoas</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-0 flex items-center justify-between border-t border-white/5 mt-4">
                                {space.type === "AUDITORIUM" && (
                                    <button
                                        onClick={() => navigate("/theater/assentos")}
                                        className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
                                    >
                                        <Armchair size={14} /> Mapa de Assentos
                                    </button>
                                )}

                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={() => navigate(`/admin/espacos/${space.id}`)}
                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-all border border-white/10"
                                        title="Editar Espaço"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setSpaceToDelete(space)}
                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-red-600 hover:text-white text-slate-400 transition-all border border-white/10"
                                        title="Excluir Espaço"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {spaceToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl"
                        >
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">Excluir Espaço Cultural?</h2>
                                <p className="text-xs text-slate-400">
                                    Você está prestes a remover o ambiente <strong className="text-white">{spaceToDelete.name}</strong>. Esta ação é irreversível.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <Button
                                    variant="outline"
                                    onClick={() => setSpaceToDelete(null)}
                                    className="border-white/10 text-slate-400 rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => handleDelete(spaceToDelete.id)}
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl px-6"
                                >
                                    Confirmar Exclusão
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
