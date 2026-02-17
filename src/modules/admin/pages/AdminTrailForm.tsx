import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
  ArrowLeft, Save, Plus, GripVertical, X, Music, Video,
  ToggleLeft, ToggleRight, Map, CheckCircle2, FileText,
  MapPin, CheckCircle, ChevronRight, Upload, Play, MonitorPlay
} from "lucide-react";
import { useTerminology } from "../../../hooks/useTerminology";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminShared.css";

// Componente auxiliar para item ordenável
function SortableItem({ id, title, onRemove }: { id: string; title: string; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-4 mb-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl group hover:border-[var(--accent-gold)] transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-4">
        <GripVertical size={20} className="text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)] transition-colors" />
        <span className="text-[var(--fg-main)] font-medium">{title}</span>
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()} // Important to prevent drag start
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-2 text-[var(--fg-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export const AdminTrailForm: React.FC = () => {
  const { t } = useTranslation();
  const term = useTerminology();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Initial state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [allWorks, setAllWorks] = useState<{ id: string; title: string }[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<{ id: string; title: string }[]>([]);
  const [workToAdd, setWorkToAdd] = useState("");
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Wizard State
  const steps = [
    { id: 0, title: "Dados Gerais", icon: FileText, description: `Informações básicas da ${term.trail.toLowerCase()}` },
    { id: 1, title: "Mídia", icon: MonitorPlay, description: "Áudios e vídeos" },
    { id: 2, title: "Roteiro", icon: MapPin, description: "Obras" },
    { id: 3, title: "Revisão", icon: CheckCircle, description: "Finalizar" }
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (tenantId) {
      api.get("/works", { params: { tenantId } }).then(res => {
        const worksData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setAllWorks((worksData as { id: string; title: string }[]).map(w => ({ id: w.id, title: w.title })));
      });
    }

    if (isEdit) {
      api.get(`/trails/${id}`)
        .then(res => {
          const trail = res.data as { title: string; description: string; active?: boolean; audioUrl?: string; videoUrl?: string; works?: { id: string; title: string }[] };
          setName(trail.title);
          setDescription(trail.description);
          setActive(trail.active !== false);
          setAudioUrl(trail.audioUrl || "");
          setVideoUrl(trail.videoUrl || "");
          if (trail.works && Array.isArray(trail.works)) {
            setSelectedWorks(trail.works.map(w => ({
              id: w.id,
              title: w.title
            })));
          }
        })
        .catch(err => {
          console.error("Erro ao carregar trilha", err);
          addToast("Erro ao carregar trilha", "error");
        });
    }
  }, [id, isEdit, tenantId, t]);

  const handleAddWork = () => {
    if (!workToAdd) return;
    const work = allWorks.find(w => w.id === workToAdd);
    if (work && !selectedWorks.find(sw => sw.id === work.id)) {
      setSelectedWorks([...selectedWorks, work]);
    }
    setWorkToAdd("");
  };

  const handleRemoveWork = (workId: string) => {
    setSelectedWorks(selectedWorks.filter(w => w.id !== workId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = selectedWorks.findIndex(w => w.id === active.id);
      const newIndex = selectedWorks.findIndex(w => w.id === over.id);
      setSelectedWorks(arrayMove(selectedWorks, oldIndex, newIndex));
    }
  };

  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Info
        if (!name.trim()) return t("admin.trailForm.labels.name") + " é obrigatório";
        return null;
      case 2: // Works
        // Optional validation: Require at least one work? Let's keep it optional for now.
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
    if (!tenantId) {
      addToast("Erro de autenticação", "error");
      return;
    }

    setSaving(true);
    const payload = {
      title: name,
      description,
      active,
      audioUrl: audioUrl || null,
      videoUrl: videoUrl || null,
      workIds: selectedWorks.map(w => w.id),
      tenantId
    };

    try {
      if (id) {
        await api.put(`/trails/${id}`, payload);
      } else {
        await api.post("/trails", payload);
      }
      addToast(id ? "Trilha atualizada com sucesso!" : "Trilha criada com sucesso!", "success");
      navigate("/admin/trilhas");
    } catch (error) {
      console.error("Erro ao salvar trilha", error);
      addToast("Erro ao salvar trilha. Verifique os dados.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "audio", setter: (val: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsUploading(true);
        const res = await api.post(`/upload/${type}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setter(res.data.url);
        addToast("Arquivo enviado com sucesso!", "success");
      } catch (error) {
        console.error(`Error uploading ${type}`, error);
        addToast("Erro ao enviar arquivo.", "error");
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

  return (
    <div className="admin-form-container">
      {isUploading && (
        <div className="admin-modal-overlay">
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div className="w-12 h-12 border-4 border-white/10 border-t-gold rounded-full animate-spin mb-4 mx-auto"></div>
            <p>Enviando arquivo...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-wizard-header">
        <Button onClick={() => navigate("/admin/trilhas")} variant="ghost" className="p-0">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="admin-wizard-title">
            {isEdit ? t("admin.trailForm.editTitle") : t("admin.trailForm.newTitle")}
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
                <Input
                  label={t("admin.trailForm.labels.name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("admin.trailForm.placeholders.name")}
                  required
                />

                <Textarea
                  label={t("admin.trailForm.labels.description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />

                <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] w-fit mt-2">
                  <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`transition-colors ${active ? "text-[var(--accent-gold)]" : "text-[var(--fg-muted)]"}`}
                  >
                    {active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                  <span className={`font-medium ${active ? "text-[var(--fg-main)]" : "text-[var(--fg-muted)]"}`}>
                    {active ? "Trilha Ativa" : "Trilha Inativa"}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 1: MÍDIA */}
            {currentStep === 1 && (
              <div className="flex-col gap-8">
                <div className="admin-section">
                  <h3 className="admin-section-title">
                    <Music className="text-[var(--accent-gold)]" /> Áudio-Guia
                  </h3>
                  <div className="flex-col gap-4">
                    <p className="text-sm text-[var(--fg-muted)]">
                      Áudio de introdução {term.trail === "Trilha" ? "da trilha" : "do roteiro"} que será reproduzido para os {term.visitors.toLowerCase()}.
                    </p>

                    {audioUrl && (
                      <div className="bg-[var(--bg-surface-active)] p-4 rounded-xl border border-[var(--border-default)]">
                        <audio controls src={audioUrl} className="w-full" />
                      </div>
                    )}

                    <label className="upload-btn w-full justify-center">
                      <Upload size={18} /> {audioUrl ? "Substituir Áudio" : "Enviar Áudio (MP3)"}
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "audio", setAudioUrl)}
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">
                    <Video className="text-blue-400" /> Vídeo
                  </h3>
                  <div className="flex-col gap-4">
                    <p className="text-sm text-[var(--fg-muted)]">
                      URL de vídeo do YouTube ou MP4 para apresentação {term.trail === "Trilha" ? "da trilha" : "do roteiro"}.
                    </p>
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      leftIcon={<Video size={16} />}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: OBRAS (ROTEIRO) */}
            {currentStep === 2 && (
              <div className="flex-col gap-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="admin-section-title mb-1">{t("admin.trailForm.labels.works")}</h3>
                    <p className="text-sm text-[var(--fg-muted)]">
                      Selecione e arraste para ordenar as obras.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--accent-gold)] font-mono">
                    {selectedWorks.length} obras
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <Select
                    value={workToAdd}
                    onChange={(e) => setWorkToAdd(e.target.value)}
                    containerClassName="flex-1 mb-0"
                  >
                    <option value="">{t("admin.trailForm.selectWork")}</option>
                    {allWorks.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddWork}
                    className="btn-secondary"
                    disabled={!workToAdd}
                  >
                    <Plus size={18} />
                  </Button>
                </div>

                <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[var(--border-subtle)] p-4 min-h-[300px]">
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={selectedWorks} strategy={verticalListSortingStrategy}>
                      {selectedWorks.map((work) => (
                        <SortableItem
                          key={work.id}
                          id={work.id}
                          title={work.title}
                          onRemove={() => handleRemoveWork(work.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {selectedWorks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-[var(--fg-tertiary)]">
                      <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
                        <Map className="text-[var(--fg-muted)]" size={24} />
                      </div>
                      <p className="font-medium">{t("admin.trailForm.empty")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: REVISÃO */}
            {currentStep === 3 && (
              <div className="flex-col gap-6">
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <CheckCircle size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--fg-main)' }}>Pronto para salvar!</h2>
                  <p style={{ color: 'var(--fg-muted)' }}>Revise os dados da trilha abaixo.</p>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-section">
                    <h3 className="admin-section-title">Resumo</h3>
                    <div className="summary-card">
                      <div className="summary-row">
                        <span className="summary-label">Nome:</span>
                        <span className="summary-value">{name}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Status:</span>
                        <span className="summary-value" style={{ color: active ? 'var(--status-success)' : 'var(--fg-muted)' }}>
                          {active ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Itens no Roteiro:</span>
                        <span className="summary-value">{selectedWorks.length}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Mídias:</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {audioUrl && <Music size={16} color="var(--status-success)" />}
                          {videoUrl && <Video size={16} color="var(--status-success)" />}
                          {!audioUrl && !videoUrl && <span style={{ fontSize: '0.8rem', color: 'gray' }}>Nenhuma</span>}
                        </div>
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
      <div className="admin-wizard-footer">
        <div className="admin-wizard-footer-inner">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => navigate("/admin/trilhas") : prevStep}
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
                Salvar Trilha
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

