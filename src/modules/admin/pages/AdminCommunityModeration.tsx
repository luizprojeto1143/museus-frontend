import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, MessageSquare, Check, X, AlertCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export const AdminCommunityModeration: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/community/admin?tenantId=${tenantId}&status=${filter}`);
            setPosts(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar posts");
        } finally {
            setLoading(false);
        }
    }, [tenantId, filter]);

    useEffect(() => {
        if (tenantId) fetchPosts();
    }, [tenantId, fetchPosts]);

    const handleModerate = async (postId: string, status: "APPROVED" | "REJECTED") => {
        try {
            await api.put(`/community/${postId}/status`, { status });
            toast.success(status === "APPROVED" ? "Post aprovado!" : "Post rejeitado!");
            fetchPosts();
        } catch (err) {
            toast.error("Erro ao moderar");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="text-[var(--accent-primary)]" />
                        Moderação da Comunidade
                    </h1>
                    <p className="text-sm opacity-60">Revise memórias e histórias enviadas pelos visitantes</p>
                </div>

                <div className="flex bg-zinc-900 p-1 rounded-lg">
                    {["PENDING", "APPROVED", "REJECTED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === s
                                    ? "bg-[var(--accent-primary)] text-black"
                                    : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            {s === "PENDING" ? "Pendentes" : s === "APPROVED" ? "Aprovados" : "Rejeitados"}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent-primary)]" /></div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl border-dashed border-2 border-zinc-800">
                    <Clock size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="opacity-40">Nenhum post {filter === "PENDING" ? "pendente" : "encontrado"}.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post) => (
                        <div key={post.id} className="card p-5 border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center font-bold text-black text-xs">
                                            {post.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">{post.user.name}</h4>
                                            <span className="text-[10px] opacity-40">{new Date(post.createdAt).toLocaleString()} • {post.targetType} #{post.targetId}</span>
                                        </div>
                                    </div>

                                    <p className="text-zinc-200 text-sm leading-relaxed">{post.content}</p>

                                    {post.mediaUrl && (
                                        <img
                                            src={post.mediaUrl}
                                            alt="Media"
                                            className="mt-4 rounded-xl max-h-60 object-cover border border-zinc-800"
                                        />
                                    )}
                                </div>

                                {post.status === "PENDING" && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleModerate(post.id, "APPROVED")}
                                            className="p-3 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-green-400 transition-all hover:scale-105"
                                            title="Aprovar"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleModerate(post.id, "REJECTED")}
                                            className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all hover:scale-105"
                                            title="Rejeitar"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}

                                {post.status !== "PENDING" && (
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${post.status === "APPROVED" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                        }`}>
                                        {post.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
