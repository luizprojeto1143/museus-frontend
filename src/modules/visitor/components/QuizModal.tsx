import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { Button } from "../../../components/ui";
import { CheckCircle2, XCircle, Award, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./QuizModal.css";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    xpReward: number;
}

interface Quiz {
    id: string;
    title: string;
    questions: Question[];
}

interface QuizModalProps {
    targetId: string;
    onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ targetId, onClose }) => {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [totalXp, setTotalXp] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/quiz?targetId=${targetId}`);
                setQuiz(res.data);
            } catch (err) {
                console.error("Erro ao buscar quiz:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [targetId]);

    const handleAnswer = async (index: number) => {
        if (selectedOption !== null || !quiz) return;

        setSelectedOption(index);
        const question = quiz.questions[currentIndex];
        const correct = index === question.correctIndex;
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => prev + 1);
            setTotalXp(prev => prev + question.xpReward);
            try {
                await api.post(`/quiz/${quiz.id}/answer`, {
                    questionId: question.id,
                    answerIndex: index
                });
            } catch (err) {
                console.error("Erro ao registrar resposta:", err);
            }
        }

        setTimeout(() => {
            if (currentIndex < quiz.questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };

    if (loading) return null;
    if (!quiz) return null;

    const currentQuestion = quiz.questions[currentIndex];

    return (
        <div className="quiz-overlay">
            <motion.div
                className="quiz-card glass"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
            >
                <AnimatePresence mode="wait">
                    {!showResults ? (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="quiz-step"
                        >
                            <div className="quiz-header">
                                <div className="quiz-progress">
                                    Questão {currentIndex + 1} de {quiz.questions.length}
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <button className="close-btn" onClick={onClose}>&times;</button>
                            </div>

                            <h2 className="quiz-question">{currentQuestion.question}</h2>

                            <div className="quiz-options">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        disabled={selectedOption !== null}
                                        className={`option-btn ${selectedOption === idx
                                                ? (isCorrect ? "correct" : "wrong")
                                                : (selectedOption !== null && idx === currentQuestion.correctIndex ? "correct-reveal" : "")
                                            }`}
                                        onClick={() => handleAnswer(idx)}
                                    >
                                        <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                                        {option}
                                        {selectedOption === idx && (
                                            <div className="feedback-icon">
                                                {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="quiz-results"
                        >
                            <Sparkles className="mx-auto mb-4 text-[var(--accent-primary)]" size={48} />
                            <h1>Parabéns!</h1>
                            <p>Você completou o desafio do museu.</p>

                            <div className="results-grid">
                                <div className="result-item">
                                    <Award className="text-[var(--accent-primary)] mb-2" />
                                    <span className="text-2xl font-bold">{score}/{quiz.questions.length}</span>
                                    <span className="text-xs opacity-60">Acertos</span>
                                </div>
                                <div className="result-item">
                                    <Sparkles className="text-[var(--accent-secondary)] mb-2" />
                                    <span className="text-2xl font-bold text-[var(--accent-primary)]">+{totalXp} XP</span>
                                    <span className="text-xs opacity-60">Ganhos</span>
                                </div>
                            </div>

                            <Button onClick={onClose} className="btn-primary-gradient w-full mt-6">
                                Resgatar Recompensas
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
