import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Star, Send, CheckCircle, MessageSquare } from 'lucide-react';

interface SurveyQuestion {
    id: string;
    question: string;
    type: 'STARS' | 'TEXT' | 'CHOICE' | 'NPS';
    options?: string[];
    required: boolean;
}

export const EventSurveyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, email, tenantId } = useAuth();
    const navigate = useNavigate();

    const user = isAuthenticated ? { email: email || "" } : null;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [guestEmail, setGuestEmail] = useState("");

    useEffect(() => {
        if (id) {
            loadSurvey();
        }
    }, [id]);

    const loadSurvey = async () => {
        try {
            const eventRes = await api.get(`/events/${id}`);
            setEventTitle(eventRes.data.title);

            const surveyRes = await api.get(`/events/${id}/survey`);
            setQuestions(surveyRes.data);

            // If user is logged in, try to load existing responses
            if (user) {
                try {
                    const myResp = await api.get(`/events/${id}/survey/my-responses`);
                    const loadedAnswers: Record<string, string | number> = {};
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    myResp.data.forEach((r: any) => {
                        loadedAnswers[r.questionId] = r.answer;
                    });
                    setAnswers(loadedAnswers);
                    if (myResp.data.length > 0 && myResp.data.length === surveyRes.data.length) {
                        // All answered
                        setSuccess(true);
                    }
                } catch (error) {
                    console.warn("Failed to load existing responses or none found", error);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                answers: Object.entries(answers).map(([qId, val]) => ({
                    questionId: qId,
                    answer: String(val)
                })),
                guestEmail: user ? undefined : guestEmail
            };

            await api.post(`/events/${id}/survey/respond`, payload);
            setSuccess(true);
        } catch (err: unknown) {
            console.error(err);
            const error = err as { response?: { data?: { error?: string } } };
            alert(error.response?.data?.error || 'Erro ao enviar respostas.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswer = (qId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    if (loading) return <div className="p-8 text-center">Carregando pesquisa...</div>;

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center animate-fadeIn">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Obrigado!</h2>
                    <p className="text-gray-600 mb-6">Suas respostas foram enviadas com sucesso.</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary w-full">
                        Voltar para o Início
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Este evento não possui uma pesquisa ativa.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-600 p-8 text-white">
                        <h1 className="text-2xl font-bold mb-2">{eventTitle}</h1>
                        <p className="text-blue-100">Pesquisa de Satisfação</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {!user && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                                <label className="blocks text-sm font-bold text-yellow-800 mb-1">Seu E-mail *</label>
                                <input
                                    type="email"
                                    required
                                    className="input w-full border-yellow-300 focus:ring-yellow-500"
                                    value={guestEmail}
                                    onChange={e => setGuestEmail(e.target.value)}
                                    placeholder="nome@email.com"
                                />
                                <p className="text-xs text-yellow-700 mt-1">Necessário para identificar sua participação.</p>
                            </div>
                        )}

                        {questions.map((q) => (
                            <div key={q.id} className="space-y-3">
                                <label className="block font-medium text-gray-900">
                                    {q.question} {q.required && <span className="text-red-500">*</span>}
                                </label>

                                {q.type === 'STARS' && (
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleAnswer(q.id, star)}
                                                className={`p-2 rounded-lg transition-colors ${answers[q.id] >= star ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            >
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'NPS' && (
                                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                            <button
                                                key={score}
                                                type="button"
                                                onClick={() => handleAnswer(q.id, score)}
                                                className={`w-10 h-10 rounded-lg font-bold border transition-all ${String(answers[q.id]) === String(score)
                                                    ? 'bg-blue-600 text-white border-blue-600 scale-110'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'CHOICE' && (
                                    <div className="space-y-2">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={opt}
                                                    checked={answers[q.id] === opt}
                                                    onChange={() => handleAnswer(q.id, opt)}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'TEXT' && (
                                    <textarea
                                        className="input w-full min-h-[100px]"
                                        value={answers[q.id] || ''}
                                        onChange={e => handleAnswer(q.id, e.target.value)}
                                        placeholder="Digite sua resposta aqui..."
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-blue-200"
                            >
                                {submitting ? 'Enviando...' : 'Enviar Avaliação'} <Send className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
