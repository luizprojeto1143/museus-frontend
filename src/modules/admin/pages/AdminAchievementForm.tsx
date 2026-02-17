import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
  ArrowLeft, Save, Trophy, Star, Target, Zap, Image,
  CheckCircle, AlertCircle, ChevronRight, FileText, Gift
} from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminShared.css";

interface AchievementForm {
  code: string;
  title: string;
  description: string;
  xpReward: number;
  iconUrl: string;
  condition: string;
  autoTrigger: boolean;
  triggerType: "XP_THRESHOLD" | "VISIT_COUNT" | "TRAIL_COMPLETION" | "CATEGORY_COMPLETION" | "CUSTOM";
  triggerValue: number;
  active: boolean;
}

const TRIGGER_TYPES = [
  { value: "XP_THRESHOLD", label: "Limite de XP Alcançado" },
  { value: "VISIT_COUNT", label: "Número de Visitas" },
  { value: "TRAIL_COMPLETION", label: "Conclusão de Trilha" },
  { value: "CATEGORY_COMPLETION", label: "Conclusão de Categoria" },
  { value: "CUSTOM", label: "Condição Personalizada" }
];

export const AdminAchievementForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEditing = !!id;

  const [form, setForm] = useState<AchievementForm>({
    code: "",
    title: "",
    description: "",
    xpReward: 100,
    iconUrl: "",
    condition: "",
    autoTrigger: true,
    triggerType: "XP_THRESHOLD",
    triggerValue: 100,
    active: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Wizard State
  const steps = [
    { id: 0, title: "Dados Gerais", icon: FileText, description: "Informações básicas" },
    { id: 1, title: "Regras", icon: Target, description: "Condições de desbloqueio" },
    { id: 2, title: "Recompensa", icon: Gift, description: "XP e Ícone" },
    { id: 3, title: "Revisão", icon: CheckCircle, description: "Finalizar" }
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const loadAchievement = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/achievements/${id}`);
      setForm(res.data);
    } catch {
      addToast(t("admin.achievementForm.alerts.errorLoad"), "error");
      navigate("/admin/conquistas");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t, addToast]);

  useEffect(() => {
    if (isEditing) {
      loadAchievement();
    }
  }, [id, isEditing, loadAchievement]);

  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Info
        if (!form.code.trim()) return "Código Único é obrigatório";
        if (!form.title.trim()) return "Título é obrigatório";
        return null;
      case 1: // Rules
        if (!form.triggerType) return "Selecione um tipo de gatilho";
        if (form.triggerValue <= 0) return "Valor alvo deve ser maior que zero";
        return null;
      case 2: // Rewards
        if (form.xpReward < 0) return "Recompensa de XP não pode ser negativa";
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
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/achievements/${id}`, { ...form, tenantId });
        addToast(t("admin.achievementForm.alerts.successUpdate"), "success");
      } else {
        await api.post("/achievements", { ...form, tenantId });
        addToast(t("admin.achievementForm.alerts.successCreate"), "success");
      }
      navigate("/admin/conquistas");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || t("admin.achievementForm.alerts.errorSave");
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsUploading(true);
        const res = await api.post("/upload/image", formData);
        setForm({ ...form, iconUrl: res.data.url });
        addToast("Ícone enviado com sucesso!", "success");
      } catch {
        addToast(t("admin.achievementForm.alerts.errorUpload"), "error");
      } finally {
        setIsUploading(false);
      }
    }
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
      <div className="flex justify-center items-center h-screen bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Carregando conquista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      {isUploading && (
        <div className="admin-modal-overlay">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-white/10 border-t-gold rounded-full animate-spin mb-4 mx-auto"></div>
            <p>Enviando arquivo...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-wizard-header">
        <Button onClick={() => navigate("/admin/conquistas")} variant="ghost" className="p-0">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="admin-wizard-title">
            {isEditing ? t("admin.achievementForm.editTitle") : t("admin.achievementForm.newTitle")}
          </h1>
          <p className="admin-wizard-subtitle">
            Passo {currentStep + 1} de {steps.length}: {steps[currentStep].title}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="admin-wizard-stepper">
        <div className="admin-stepper-progress-bg"></div>
        <div
          className="admin-stepper-progress-fill"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`admin-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => {
                if (index < currentStep) {
                  setDirection(-1);
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
            {/* STEP 0: DADOS GERAIS */}
            {currentStep === 0 && (
              <div className="flex-col gap-6">
                <div className="admin-section">
                  <h3 className="admin-section-title">
                    <FileText className="text-gold" /> Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Código Único"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="EX: VISITANTE_EXPLORADOR"
                      required
                      className="font-mono uppercase"
                    />
                    <Input
                      label={t("admin.achievementForm.labels.title")}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ex: Explorador Iniciante"
                      required
                    />
                  </div>
                  <Textarea
                    label={t("admin.achievementForm.labels.description")}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="mt-6"
                    placeholder="Descreva como o visitante pode obter esta conquista..."
                  />

                  <div className="mt-6 flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all w-fit">
                      <div className={`
                          w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${form.active ? 'bg-gold border-gold' : 'border-zinc-600 group-hover:border-zinc-500'}
                      `}>
                        {form.active && <CheckCircle size={14} className="text-black" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                        className="hidden"
                      />
                      <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                        Conquista Ativa
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: REGRAS */}
            {currentStep === 1 && (
              <div className="flex-col gap-6">
                <div className="admin-section">
                  <h3 className="admin-section-title">
                    <Target className="text-gold" /> Regras de Desbloqueio
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Select
                      label="Tipo de Gatilho"
                      value={form.triggerType}
                      onChange={(e) => setForm({ ...form, triggerType: e.target.value as any })}
                    >
                      {TRIGGER_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>

                    <Input
                      label="Valor Alvo"
                      type="number"
                      value={form.triggerValue}
                      onChange={(e) => setForm({ ...form, triggerValue: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 5 (visitas), 1000 (XP)"
                    />
                  </div>

                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`
                                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                                    ${form.autoTrigger ? 'bg-gold border-gold' : 'border-zinc-600 group-hover:border-zinc-500'}
                                `}>
                        {form.autoTrigger && <Zap size={14} className="text-black" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={form.autoTrigger}
                        onChange={(e) => setForm({ ...form, autoTrigger: e.target.checked })}
                        className="hidden"
                      />
                      <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                        Desbloqueio Automático
                      </span>
                    </label>
                    <p className="text-xs text-zinc-500 ml-8">
                      Se marcado, o sistema a concederá automaticamente assim que a condição for atendida.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: RECOMPENSAS E MÍDIA */}
            {currentStep === 2 && (
              <div className="flex-col gap-6">
                <div className="admin-grid-2">
                  <div className="admin-section">
                    <h3 className="admin-section-title">
                      <Star className="text-gold" /> Recompensas
                    </h3>
                    <Input
                      label={t("admin.achievementForm.labels.xpReward")}
                      type="number"
                      value={form.xpReward}
                      onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })}
                      leftIcon={<Star size={16} className="text-gold" />}
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      XP concedido ao visitante quando a conquista é desbloqueada.
                    </p>
                  </div>

                  <div className="admin-section">
                    <h3 className="admin-section-title">
                      <Image className="text-gold" /> Ícone
                    </h3>
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden relative group shrink-0">
                        {form.iconUrl ? (
                          <img src={form.iconUrl} alt="Icon" className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="text-zinc-600" size={32} />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="upload-btn w-full justify-center mb-2">
                          <Image size={16} /> {form.iconUrl ? "Trocar Ícone" : "Carregar Ícone"}
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                        <p className="text-xs text-zinc-500">
                          Recomendado: PNG/SVG transparente (512x512px).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVISÃO */}
            {currentStep === 3 && (
              <div className="flex-col gap-6">
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <CheckCircle size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--fg-main)' }}>Pronto para salvar!</h2>
                  <p style={{ color: 'var(--fg-muted)' }}>Revise os dados da conquista abaixo.</p>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-section">
                    <h3 className="admin-section-title">Resumo</h3>
                    <div className="summary-card">
                      <div className="summary-row">
                        <span className="summary-label">Título:</span>
                        <span className="summary-value">{form.title}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Código:</span>
                        <span className="summary-value font-mono">{form.code}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Status:</span>
                        <span className="summary-value" style={{ color: form.active ? 'var(--status-success)' : 'var(--fg-muted)' }}>
                          {form.active ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Gatilho:</span>
                        <span className="summary-value">{TRIGGER_TYPES.find(t => t.value === form.triggerType)?.label}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Recompensa:</span>
                        <span className="summary-value flex items-center gap-1">
                          {form.xpReward} XP <Star size={12} className="text-gold" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-section flex flex-col items-center justify-center text-center">
                    <h3 className="admin-section-title w-full">Pré-visualização</h3>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-yellow-600 p-1 mb-4 shadow-lg shadow-gold/20">
                      <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                        {form.iconUrl ? (
                          <img src={form.iconUrl} alt="Conquista" className="w-full h-full object-cover" />
                        ) : (
                          <Trophy size={32} className="text-gold" />
                        )}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white">{form.title || "Título da Conquista"}</h4>
                    <p className="text-sm text-zinc-400 mt-1 max-w-[200px]">{form.description || "Descrição da conquista..."}</p>
                    <div className="mt-3 px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gold border border-gold/20">
                      +{form.xpReward} XP
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
            onClick={currentStep === 0 ? () => navigate("/admin/conquistas") : prevStep}
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="btn-primary"
                leftIcon={<Save size={18} />}
              >
                Salvar Conquista
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

