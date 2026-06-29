import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Input, 
  Select, 
  Textarea, 
  Button, 
  Switch, 
  Card, 
  Badge, 
  AnimateIn
} from "@/components/ui";
import {
  ArrowLeft, Save, Plus, GripVertical, X, Music, Video,
  ToggleLeft, ToggleRight, Map, CheckCircle2, FileText,
  MapPin, CheckCircle, ChevronRight, Upload, Play, MonitorPlay,
  Sparkles, Info, Target, ListOrdered
} from "lucide-react";
import { useTerminology } from "../../../../hooks/useTerminology";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import "./AdminShared.css";

// Componente auxiliar para item ordenável
function SortableItem({ id, title, onRemove }: { id: string; title: string; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 mb-3 rounded-2xl border transition-all duration-200 ${
        isDragging 
          ? 'bg-gold-400/20 border-gold-400/50 shadow-2xl shadow-gold-400/10 z-50 scale-[1.02]' 
          : 'bg-white/[0.03] border-white/5 hover:border-gold-400/30'
      }`}
    >
      <div className="flex items-center gap-4 flex-1" {...attributes} {...listeners}>
        <div className="p-2 rounded-lg bg-white/5 text-slate-500 cursor-grab active:cursor-grabbing hover:text-gold-400 transition-colors">
          <GripVertical size={18} />
        </div>
        <span className="text-white font-bold">{title}</span>
      </div>
      <button
        type="button"
        onPointerDown={(e: unknown) => e.stopPropagation()}
        onClick={(e: unknown) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
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
  const [isExtracting, setIsExtracting] = useState(false);
  const [equipamentos, setEquipamentos] = useState<Array<{ id: string; nome: string }>>([]);
  const [equipamentoId, setEquipamentoId] = useState("");

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

      api.get("/equipamentos").then(res => {
        setEquipamentos(res.data);
      });
    }

    if (isEdit) {
      api.get(`/trails/${id}`)
        .then(res => {
          const trail = res.data as { title: string; description: string; active?: boolean; audioUrl?: string; videoUrl?: string; equipamentoId?: string; works?: { id: string; title: string }[] };
          setName(trail.title);
          setDescription(trail.description);
          setActive(trail.active !== false);
          setAudioUrl(trail.audioUrl || "");
          setVideoUrl(trail.videoUrl || "");
          setEquipamentoId(trail.equipamentoId || "");
          if (trail.works && Array.isArray(trail.works)) {
            setSelectedWorks(trail.works.map(w => ({
              id: w.id,
              title: w.title
            })));
          }
        })
        .catch(err => {
          logger.error("Erro ao carregar trilha", err);
          toast.error("Erro ao carregar trilha");
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
      toast.error(error);
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
      toast.error("Erro de autenticação");
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
      tenantId,
      equipamentoId: equipamentoId || undefined
    };

    try {
      if (id) {
        await api.put(`/trails/${id}`, payload);
      } else {
        await api.post("/trails", payload);
      }
      toast.success(id ? "Trilha atualizada com sucesso!" : "Trilha criada com sucesso!");
      navigate("/admin/trilhas");
    } catch (error) {
      logger.error("Erro ao salvar trilha", error);
      toast.error("Erro ao salvar trilha. Verifique os dados.");
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
        toast.success("Arquivo enviado com sucesso!");
      } catch (error) {
        logger.error(`Error uploading ${type}`, error);
        toast.error("Erro ao enviar arquivo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePdfExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "trail");

      try {
        setIsExtracting(true);
        const res = await api.post("/ai/extract-pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const data = res.data;
        if (data.title) setName(data.title);
        if (data.description) setDescription(data.description);

        toast.success("Informações extraídas do PDF com sucesso!");
      } catch (err) {
        logger.error("Erro ao extrair PDF:", err);
        toast.error("Houve um erro ao extrair informações do PDF.");
      } finally {
        setIsExtracting(false);
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
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-12 h-12 border-4 border-white/10 border-t-gold-400 rounded-full animate-spin"></div>
            <p className="font-black uppercase tracking-widest text-[10px]">Enviando arquivo...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-wizard-header">
        <Button variant="ghost" onClick={() => navigate("/admin/trilhas")} className="p-0">
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
            {currentStep === 0 && (
              <div className="space-y-8">
                <AnimateIn variant="fadeUp">
                  <Card className="p-6 bg-blue-500/5 border-blue-500/20 rounded-3xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                           <Sparkles size={24} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">Preencher automaticamente?</h4>
                          <p className="text-slate-400 text-sm">Suba um arquivo PDF com os dados da {term.trail.toLowerCase()} e faremos o resto.</p>
                        </div>
                      </div>
                      <Button
                        variant="glass"
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        isLoading={isExtracting}
                        leftIcon={<Upload size={18} />}
                        className="rounded-2xl h-12 px-8 border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                      >
                        {isExtracting ? "Extraindo..." : "Subir PDF"}
                      </Button>
                      <input 
                        id="pdf-upload"
                        type="file" 
                        accept=".pdf" 
                        onChange={handlePdfExtract} 
                        disabled={isExtracting}
                        className="hidden"
                      />
                    </div>
                  </Card>
                </AnimateIn>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Input
                      label={t("admin.trailForm.labels.name")}
                      value={name}
                      onChange={(e: unknown) => setName(e.target.value)}
                      placeholder={t("admin.trailForm.placeholders.name")}
                      required
                    />

                    <Select
                      label="Equipamento Responsável"
                      value={equipamentoId}
                      onChange={e => setEquipamentoId(e.target.value)}
                      required
                    >
                      <option value="">Selecione o equipamento...</option>
                      {equipamentos.map(e => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-slate-500'}`}>
                               <Target size={20} />
                            </div>
                            <h4 className="text-white font-bold">{active ? "Trilha Ativa" : "Rascunho"}</h4>
                         </div>
                         <Switch checked={active} onCheckedChange={setActive} />
                      </div>
                      <p className="text-slate-500 text-sm">
                        {active 
                          ? "Esta trilha está visível para os visitantes no mapa e na lista." 
                          : "Esta trilha está oculta e não pode ser acessada pelos visitantes."}
                      </p>
                    </Card>
                  </div>
                </div>

                <Textarea
                  label={t("admin.trailForm.labels.description")}
                  value={description}
                  onChange={(e: unknown) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Descreva o objetivo e o percurso deste roteiro..."
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-8 border-white/5 bg-black/20 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3">
                       <Music className="text-gold-400" size={24} />
                       <h3 className="text-xl font-bold text-white">Áudio-Guia</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Áudio de introdução {term.trail === "Trilha" ? "da trilha" : "do roteiro"} que será reproduzido para os {term.visitors.toLowerCase()} ao iniciarem o percurso.
                      </p>

                      {audioUrl && (
                        <Card className="p-4 bg-white/5 border-white/5 rounded-2xl">
                           <audio controls src={audioUrl} className="w-full h-10" />
                        </Card>
                      )}

                      <Button
                        variant="glass"
                        onClick={() => document.getElementById('audio-upload')?.click()}
                        isLoading={isUploading}
                        className="w-full rounded-2xl h-14 border-white/5 bg-white/5 hover:bg-white/10"
                        leftIcon={<Upload size={20} />}
                      >
                        {audioUrl ? "Substituir Áudio" : "Enviar Áudio (MP3)"}
                      </Button>
                      <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e: unknown) => handleFileUpload(e, "audio", setAudioUrl)}
                      />
                    </div>
                  </Card>

                  <Card className="p-8 border-white/5 bg-black/20 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3">
                       <Video className="text-blue-400" size={24} />
                       <h3 className="text-xl font-bold text-white">Apresentação em Vídeo</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-sm text-slate-500 leading-relaxed">
                        URL de vídeo do YouTube ou MP4 para apresentação visual {term.trail === "Trilha" ? "da trilha" : "do roteiro"}.
                      </p>
                      
                      <Input
                        value={videoUrl}
                        onChange={(e: unknown) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="bg-black/20 h-14"
                        leftIcon={<Video size={20} className="text-slate-500" />}
                      />

                      {videoUrl && (
                        <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/5">
                           {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                             <iframe
                               className="w-full h-full"
                               src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1] || videoUrl.split('/').pop()}`}
                               title="Video preview"
                               frameBorder="0"
                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                               allowFullScreen
                             ></iframe>
                           ) : (
                             <video src={videoUrl} controls className="w-full h-full" />
                           )}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <ListOrdered className="text-gold-400" size={24} />
                       Organizar Roteiro
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Selecione as {term.works.toLowerCase()} e defina a ordem de visitação.
                    </p>
                  </div>
                  <Badge variant="outline" className="h-8 px-4 text-gold-400 border-gold-400/20 bg-gold-400/5 font-mono">
                    {selectedWorks.length} {term.works} selecionadas
                  </Badge>
                </div>

                <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl">
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Select
                      value={workToAdd}
                      onChange={(e: unknown) => setWorkToAdd(e.target.value)}
                      containerClassName="flex-1 mb-0"
                      className="h-14 bg-black/20"
                    >
                      <option value="">Buscar {term.work.toLowerCase()}...</option>
                      {allWorks.map(w => (
                        <option key={w.id} value={w.id}>{w.title}</option>
                      ))}
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAddWork}
                      disabled={!workToAdd}
                      className="h-14 px-8 rounded-2xl bg-gold-400 text-slate-950 font-black"
                      leftIcon={<Plus size={20} />}
                    >
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-2 min-h-[200px]">
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={selectedWorks} strategy={verticalListSortingStrategy}>
                        {selectedWorks.map((work: unknown) => (
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
                      <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 border-dashed">
                          <Map size={32} />
                        </div>
                        <p className="font-bold">Nenhuma {term.work.toLowerCase()} adicionada ainda.</p>
                        <p className="text-sm">Selecione uma {term.work.toLowerCase()} acima para começar seu roteiro.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-10">
                <AnimateIn variant="fadeUp">
                  <div className="text-center space-y-4 py-8">
                    <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-400 mx-auto">
                      <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Quase lá!</h2>
                    <p className="text-slate-400 font-medium">Revise o roteiro da sua {term.trail.toLowerCase()} antes de publicar.</p>
                  </div>
                </AnimateIn>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-8 border-white/5 bg-black/20 rounded-[32px] space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <FileText className="text-gold-400" size={20} />
                       Informações Básicas
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-500 text-sm">Nome da {term.trail}</span>
                        <span className="text-white font-bold">{name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-500 text-sm">Status</span>
                        <Badge variant="outline" className={active ? "text-green-400 border-green-400/20" : "text-slate-400 border-white/10"}>
                          {active ? "Ativa" : "Rascunho"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-500 text-sm">Mídias</span>
                        <div className="flex gap-2">
                           {audioUrl && <Music size={18} className="text-green-400" />}
                           {videoUrl && <Video size={18} className="text-green-400" />}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8 border-white/5 bg-black/20 rounded-[32px] space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <ListOrdered className="text-gold-400" size={20} />
                       Sequência de Visitação
                    </h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                       {selectedWorks.map((work: unknown, idx: unknown) => (
                         <div key={work.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-gold-400/10 flex items-center justify-center text-gold-400 text-xs font-black">
                               {idx + 1}
                            </div>
                            <span className="text-white font-bold text-sm truncate">{work.title}</span>
                         </div>
                       ))}
                       {selectedWorks.length === 0 && (
                         <p className="text-slate-500 text-sm text-center py-8 italic">Nenhuma obra selecionada.</p>
                       )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="admin-wizard-footer">
        <div className="admin-wizard-footer-inner">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => navigate("/admin/trilhas") : prevStep}
            className="rounded-2xl h-14 px-8 text-slate-400 hover:text-white"
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-4">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="rounded-2xl h-14 px-10 bg-gold-400 text-slate-950 font-black uppercase tracking-widest shadow-xl shadow-gold-400/20"
                leftIcon={<Save size={20} />}
              >
                Salvar Trilha
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="rounded-2xl h-14 px-10 bg-gold-400 text-slate-950 font-black uppercase tracking-widest shadow-xl shadow-gold-400/20"
                rightIcon={<ChevronRight size={20} />}
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

