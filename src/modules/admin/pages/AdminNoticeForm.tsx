import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
    ArrowLeft, Save, Calendar, DollarSign, FileText,
    MapPin, X, Plus, CheckCircle, ChevronRight,
    MousePointerClick, Accessibility, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminShared.css";

const STATUS_OPTIONS = [
    { value: "DRAFT", label: "Rascunho" },
    { value: "PUBLISHED", label: "Publicado" },
    { value: "INSCRIPTIONS_OPEN", label: "Inscrições Abertas" },
    { value: "INSCRIPTIONS_CLOSED", label: "Inscrições Encerradas" },
    { value: "EVALUATION", label: "Em Avaliação" },
    { value: "RESULTS_PUBLISHED", label: "Resultados Publicados" },
    { value: "FINISHED", label: "Finalizado" }
];

const CULTURAL_CATEGORIES = [
    "Artes Visuais", "Música", "Teatro", "Dança", "Literatura",
    "Audiovisual", "Patrimônio Cultural", "Cultura Popular", "Artesanato"
];

// Steps Configuration
const STEPS = [
    { id: 0, title: "Informações Básicas", icon: FileText, description: "Identificação do edital" },
    { id: 1, title: "Cronograma", icon: Calendar, description: "Datas e prazos" },
    { id: 2, title: "Escopo e Recursos", icon: DollarSign, description: "Orçamento e abrangência" },
    { id: 3, title: "Revisão", icon: CheckCircle, description: "Finalização" }
];

export const AdminNoticeForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const isEdit = Boolean(id);

    // Wizard State
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        inscriptionStart: "",
        inscriptionEnd: "",
        resultsDate: "",
        executionEnd: "",
        totalBudget: "",
        maxPerProject: "",
        culturalCategories: [] as string[],
        targetRegions: [] as string[],
        status: "DRAFT",
        documentUrl: "",
        requiresAccessibilityPlan: true
    });

    const [newRegion, setNewRegion] = useState("");

    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        if (tenantId) {
            setLoading(true);
            // Fetch Categories
            api.get(`/categories?tenantId=${tenantId}`)
                .then(res => setCategories(res.data))
                .catch(console.error);

            if (id) {
                api.get(`/notices/${id}`)
                    .then(res => {
                        const data = res.data;
                        setFormData({
                            title: data.title || "",
                            description: data.description || "",
                            inscriptionStart: data.inscriptionStart ? data.inscriptionStart.split("T")[0] : "",
                            inscriptionEnd: data.inscriptionEnd ? data.inscriptionEnd.split("T")[0] : "",
                            resultsDate: data.resultsDate ? data.resultsDate.split("T")[0] : "",
                            executionEnd: data.executionEnd ? data.executionEnd.split("T")[0] : "",
                            totalBudget: data.totalBudget?.toString() || "",
                            maxPerProject: data.maxPerProject?.toString() || "",
                            culturalCategories: data.culturalCategories || [],
                            targetRegions: data.targetRegions || [],
                            status: data.status || "DRAFT",
                            documentUrl: data.documentUrl || "",
                            requiresAccessibilityPlan: data.requiresAccessibilityPlan ?? true
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        addToast("Erro ao carregar edital", "error");
                    })
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        }
    }, [id, tenantId]);

    const validateStep = (stepIndex: number) => {
        switch (stepIndex) {
            case 0:
                if (!formData.title.trim()) return "O título é obrigatório";
                return null;
            case 1:
                if (!formData.inscriptionStart) return "Data de início das inscrições é obrigatória";
                if (!formData.inscriptionEnd) return "Data de fim das inscrições é obrigatória";
                return null;
            default:
                return null;
        }
    };

    const nextStep = () => {
        const error = validateStep(currentStep);
        if (error) {
            addToast(error, "error");
            return;
        }
        setDirection(1);
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (!tenantId) {
            addToast("Erro de autenticação", "error");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                tenantId,
                inscriptionStart: formData.inscriptionStart ? new Date(formData.inscriptionStart).toISOString() : null,
                inscriptionEnd: formData.inscriptionEnd ? new Date(formData.inscriptionEnd).toISOString() : null,
                resultsDate: formData.resultsDate ? new Date(formData.resultsDate).toISOString() : null,
                executionEnd: formData.executionEnd ? new Date(formData.executionEnd).toISOString() : null,
                totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : null,
                maxPerProject: formData.maxPerProject ? parseFloat(formData.maxPerProject) : null
            };

            if (isEdit) {
                await api.put(`/notices/${id}`, payload);
            } else {
                await api.post("/notices", payload);
            }
            addToast(isEdit ? "Edital atualizado com sucesso!" : "Edital criado com sucesso!", "success");
            navigate("/admin/editais");
        } catch (error) {
            console.error("Erro ao salvar edital:", error);
            addToast("Erro ao salvar edital. Verifique os dados.", "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            culturalCategories: prev.culturalCategories.includes(cat)
                ? prev.culturalCategories.filter(c => c !== cat)
                : [...prev.culturalCategories, cat]
        }));
    };

    const addRegion = () => {
        if (newRegion.trim() && !formData.targetRegions.includes(newRegion.trim())) {
            setFormData(prev => ({
                ...prev,
                targetRegions: [...prev.targetRegions, newRegion.trim()]
            }));
            setNewRegion("");
        }
    };

    const removeRegion = (region: string) => {
        setFormData(prev => ({
            ...prev,
            targetRegions: prev.targetRegions.filter(r => r !== region)
        }));
    };

    // Animation Variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    if (loading) {
        return (
            <div className="flex-col items-center justify-center min-h-[60vh] text-center" style={{ display: 'flex' }}>
                <p>Carregando edital...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate("/admin/editais")} className="p-0 hover:bg-transparent text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        {isEdit ? "Editar Edital" : "Novo Edital"}
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between relative mb-12 px-4">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10" />

                {/* Progress Bar Fill */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-gold transition-all duration-300 -z-10"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={`flex flex-col items-center relative z-10 cursor-pointer group ${isActive ? 'text-gold' : isCompleted ? 'text-white' : 'text-zinc-500'
                                }`}
                            onClick={() => {
                                if (isEdit || index < currentStep) {
                                    setDirection(index > currentStep ? 1 : -1);
                                    setCurrentStep(index);
                                }
                            }}
                        >
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-3
                                ${isActive ? 'bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]' :
                                    isCompleted ? 'bg-zinc-800 text-white border border-white/20' :
                                        'bg-zinc-900 text-zinc-600 border border-white/10 group-hover:border-white/20'}
                            `}>
                                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                            </div>
                            <span className="text-sm font-medium transition-colors">
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Content Container */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full"
                    >
                        {/* STEP 0: DADOS BÁSICOS */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-1">
                                        <Input
                                            label="Título do Edital *"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: Edital de Fomento à Cultura 2024"
                                            required
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                    </div>

                                    <Select
                                        label="Status Inicial"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Select>

                                    <div className="md:col-span-2">
                                        <Input
                                            label="Link do Documento (PDF)"
                                            type="url"
                                            value={formData.documentUrl}
                                            onChange={e => setFormData({ ...formData, documentUrl: e.target.value })}
                                            placeholder="https://exemplo.com/edital.pdf"
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                    </div>
                                </div>

                                <Textarea
                                    label="Descrição Completa"
                                    rows={6}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva os objetivos, público-alvo e regras do edital..."
                                    className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                />
                            </div>
                        )}

                        {/* STEP 1: CRONOGRAMA */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                        <MousePointerClick size={20} className="text-gold" /> Período de Inscrição
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Abertura das Inscrições *"
                                            type="date"
                                            value={formData.inscriptionStart}
                                            onChange={e => setFormData({ ...formData, inscriptionStart: e.target.value })}
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                        <Input
                                            label="Encerramento das Inscrições *"
                                            type="date"
                                            value={formData.inscriptionEnd}
                                            onChange={e => setFormData({ ...formData, inscriptionEnd: e.target.value })}
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                        <Calendar size={20} className="text-gold" /> Execução e Resultados
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Divulgação dos Resultados"
                                            type="date"
                                            value={formData.resultsDate}
                                            onChange={e => setFormData({ ...formData, resultsDate: e.target.value })}
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                        <Input
                                            label="Prazo Final de Execução"
                                            type="date"
                                            value={formData.executionEnd}
                                            onChange={e => setFormData({ ...formData, executionEnd: e.target.value })}
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ESCOPO E RECURSOS */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                {/* Orçamento */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Orçamento Geral</h3>
                                        <Input
                                            label="Valor Total do Edital (R$)"
                                            type="number"
                                            step="0.01"
                                            value={formData.totalBudget}
                                            onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
                                            placeholder="500000.00"
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                    </div>
                                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Limite por Projeto</h3>
                                        <Input
                                            label="Teto Máximo (R$)"
                                            type="number"
                                            step="0.01"
                                            value={formData.maxPerProject}
                                            onChange={e => setFormData({ ...formData, maxPerProject: e.target.value })}
                                            placeholder="50000.00"
                                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                        />
                                    </div>
                                </div>

                                {/* Categorias */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <label className="text-base font-medium text-white mb-4 block flex items-center gap-2">
                                        <Tag size={16} className="text-gold" /> Categorias Culturais
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {(categories.length > 0 ? categories : CULTURAL_CATEGORIES.map(c => ({ name: c }))).map((cat: any) => {
                                            const catName = cat.name || cat;
                                            const isSelected = formData.culturalCategories.includes(catName);
                                            return (
                                                <button
                                                    key={cat.id || cat}
                                                    type="button"
                                                    onClick={() => toggleCategory(catName)}
                                                    className={`
                                                        px-4 py-2 rounded-full text-sm font-medium transition-all
                                                        ${isSelected
                                                            ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}
                                                    `}
                                                >
                                                    {catName}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Regiões */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <label className="text-base font-medium text-white mb-4 block flex items-center gap-2">
                                        <MapPin size={16} className="text-gold" /> Regiões Alvo
                                    </label>
                                    <div className="flex gap-2 mb-4">
                                        <div className="flex-1">
                                            <Input
                                                value={newRegion}
                                                onChange={e => setNewRegion(e.target.value)}
                                                placeholder="Ex: Zona Norte, Centro..."
                                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRegion())}
                                                className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addRegion}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-white"
                                        >
                                            <Plus size={18} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/30 rounded-lg min-h-[60px] border border-white/5">
                                        {formData.targetRegions.length === 0 && (
                                            <p className="text-zinc-500 italic text-sm">Nenhuma região restrita (Abrangência Global)</p>
                                        )}
                                        {formData.targetRegions.map(region => (
                                            <span key={region} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-sm text-white">
                                                {region}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRegion(region)}
                                                    className="text-zinc-400 hover:text-red-400"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: REVISÃO */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="text-center p-8 bg-green-500/10 rounded-2xl border border-green-500/30">
                                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Quase lá!</h2>
                                    <p className="text-zinc-400">Revise os dados abaixo antes de publicar.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 space-y-4">
                                        <h3 className="text-lg font-semibold text-white">Resumo</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                <span className="text-zinc-400">Título:</span>
                                                <span className="text-white font-medium">{formData.title}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                <span className="text-zinc-400">Orçamento:</span>
                                                <span className="text-green-400 font-medium">
                                                    {formData.totalBudget ? `R$ ${Number(formData.totalBudget).toLocaleString()}` : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                <span className="text-zinc-400">Inscrições:</span>
                                                <span className="text-white text-sm">
                                                    {formData.inscriptionStart ? new Date(formData.inscriptionStart).toLocaleDateString() : 'N/A'} até {formData.inscriptionEnd ? new Date(formData.inscriptionEnd).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Configurações Finais</h3>

                                        <div
                                            onClick={() => setFormData(prev => ({ ...prev, requiresAccessibilityPlan: !prev.requiresAccessibilityPlan }))}
                                            className={`
                                                p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all
                                                ${formData.requiresAccessibilityPlan
                                                    ? 'bg-gold/10 border-gold/50'
                                                    : 'bg-zinc-900/50 border-white/10 hover:border-white/20'}
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Accessibility size={24} className={formData.requiresAccessibilityPlan ? 'text-gold' : 'text-zinc-500'} />
                                                <div>
                                                    <div className={`font-bold ${formData.requiresAccessibilityPlan ? 'text-white' : 'text-zinc-500'}`}>Plano de Acessibilidade</div>
                                                    <div className="text-xs text-zinc-400">Exigir envio de plano detalhado</div>
                                                </div>
                                            </div>
                                            {formData.requiresAccessibilityPlan && <CheckCircle size={20} className="text-gold" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 z-40">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={currentStep === 0 ? () => navigate("/admin/editais") : prevStep}
                        className="text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                        {currentStep === 0 ? "Cancelar" : "Voltar"}
                    </Button>

                    <div className="flex gap-3">
                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                isLoading={saving}
                                className="bg-gold hover:bg-gold/90 text-black font-medium px-8"
                                leftIcon={<Save size={18} />}
                            >
                                {isEdit ? "Salvar Alterações" : "Publicar Edital"}
                            </Button>
                        ) : (
                            <Button
                                onClick={nextStep}
                                className="bg-gold hover:bg-gold/90 text-black font-medium px-8"
                                rightIcon={<ChevronRight size={18} />}
                            >
                                Próximo
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
