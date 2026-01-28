import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import {
    Plus, Trash2, Save, ArrowDown, ArrowUp,
    Star, Type, List, CheckSquare, MessageSquare, ChevronLeft
} from 'lucide-react';

interface SurveyQuestion {
    id?: string;
    question: string;
    type: 'STARS' | 'TEXT' | 'CHOICE' | 'NPS';
    options?: string[];
    required: boolean;
    order: number;
}

export const AdminEventSurvey: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

    useEffect(() => {
        if (id && tenantId) {
            loadData();
        }
    }, [id, tenantId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Get Event Info
            const eventRes = await api.get(`/events/${id}`);
            setTitle(eventRes.data.title);

            // Get Survey
            const surveyRes = await api.get(`/events/${id}/survey`);
            setQuestions(surveyRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question: "",
                type: 'STARS',
                required: true,
                order: questions.length
            }
        ]);
    };

    const updateQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOptions = (index: number, optionsNum: number) => {
        // Simple logic to just resizing options array for now if needed, 
        // but for CHOICE usually we edit the array strings. 
        // Let's implement options input as a comma separated string for simplicity or dynamic tags.
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)
        ) return;

        const newQuestions = [...questions];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newQuestions[index];
        newQuestions[index] = newQuestions[swapIndex];
        newQuestions[swapIndex] = temp;
        setQuestions(newQuestions);
    };

    const saveSurvey = async () => {
        if (!id) return;
        setSaving(true);
        try {
            // Fix order based on array index
            const payload = questions.map((q, idx) => ({ ...q, order: idx }));
            await api.post(`/events/${id}/survey`, { questions: payload });
            alert('Pesquisa salva com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar pesquisa.');
        } finally {
            setSaving(false);
        }
    };

    // Helper to edit options for CHOICE
    const handleOptionChange = (qIndex: number, optValue: string) => {
        // expects comma separated for simple UI
        const arr = optValue.split(',').map(s => s.trim()).filter(Boolean);
        updateQuestion(qIndex, 'options', arr);
    };

    if (loading) return <div className="p-8">Carregando...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`/admin/eventos/${id}`} className="text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pesquisa de Satisfação</h1>
                    <p className="text-sm text-gray-500">Evento: {title}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
                {questions.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-medium mb-1">Nenhuma pergunta configurada</h3>
                        <p className="text-gray-500 mb-6">Crie um formulário para coletar feedback dos participantes.</p>
                        <button onClick={addQuestion} className="btn btn-primary">
                            <Plus className="w-4 h-4 mr-2" /> Adicionar Primeira Pergunta
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn">
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-2 pt-2 text-gray-400">
                                        <button onClick={() => moveQuestion(index, 'up')} disabled={index === 0} className="hover:text-blue-600 disabled:opacity-30">
                                            <ArrowUp className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1} className="hover:text-blue-600 disabled:opacity-30">
                                            <ArrowDown className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="col-span-8">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Pergunta</label>
                                                <input
                                                    className="input w-full"
                                                    value={q.question}
                                                    onChange={e => updateQuestion(index, 'question', e.target.value)}
                                                    placeholder="Ex: Como você avalia o evento?"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                                                <select
                                                    className="input w-full"
                                                    value={q.type}
                                                    onChange={e => updateQuestion(index, 'type', e.target.value)}
                                                >
                                                    <option value="STARS">⭐ Avaliação (Estrelas)</option>
                                                    <option value="TEXT">📝 Texto Livre</option>
                                                    <option value="CHOICE">🔘 Múltipla Escolha</option>
                                                    <option value="NPS">📊 NPS (0-10)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {q.type === 'CHOICE' && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Opções (separadas por vírgula)</label>
                                                <input
                                                    className="input w-full"
                                                    value={q.options ? q.options.join(', ') : ''}
                                                    onChange={e => handleOptionChange(index, e.target.value)}
                                                    placeholder="Ex: Excelente, Bom, Regular, Ruim"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={q.required}
                                                    onChange={e => updateQuestion(index, 'required', e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                Obrigatória
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <button onClick={() => removeQuestion(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <button onClick={addQuestion} className="btn border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
                                <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta
                            </button>

                            <button onClick={saveSurvey} disabled={saving} className="btn btn-primary flex items-center gap-2">
                                {saving ? 'Salvando...' : 'Salvar Alterações'} <Save className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
