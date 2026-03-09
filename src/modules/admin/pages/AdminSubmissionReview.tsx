import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Inbox, Check, X, User, MapPin, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

export const AdminSubmissionReview: React.FC = () => {
    const { tenantId } = useAuth();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/roadmap-family/submissions?tenantId=${tenantId}&status=${filter}`);
            setSubmissions(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar submissões");
        } finally {
            setLoading(false);
        }
    }, [tenantId, filter]);

    useEffect(() => {
        if (tenantId) fetchSubmissions();
    }, [tenantId, fetchSubmissions]);

    const handleModerate = async (id: string, status: "APPROVED" | "REJECTED") => {
        try {
            // Reusing status update logic or specific route if needed
            // For now assuming we add status update to backend or use generic update
            await api.put(`/roadmap-family/submissions/${id}`, { status });
            toast.success(status === "APPROVED" ? "Obra aprovada!" : "Obra rejeitada!");
            fetchSubmissions();
        } catch (err) {
            toast.error("Erro ao moderar");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <Inbox className="text-[var(--accent-primary)]" />
                        Curadoria de Obras (Visitantes)
                    </h1>
                    <p className="opacity-60 text-sm">Analise contribuições artísticas e históricas da comunidade</p>
                </div>

                <div className="flex bg-zinc-900 p-1 rounded-lg">
                    {["PENDING", "APPROVED", "REJECTED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === s ? "bg-[var(--accent-primary)] text-black" : "text-zinc-500 hover:text-white"
                                }`}
                        >
                            {s === "PENDING" ? "Pendentes" : s === "APPROVED" ? "Aprovadas" : "Rejeitadas"}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent-primary)]" /></div>
            ) : submissions.length === 0 ? (
                <div className="text-center py-20 glass border-2 border-dashed border-zinc-800">
                    <p className="opacity-30">Nenhuma submissão {filter === "PENDING" ? "pendente" : ""} encontrada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-6">
                    {submissions.map((sub) => (
                        <div key={sub.id} className="card overflow-hidden border-zinc-800 bg-zinc-900 group">
                            <div className="aspect-video relative overflow-hidden bg-black">
                                {sub.imageUrl ? (
                                    <img src={sub.imageUrl} alt={sub.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="flex items-center justify-center h-full opacity-20">Sem Imagem</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-bold text-white">{sub.title}</h3>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <p className="text-sm text-zinc-400 line-clamp-3 italic">"{sub.description}"</p>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                                    <div className="flex items-center gap-2 text-xs opacity-50">
                                        <User size={14} /> {sub.user?.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs opacity-50">
                                        <MapPin size={14} /> Espaço #{sub.spaceId?.substring(0, 8)}
                                    </div>
                                </div>

                                {sub.status === "PENDING" && (
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={() => handleModerate(sub.id, "APPROVED")}
                                            className="flex items-center justify-center gap-2 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl font-bold transition-all"
                                        >
                                            <Check size={18} /> Aprovar
                                        </button>
                                        <button
                                            onClick={() => handleModerate(sub.id, "REJECTED")}
                                            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all"
                                        >
                                            <X size={18} /> Rejeitar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
