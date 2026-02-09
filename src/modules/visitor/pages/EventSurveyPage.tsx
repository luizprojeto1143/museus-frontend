import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Star, Send, CheckCircle, MessageSquare, Loader2, Mail } from 'lucide-react';
import { Button, Input, Textarea } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";

interface SurveyQuestion {
    id: string;
    question: string;
    type: 'STARS' | 'TEXT' | 'CHOICE' | 'NPS';
    options?: string[];
    required: boolean;
}

export const EventSurveyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, email: authEmail } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const currentUser = isAuthenticated ? { email: authEmail || "" } : null;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [guestEmail, setGuestEmail] = useState("");

    const loadSurvey = useCallback(async () => {
        try {
            const eventRes = await api.get(`/events/${id}`);
            setEventTitle(eventRes.data.title);

            const surveyRes = await api.get(`/events/${id}/survey`);
            setQuestions(surveyRes.data);

            if (currentUser) {
                try {
                    const myResp = await api.get(`/events/${id}/survey/my-responses`);
                    const loadedAnswers: Record<string, string | number> = {};
                    myResp.data.forEach((r: any) => {
                        loadedAnswers[r.questionId] = r.answer;
                    });
                    setAnswers(loadedAnswers);
                    if (myResp.data.length > 0 && myResp.data.length === surveyRes.data.length) {
                        setSuccess(true);
                    }
                } catch (error) {
                    console.warn("Failed to load existing responses or none found", error);
                }
            }
        } catch (error) {
            console.error(error);
            addToast("Falha ao carregar a pesquisa.", "error");
        } finally {
            setLoading(false);
        }
    }, [id, currentUser, addToast]);

    useEffect(() => {
        if (id) {
            loadSurvey();
        }
    }, [id, loadSurvey]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                answers: Object.entries(answers).map(([qId, val]) => ({
                    questionId: qId,
                    answer: String(val)
                })),
                guestEmail: currentUser ? undefined : guestEmail
            };

            await api.post(`/events/${id}/survey/respond`, payload);
            setSuccess(true);
            addToast("Pesquisa enviada com sucesso!", "success");
        } catch (err: any) {
            console.error(err);
            addToast(err.response?.data?.error || 'Erro ao enviar respostas.', "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswer = (qId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 mr-2" />
            <span className="text-slate-400">Carregando pesquisa...</span>
        </div>
    );

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
                <div className="bg-white/5 border border-white/10 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center animate-fadeIn">
                    <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Obrigado!</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">Suas respostas foram enviadas com sucesso e nos ajudarão a melhorar cada vez mais.</p>
                    <Button onClick={() => navigate('/')} className="w-full py-4 text-lg">
                        Voltar para o Início
                    </Button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <p className="text-slate-500 italic">Este evento não possui uma pesquisa ativa no momento.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white">
                        <h1 className="text-3xl font-bold mb-2">{eventTitle}</h1>
                        <p className="text-blue-100/70 font-medium uppercase tracking-wider text-sm">Pesquisa de Satisfação</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-10">
                        {!currentUser && (
                            <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20 mb-8 space-y-4">
                                <Input
                                    label="Seu E-mail *"
                                    type="email"
                                    required
                                    value={guestEmail}
                                    onChange={e => setGuestEmail(e.target.value)}
                                    placeholder="nome@email.com"
                                    leftIcon={<Mail size={16} />}
                                />
                                <p className="text-xs text-blue-400 font-medium">Para validar sua participação, informe seu e-mail.</p>
                            </div>
                        )}

                        {questions.map((q) => (
                            <div key={q.id} className="space-y-4">
                                <label className="block text-lg font-bold text-white flex gap-2">
                                    {q.question} {q.required && <span className="text-red-500">*</span>}
                                </label>

                                {q.type === 'STARS' && (
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleAnswer(q.id, star)}
                                                className={`p-3 rounded-xl transition-all hover:scale-110 ${answers[q.id] >= star ? 'text-yellow-400 bg-yellow-400/10 lg:bg-transparent' : 'text-white/10 hover:text-white/20'
                                                    }`}
                                            >
                                                <Star className={`w-10 h-10 ${answers[q.id] >= star ? 'fill-current' : 'fill-none'}`} />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'NPS' && (
                                    <div className="flex flex-wrap gap-2">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                            <button
                                                key={score}
                                                type="button"
                                                onClick={() => handleAnswer(q.id, score)}
                                                className={`w-11 h-11 rounded-xl font-black border transition-all ${String(answers[q.id]) === String(score)
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 -translate-y-1'
                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'CHOICE' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {q.options?.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleAnswer(q.id, opt)}
                                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${answers[q.id] === opt
                                                    ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-md'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${answers[q.id] === opt ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                                                    {answers[q.id] === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <span className="font-medium">{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'TEXT' && (
                                    <Textarea
                                        value={answers[q.id] || ''}
                                        onChange={e => handleAnswer(q.id, e.target.value)}
                                        placeholder="Sua opinião é importante para nós..."
                                        rows={4}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-10">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-6 text-xl rounded-2xl shadow-2xl shadow-blue-500/20"
                                leftIcon={<Send size={22} />}
                            >
                                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
