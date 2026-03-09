import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";
import { Button, Input, Textarea } from "../../../components/ui";
import { MessageSquare, Heart, Share2, Send, Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./CommunityFeed.css";

interface Post {
    id: string;
    content: string;
    mediaUrl?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    user: { name: string };
    createdAt: string;
}

export const CommunityFeed: React.FC = () => {
    const { targetId } = useParams<{ targetId: string }>();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/community?targetId=${targetId}`);
            setPosts(res.data);
        } catch (err) {
            console.error("Erro ao carregar feed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [targetId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post("/community", {
                content: newPost,
                targetId,
                targetType: "SPACE" // Or WORK depending on context
            });
            setNewPost("");
            alert("Sua memória foi enviada para curadoria! ✨");
        } catch (err) {
            console.error("Erro ao enviar post:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="community-container">
            <header className="community-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <MessageSquare className="mr-2 inline text-[var(--accent-primary)]" />
                    Comunidade & Memórias
                </motion.h1>
                <p>Compartilhe suas histórias e viva a cultura local</p>
            </header>

            <motion.form
                className="community-form-card glass"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Textarea
                    placeholder="O que esta obra ou espaço te faz lembrar?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                    className="community-input"
                />
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-[var(--fg-muted)]">
                        Sua história será analisada pela curadoria antes de ser publicada.
                    </span>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        className="btn-primary-gradient"
                        leftIcon={<Send size={18} />}
                    >
                        Compartilhar
                    </Button>
                </div>
            </motion.form>

            <div className="community-feed">
                {loading ? (
                    <div className="text-center py-20 opacity-50">Carregando memórias...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 glass rounded-xl border-dashed border-2 border-[var(--border-subtle)]">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-[var(--fg-muted)]">Seja o primeiro a compartilhar uma memória!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {posts.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                className="post-card glass"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="post-owner">
                                    <div className="post-avatar">
                                        {post.user.name.charAt(0)}
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="font-bold text-sm">{post.user.name}</h4>
                                        <span className="text-[10px] text-[var(--fg-muted)] flex items-center">
                                            <Clock size={10} className="mr-1" />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="ml-auto">
                                        <ShieldCheck size={16} className="text-[var(--accent-primary)] opacity-50" />
                                    </div>
                                </div>
                                <div className="post-content">
                                    {post.content}
                                </div>
                                <div className="post-actions">
                                    <button className="post-action-btn"><Heart size={18} /></button>
                                    <button className="post-action-btn"><Share2 size={18} /></button>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
