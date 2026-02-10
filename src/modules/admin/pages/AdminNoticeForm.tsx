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
        <div className="admin-form-container">
            {/* Header */}
            <div className="admin-wizard-header">
                <Button variant="ghost" onClick={() => navigate("/admin/editais")} className="p-0">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="admin-wizard-title">
                        {isEdit ? "Editar Edital" : "Novo Edital"}
                    </h1>
                    <p className="admin-wizard-subtitle">
                        Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="admin-wizard-stepper">
                <div className="admin-stepper-progress-bg"></div>
                <div
                    className="admin-stepper-progress-fill"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={`admin-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            onClick={() => {
                                if (isEdit || index < currentStep) {
                                    setDirection(index > currentStep ? 1 : -1);
                                    setCurrentStep(index);
                                }
                            }}
                        >
                            <div className="admin-step-icon">
                                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                            </div>
                            <span className="admin-step-label">
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Content Container */}
            <div className="admin-wizard-content">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ width: "100%" }}
                    >
                        {/* STEP 0: DADOS BÁSICOS */}
                        {currentStep === 0 && (
                            <div className="flex-col gap-6">
                                <div className="admin-grid-2">
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <Input
                                            label="Título do Edital *"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: Edital de Fomento à Cultura 2024"
                                            required
                                        />
                                    </div>

                                    <Select
                                        label="Status Inicial"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Select>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Input
                                            label="Link do Documento (PDF)"
                                            type="url"
                                            value={formData.documentUrl}
                                            onChange={e => setFormData({ ...formData, documentUrl: e.target.value })}
                                            placeholder="https://exemplo.com/edital.pdf"
                                        />
                                    </div>
                                </div>

                                <Textarea
                                    label="Descrição Completa"
                                    rows={6}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva os objetivos, público-alvo e regras do edital..."
                                />
                            </div>
                        )}

                        {/* STEP 1: CRONOGRAMA */}
                        {currentStep === 1 && (
                            <div className="flex-col gap-6">
                                <div className="admin-section">
                                    <h3 className="admin-section-title">
                                        <MousePointerClick size={20} /> Período de Inscrição
                                    </h3>
                                    <div className="admin-grid-2">
                                        <Input
                                            label="Abertura das Inscrições *"
                                            type="date"
                                            value={formData.inscriptionStart}
                                            onChange={e => setFormData({ ...formData, inscriptionStart: e.target.value })}
                                        />
                                        <Input
                                            label="Encerramento das Inscrições *"
                                            type="date"
                                            value={formData.inscriptionEnd}
                                            onChange={e => setFormData({ ...formData, inscriptionEnd: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="admin-section">
                                    <h3 className="admin-section-title">
                                        <Calendar size={20} /> Execução e Resultados
                                    </h3>
                                    <div className="admin-grid-2">
                                        <Input
                                            label="Divulgação dos Resultados"
                                            type="date"
                                            value={formData.resultsDate}
                                            onChange={e => setFormData({ ...formData, resultsDate: e.target.value })}
                                        />
                                        <Input
                                            label="Prazo Final de Execução"
                                            type="date"
                                            value={formData.executionEnd}
                                            onChange={e => setFormData({ ...formData, executionEnd: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ESCOPO E RECURSOS */}
                        {currentStep === 2 && (
                            <div className="flex-col gap-6">
                                {/* Orçamento */}
                                <div className="admin-grid-2">
                                    <div className="admin-section">
                                        <h3 className="admin-section-title" style={{ color: 'var(--status-success)' }}>Orçamento Geral</h3>
                                        <Input
                                            label="Valor Total do Edital (R$)"
                                            type="number"
                                            step="0.01"
                                            value={formData.totalBudget}
                                            onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
                                            placeholder="500000.00"
                                        />
                                    </div>
                                    <div className="admin-section">
                                        <h3 className="admin-section-title" style={{ color: '#c084fc' }}>Limite por Projeto</h3>
                                        <Input
                                            label="Teto Máximo (R$)"
                                            type="number"
                                            step="0.01"
                                            value={formData.maxPerProject}
                                            onChange={e => setFormData({ ...formData, maxPerProject: e.target.value })}
                                            placeholder="50000.00"
                                        />
                                    </div>
                                </div>

                                {/* Categorias */}
                                <div>
                                    <label className="admin-section-title">
                                        <Tag size={16} /> Categorias Culturais
                                    </label>
                                    <div className="flex-wrap gap-2">
                                        {(categories.length > 0 ? categories : CULTURAL_CATEGORIES.map(c => ({ name: c }))).map((cat: any) => {
                                            const catName = cat.name || cat;
                                            const isSelected = formData.culturalCategories.includes(catName);
                                            return (
                                                <button
                                                    key={cat.id || cat}
                                                    type="button"
                                                    onClick={() => toggleCategory(catName)}
                                                    className={`category-btn ${isSelected ? 'selected' : ''}`}
                                                >
                                                    {catName}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Regiões */}
                                <div>
                                    <label className="admin-section-title">
                                        <MapPin size={16} /> Regiões Alvo
                                    </label>
                                    <div className="flex gap-2 mb-4">
                                        <div className="flex-1">
                                            <Input
                                                value={newRegion}
                                                onChange={e => setNewRegion(e.target.value)}
                                                placeholder="Ex: Zona Norte, Centro..."
                                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRegion())}
                                            />
                                        </div>
                                        <Button type="button" onClick={addRegion} leftIcon={<Plus size={18} />}>
                                            Adicionar
                                        </Button>
                                    </div>
                                    <div className="flex-wrap gap-2" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', minHeight: '60px' }}>
                                        {formData.targetRegions.length === 0 && (
                                            <p style={{ color: 'gray', fontStyle: 'italic', fontSize: '0.9rem' }}>Nenhuma região restrita (Abrangência Global)</p>
                                        )}
                                        {formData.targetRegions.map(region => (
                                            <span key={region} className="region-tag">
                                                {region}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRegion(region)}
                                                    className="region-remove"
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
                            <div className="flex-col gap-6">
                                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                    <CheckCircle size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem' }} />
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--fg-main)' }}>Quase lá!</h2>
                                    <p style={{ color: 'var(--fg-muted)' }}>Revise os dados abaixo antes de publicar.</p>
                                </div>

                                <div className="admin-grid-2">
                                    <div className="admin-section">
                                        <h3 className="admin-section-title">Resumo</h3>
                                        <div className="summary-card">
                                            <div className="summary-row">
                                                <span className="summary-label">Título:</span>
                                                <span className="summary-value">{formData.title}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span className="summary-label">Orçamento:</span>
                                                <span className="summary-value" style={{ color: 'var(--status-success)' }}>
                                                    {formData.totalBudget ? `R$ ${Number(formData.totalBudget).toLocaleString()}` : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="summary-row">
                                                <span className="summary-label">Inscrições:</span>
                                                <span className="summary-value" style={{ fontSize: '0.85rem' }}>
                                                    {formData.inscriptionStart ? new Date(formData.inscriptionStart).toLocaleDateString() : 'N/A'} até {formData.inscriptionEnd ? new Date(formData.inscriptionEnd).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-section">
                                        <h3 className="admin-section-title">Configurações Finais</h3>

                                        <div
                                            onClick={() => setFormData(prev => ({ ...prev, requiresAccessibilityPlan: !prev.requiresAccessibilityPlan }))}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '1rem',
                                                border: `1px solid ${formData.requiresAccessibilityPlan ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
                                                background: formData.requiresAccessibilityPlan ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.2)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Accessibility size={24} color={formData.requiresAccessibilityPlan ? 'var(--accent-primary)' : 'gray'} />
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: formData.requiresAccessibilityPlan ? 'var(--fg-main)' : 'gray' }}>Plano de Acessibilidade</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>Exigir envio de plano detalhado</div>
                                                </div>
                                            </div>
                                            {formData.requiresAccessibilityPlan && <CheckCircle size={20} color="var(--accent-primary)" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="admin-wizard-footer">
                <div className="admin-wizard-footer-inner">
                    <Button
                        variant="ghost"
                        onClick={currentStep === 0 ? () => navigate("/admin/editais") : prevStep}
                    >
                        {currentStep === 0 ? "Cancelar" : "Voltar"}
                    </Button>

                    <div className="flex gap-2">
                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                isLoading={saving}
                                className="btn-primary" // Styles defined in styles.css
                                leftIcon={<Save size={18} />}
                            >
                                {isEdit ? "Salvar Alterações" : "Publicar Edital"}
                            </Button>
                        ) : (
                            <Button
                                onClick={nextStep}
                                className="btn-primary"
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
