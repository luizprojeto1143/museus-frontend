import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  User, 
  Clock, 
  Filter, 
  MessageCircle, 
  BookOpen, 
  Eye, 
  EyeOff,
  Trash2,
  Check,
  ShieldCheck,
  Flame,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { 
  Card, 
  Button, 
  Badge, 
  AnimateIn 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    approved: boolean;
    createdAt: string;
    visitor: {
        name: string;
        photoUrl: string | null;
    };
    work?: { title: string };
    event?: { title: string };
}

interface GuestbookEntry {
    id: string;
    message: string;
    isVisible: boolean;
    createdAt: string;
    visitor: {
        name: string;
        photoUrl: string | null;
    };
}

type TabMode = 'reviews' | 'guestbook';

export const AdminReviews: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [mode, setMode] = useState<TabMode>('reviews');

    // Reviews State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('pending');

    // Guestbook State
    const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mode === 'reviews') fetchReviews();
        else fetchGuestbook();
    }, [tenantId, mode, reviewFilter]);

    const fetchReviews = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const approved = reviewFilter === 'all' ? 'all' : reviewFilter === 'approved' ? 'true' : 'false';
            const res = await api.get(`/reviews?tenantId=${tenantId}&approved=${approved}`);
            setReviews(res.data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error("Erro ao carregar avaliações");
        } finally {
            setLoading(false);
        }
    };

    const fetchGuestbook = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await api.get(`/guestbook?tenantId=${tenantId}&includeHidden=true`);
            setGuestbook(res.data);
        } catch (error) {
            console.error('Error fetching guestbook:', error);
            toast.error("Erro ao carregar livro de visitas");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReview = async (id: string) => {
        try {
            await api.patch(`/reviews/${id}/approve`);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
            toast.success("Avaliação aprovada!");
        } catch (error) {
            toast.error("Erro ao aprovar avaliação");
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta avaliação?')) return;
        try {
            await api.delete(`/reviews/${id}`);
            setReviews(prev => prev.filter(r => r.id !== id));
            toast.success("Avaliação excluída");
        } catch (error) {
            toast.error("Erro ao excluir");
        }
    };

    const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/guestbook/${id}/visibility`, { isVisible: !currentStatus });
            setGuestbook(prev => prev.map(g => g.id === id ? { ...g, isVisible: !currentStatus } : g));
            toast.success(currentStatus ? "Mensagem ocultada" : "Mensagem visível");
        } catch (error) {
            toast.error("Erro ao atualizar visibilidade");
        }
    };

    const handleDeleteGuestbook = async (id: string) => {
        if (!confirm('Excluir mensagem do livro de visitas?')) return;
        try {
            await api.delete(`/guestbook/${id}`);
            setGuestbook(prev => prev.filter(g => g.id !== id));
            toast.success("Mensagem excluída");
        } catch (error) {
            toast.error("Erro ao excluir");
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < rating ? 'text-gold-400 fill-gold-400' : 'text-slate-700'}
                    />
                ))}
            </div>
        );
    };

    const pendingCount = reviews.filter(r => !r.approved).length;

    return (
        <AnimateIn className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <ShieldCheck className="text-gold-400" size={32} />
                        Central de Moderação
                    </h1>
                    <p className="text-slate-400 font-medium">Garanta a qualidade e o sentimento positivo da sua comunidade.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                    <button
                        onClick={() => setMode('reviews')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'reviews' ? 'bg-gold-400 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Star size={16} /> Avaliações
                        {pendingCount > 0 && <span className="ml-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">{pendingCount}</span>}
                    </button>
                    <button
                        onClick={() => setMode('guestbook')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'guestbook' ? 'bg-gold-400 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        <BookOpen size={16} /> Livro de Visitas
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'reviews' ? (
                    <motion.div
                        key="reviews"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Filters */}
                        <div className="flex items-center gap-3">
                            {(['pending', 'approved', 'all'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setReviewFilter(filter)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${reviewFilter === filter ? 'bg-white/10 text-white border-white/20' : 'text-slate-500 border-white/5 hover:border-white/10'}`}
                                >
                                    {filter === 'pending' ? 'Pendentes' : filter === 'approved' ? 'Aprovadas' : 'Todas'}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Card key={i} className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] h-[200px] animate-pulse" />
                                ))
                            ) : reviews.length === 0 ? (
                                <div className="col-span-full py-20 text-center space-y-4">
                                    <MessageSquare className="mx-auto text-slate-800" size={48} />
                                    <p className="text-slate-500 font-medium">Nenhuma avaliação encontrada.</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <Card key={review.id} className={`p-8 bg-white/[0.02] border-white/5 rounded-[32px] hover:border-white/10 transition-all flex flex-col justify-between ${!review.approved ? 'border-l-4 border-l-gold-400' : ''}`}>
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/5">
                                                        {review.visitor.photoUrl ? <img src={review.visitor.photoUrl} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-500" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">{review.visitor.name}</h4>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                {renderStars(review.rating)}
                                            </div>

                                            <div className="mb-4">
                                                <Badge className="bg-white/5 text-slate-400 border-white/10 mb-2">
                                                    {review.work ? `📷 ${review.work.title}` : review.event ? `🎭 ${review.event.title}` : 'Geral'}
                                                </Badge>
                                                <p className="text-slate-300 text-sm italic leading-relaxed">
                                                    "{review.comment || "Sem comentário."}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-6 mt-auto border-t border-white/5">
                                            {!review.approved && (
                                                <Button 
                                                    variant="primary" 
                                                    onClick={() => handleApproveReview(review.id)}
                                                    className="h-10 px-6 rounded-xl bg-gold-400 text-slate-950 hover:bg-gold-500"
                                                >
                                                    <Check size={16} className="mr-2" /> Aprovar
                                                </Button>
                                            )}
                                            <Button 
                                                variant="glass" 
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="h-10 w-10 p-0 rounded-xl border-white/5 hover:bg-red-500/10 hover:text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                            {review.approved && (
                                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Aprovada</Badge>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="guestbook"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] h-[220px] animate-pulse" />
                            ))
                        ) : guestbook.length === 0 ? (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <BookOpen className="mx-auto text-slate-800" size={48} />
                                <p className="text-slate-500 font-medium">O livro de visitas está vazio.</p>
                            </div>
                        ) : (
                            guestbook.map((entry) => (
                                <Card key={entry.id} className={`p-8 bg-white/[0.02] border-white/5 rounded-[32px] flex flex-col justify-between transition-all ${!entry.isVisible ? 'opacity-60 grayscale' : 'hover:border-white/10'}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/5">
                                                    {entry.visitor.photoUrl ? <img src={entry.visitor.photoUrl} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-500" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-sm">{entry.visitor.name}</h4>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-white font-serif italic text-lg leading-relaxed">
                                            "{entry.message}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t border-white/5">
                                        <Button 
                                            variant="glass" 
                                            onClick={() => handleToggleVisibility(entry.id, entry.isVisible)}
                                            className={`h-10 px-4 rounded-xl border-white/5 ${!entry.isVisible ? 'bg-gold-400 text-slate-950' : 'hover:bg-white/10'}`}
                                            title={entry.isVisible ? "Ocultar do público" : "Exibir no público"}
                                        >
                                            {entry.isVisible ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                                            {entry.isVisible ? "Ocultar" : "Exibir"}
                                        </Button>
                                        <Button 
                                            variant="glass" 
                                            onClick={() => handleDeleteGuestbook(entry.id)}
                                            className="h-10 w-10 p-0 rounded-xl border-white/5 hover:bg-red-500/10 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
