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
    ChevronLeft, Accessibility, Tag, MousePointerClick
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    useEffect(() => {
        if (id && tenantId) {
            setLoading(true);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <div className="w-12 h-12 border-4 border-white/10 border-t-gold rounded-full animate-spin mb-4"></div>
                <p>Carregando edital...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate("/admin/editais")} className="h-10 w-10 p-0 rounded-full hover:bg-white/10">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        {isEdit ? "Editar Edital" : "Novo Edital"}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="mb-8 hidden md:flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full -z-0"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full -z-0 transition-all duration-500"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer group`}
                            onClick={() => {
                                if (isEdit || index < currentStep) {
                                    setDirection(index > currentStep ? 1 : -1);
                                    setCurrentStep(index);
                                }
                            }}
                        >
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isActive ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110' :
                                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                                        'bg-gray-900 border-white/10 text-slate-500 group-hover:border-white/30'}
                            `}>
                                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                            </div>
                            <span className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Content Container */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 min-h-[400px] overflow-hidden relative backdrop-blur-sm">
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
                                    <Input
                                        label="Título do Edital *"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Edital de Fomento à Cultura 2024"
                                        className="bg-black/20 text-lg font-bold"
                                        containerClassName="md:col-span-2"
                                    />

                                    <Select
                                        label="Status Inicial"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        options={STATUS_OPTIONS}
                                        className="bg-black/20"
                                    />

                                    <Input
                                        label="Link do Documento (PDF)"
                                        type="url"
                                        value={formData.documentUrl}
                                        onChange={e => setFormData({ ...formData, documentUrl: e.target.value })}
                                        placeholder="https://exemplo.com/edital.pdf"
                                        className="bg-black/20"
                                    />
                                </div>

                                <Textarea
                                    label="Descrição Completa"
                                    rows={6}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva os objetivos, público-alvo e regras do edital..."
                                    className="bg-black/20"
                                />
                            </div>
                        )}

                        {/* STEP 1: CRONOGRAMA */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2">
                                        <MousePointerClick size={20} /> Período de Inscrição
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Abertura das Inscrições *"
                                            type="date"
                                            value={formData.inscriptionStart}
                                            onChange={e => setFormData({ ...formData, inscriptionStart: e.target.value })}
                                            className="bg-black/20"
                                        />
                                        <Input
                                            label="Encerramento das Inscrições *"
                                            type="date"
                                            value={formData.inscriptionEnd}
                                            onChange={e => setFormData({ ...formData, inscriptionEnd: e.target.value })}
                                            className="bg-black/20"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <Calendar size={20} /> Execução e Resultados
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Divulgação dos Resultados"
                                            type="date"
                                            value={formData.resultsDate}
                                            onChange={e => setFormData({ ...formData, resultsDate: e.target.value })}
                                            className="bg-black/20"
                                        />
                                        <Input
                                            label="Prazo Final de Execução"
                                            type="date"
                                            value={formData.executionEnd}
                                            onChange={e => setFormData({ ...formData, executionEnd: e.target.value })}
                                            className="bg-black/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ESCOPO E RECURSOS */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                {/* Orçamento */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-emerald-300 mb-4">Orçamento Geral</h3>
                                        <Input
                                            label="Valor Total do Edital (R$)"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.totalBudget}
                                            onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
                                            placeholder="500000.00"
                                            className="bg-black/20 text-xl font-mono text-emerald-400"
                                        />
                                    </div>
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-purple-300 mb-4">Limite por Projeto</h3>
                                        <Input
                                            label="Teto Máximo (R$)"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.maxPerProject}
                                            onChange={e => setFormData({ ...formData, maxPerProject: e.target.value })}
                                            placeholder="50000.00"
                                            className="bg-black/20 text-xl font-mono text-purple-400"
                                        />
                                    </div>
                                </div>

                                {/* Categorias */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                        <Tag size={16} /> Categorias Culturais
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {CULTURAL_CATEGORIES.map(cat => {
                                            const isSelected = formData.culturalCategories.includes(cat);
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat)}
                                                    className={`
                                                        px-4 py-2 rounded-full text-sm transition-all border
                                                        ${isSelected
                                                            ? "bg-blue-600 border-blue-500 text-white shadow-lg scale-105"
                                                            : "bg-black/30 border-white/10 text-slate-400 hover:border-white/30 hover:bg-white/5"}
                                                    `}
                                                >
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Regiões */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                        <MapPin size={16} /> Regiões Alvo
                                    </label>
                                    <div className="flex gap-2 mb-4">
                                        <Input
                                            value={newRegion}
                                            onChange={e => setNewRegion(e.target.value)}
                                            placeholder="Ex: Zona Norte, Centro..."
                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRegion())}
                                            containerClassName="mb-0 flex-1"
                                            className="bg-black/20 border-white/10"
                                        />
                                        <Button type="button" onClick={addRegion} leftIcon={<Plus size={18} />}>
                                            Adicionar
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-[40px] bg-white/5 rounded-xl p-4 border border-white/5">
                                        {formData.targetRegions.length === 0 && (
                                            <p className="text-gray-500 italic text-sm">Nenhuma região restrita (Abrangência Global)</p>
                                        )}
                                        {formData.targetRegions.map(region => (
                                            <span
                                                key={region}
                                                className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm flex items-center gap-2 animate-in fade-in zoom-in"
                                            >
                                                {region}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRegion(region)}
                                                    className="hover:text-white transition-colors"
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
                            <div className="space-y-8">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Quase lá!</h2>
                                    <p className="text-slate-400 max-w-md mx-auto">
                                        Revise as configurações do edital antes de publicar.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">Resumo</h3>
                                        <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Título:</span>
                                                <span className="font-bold text-white text-right">{formData.title}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Orçamento:</span>
                                                <span className="font-bold text-emerald-400 text-right">
                                                    {formData.totalBudget ? `R$ ${Number(formData.totalBudget).toLocaleString()}` : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Inscrições:</span>
                                                <span className="font-mono text-blue-300 text-right text-sm">
                                                    {formData.inscriptionStart ? new Date(formData.inscriptionStart).toLocaleDateString() : 'N/A'} até {formData.inscriptionEnd ? new Date(formData.inscriptionEnd).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Categorias:</span>
                                                <span className="text-white text-right">{formData.culturalCategories.length} selecionadas</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">Configurações Finais</h3>

                                        <div
                                            className={`
                                                p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                                                ${formData.requiresAccessibilityPlan ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}
                                            `}
                                            onClick={() => setFormData(prev => ({ ...prev, requiresAccessibilityPlan: !prev.requiresAccessibilityPlan }))}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.requiresAccessibilityPlan ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                    <Accessibility size={20} />
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold ${formData.requiresAccessibilityPlan ? 'text-white' : 'text-slate-300'}`}>
                                                        Plano de Acessibilidade
                                                    </h4>
                                                    <p className="text-xs text-slate-500">Exigir envio de plano detalhado</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.requiresAccessibilityPlan ? 'border-purple-500 bg-purple-500' : 'border-slate-500'}`}>
                                                {formData.requiresAccessibilityPlan && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/10 p-4 z-40">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={currentStep === 0 ? () => navigate("/admin/editais") : prevStep}
                        className="text-slate-400 hover:text-white"
                    >
                        {currentStep === 0 ? "Cancelar" : "Voltar"}
                    </Button>

                    <div className="flex gap-2">
                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                isLoading={saving}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                                leftIcon={<Save size={18} />}
                            >
                                {isEdit ? "Salvar Alterações" : "Publicar Edital"}
                            </Button>
                        ) : (
                            <Button
                                onClick={nextStep}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8"
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
