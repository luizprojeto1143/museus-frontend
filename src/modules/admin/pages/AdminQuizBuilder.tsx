import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Plus, Trash2, Save, HelpCircle, CheckCircle2, Layout, Award } from "lucide-react";
import { Button, Input, Select } from "../../../components/ui";
import { toast } from "react-hot-toast";

interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    xpReward: number;
}

export const AdminQuizBuilder: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [spaces, setSpaces] = useState<any[]>([]);
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState("");
    const [targetType, setTargetType] = useState("SPACE");
    const [targetId, setTargetId] = useState("");
    const [questions, setQuestions] = useState<Question[]>([
        { question: "", options: ["", "", "", ""], correctIndex: 0, xpReward: 50 }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [s, w] = await Promise.all([
                api.get("/spaces", { params: { tenantId } }),
                api.get("/works", { params: { tenantId, limit: 100 } })
            ]);
            setSpaces(s.data);
            setWorks(Array.isArray(w.data) ? w.data : (w.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) loadData();
    }, [tenantId, loadData]);

    const addQuestion = () => {
        setQuestions([...questions, { question: "", options: ["", "", "", ""], correctIndex: 0, xpReward: 50 }]);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[idx] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIdx].options[oIdx] = value;
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        if (!title || !targetId) return toast.error("Preencha o título e o alvo");
        if (questions.some(q => !q.question || q.options.some(o => !o))) return toast.error("Preencha todas as questões e opções");

        setIsSaving(true);
        try {
            await api.post("/quiz", {
                title,
                targetType,
                targetId,
                questions
            });
            toast.success("Quiz criado com sucesso! 🏆");
            // Reset form or redirect
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar quiz");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <HelpCircle size={32} className="text-[var(--accent-primary)]" />
                        Criar Novo Quiz
                    </h1>
                    <p className="opacity-60">Adicione interatividade e gamificação aos seus espaços</p>
                </div>
                <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={18} />} className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black font-bold">
                    Salvar Quiz
                </Button>
            </header>

            <div className="grid grid-cols-2 gap-6">
                <div className="card p-6 bg-zinc-900 border-zinc-800">
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-50">Configuração Geral</label>
                    <Input
                        label="Título do Quiz"
                        placeholder="Ex: Curiosidades sobre o Templo"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-4"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Tipo de Alvo"
                            value={targetType}
                            onChange={(e) => { setTargetType(e.target.value); setTargetId(""); }}
                        >
                            <option value="SPACE">Espaço</option>
                            <option value="WORK">Obra</option>
                        </Select>
                        <Select
                            label="Selecionar Alvo"
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {targetType === "SPACE"
                                ? spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                : works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)
                            }
                        </Select>
                    </div>
                </div>

                <div className="card p-6 bg-zinc-900 border-zinc-800 flex flex-col justify-center items-center text-center">
                    <Award size={40} className="text-amber-500 mb-2 opacity-30" />
                    <h4 className="font-bold">Recompensas e XP</h4>
                    <p className="text-sm opacity-50">Cada resposta correta garante XP automático ao visitante, incentivando o engajamento e a leitura atenta.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Questões ({questions.length})</h3>
                    <Button variant="outline" size="sm" onClick={addQuestion} leftIcon={<Plus size={16} />}>Adicionar Questão</Button>
                </div>

                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="card p-8 bg-zinc-900/50 border-zinc-800 relative group transition-all hover:border-[var(--accent-primary)]/30">
                        <button
                            onClick={() => removeQuestion(qIdx)}
                            className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="grid gap-6">
                            <Input
                                label={`Pergunta ${qIdx + 1}`}
                                value={q.question}
                                onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                                placeholder="Qual a origem deste monumento?"
                                className="text-lg font-bold"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${q.correctIndex === oIdx
                                                ? "bg-green-500/20 border-green-500 text-green-500"
                                                : "border-zinc-700 text-zinc-600 hover:border-zinc-500"
                                                }`}
                                        >
                                            {q.correctIndex === oIdx ? <CheckCircle2 size={16} /> : String.fromCharCode(65 + oIdx)}
                                        </button>
                                        <Input
                                            value={opt}
                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                            placeholder={`Opção ${String.fromCharCode(65 + oIdx)}`}
                                            className="grow"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                                <span className="text-xs uppercase font-black opacity-40">Recompensa:</span>
                                <input
                                    type="number"
                                    value={q.xpReward}
                                    onChange={(e) => updateQuestion(qIdx, "xpReward", parseInt(e.target.value))}
                                    className="bg-zinc-800 border-none rounded-md px-3 py-1 text-sm w-20 text-amber-500 font-bold"
                                />
                                <span className="text-xs font-bold opacity-40">XP</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-10">
                <Button onClick={handleSave} isLoading={isSaving} size="lg" className="w-full md:w-auto px-20 btn-primary-gradient">
                    Publicar Quiz Interativo
                </Button>
            </div>
        </div>
    );
};
