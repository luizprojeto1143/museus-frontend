import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
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
  Calendar, MapPin, Ticket, Clock,
  ChevronRight, ChevronLeft, CheckCircle, Plus, Trash2, Globe, Video, Save,
  Image as ImageIcon, Monitor, Mic, PlayCircle, ArrowLeft, Upload, Circle,
  Sparkles, Info, Target, ListOrdered, CheckCircle2, Layout
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTerminology } from "../../../hooks/useTerminology";
import "./AdminShared.css";
import { QRCodeCanvas } from "qrcode.react";

interface TicketData {
  id?: string;
  name: string;
  type: 'FREE' | 'PAID';
  price: number;
  quantity: number;
}

// Wizard Steps moved inside
// const STEPS = [
//   { id: 0, title: "B�sico", desc: "Informa��es principais", icon: Calendar },
//   { id: 1, title: "Local & Data", desc: "Onde e quando", icon: MapPin },
//   { id: 2, title: "Ingressos", desc: "Valores e lotes", icon: Ticket },
//   { id: 3, title: "Divulga��o", desc: "M�dia e visibilidade", icon: PlayCircle }
// ];

export const AdminEventForm: React.FC = () => {
  const { t } = useTranslation();
  const term = useTerminology();
  const STEPS = [
    { id: 0, title: "Básico", desc: "Informações principais", icon: Calendar },
    { id: 1, title: "Local & Data", desc: "Onde e quando", icon: MapPin },
    { id: 2, title: "Ingressos", desc: "Valores e lotes", icon: Ticket },
    { id: 3, title: "Divulgação", desc: "Mídia e visibilidade", icon: PlayCircle }
  ];
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [spaces, setSpaces] = useState<{ id: string, name: string }[]>([]);
  const [equipamentos, setEquipamentos] = useState<Array<{ id: string; nome: string }>>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    coverImageUrl: "",
    format: "PRESENTIAL", // PRESENTIAL, ONLINE
    startDate: "",
    endDate: "",
    location: "",
    zipCode: "",
    address: "",
    number: "",
    city: "",
    state: "",
    platform: "ZOOM",
    meetingLink: "",
    producerName: "",
    producerDescription: "",
    visibility: "PUBLIC",
    status: "DRAFT", // New Field
    audioUrl: "",
    videoUrl: "",
    // Workshop Fields
    type: "OTHER",
    instructor: "",
    materials: "",
    // Certificate
    certificateBackgroundUrl: "",
    minMinutesForCertificate: "",
    certificateRequiresSurvey: false,
    spaceId: "",
    equipamentoId: "",
  });

  // Load Data
  useEffect(() => {
    if (tenantId) {
      api.get("/categories", { params: { tenantId, type: 'EVENT' } })
        .then(res => setCategories(res.data))
        .catch(console.error);

      api.get("/spaces", { params: { tenantId } })
        .then(res => setSpaces(res.data))
        .catch(console.error);

      api.get("/equipamentos")
        .then(res => setEquipamentos(res.data))
        .catch(console.error);
    }

    if (id && tenantId) {
      setLoading(true);
      api.get(`/events/${id}`)
        .then(async (res) => {
          const data = res.data;
          setFormData({
            title: data.title || "",
            description: data.description || "",
            categoryId: data.categoryId || "",
            coverImageUrl: data.coverImageUrl || "",
            format: data.format || (data.isOnline ? "ONLINE" : "PRESENTIAL"),
            startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : "",
            endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "",
            location: data.location || "",
            zipCode: data.zipCode || "",
            address: data.address || "",
            number: data.number || "",
            city: data.city || "",
            state: data.state || "",
            platform: data.platform || "ZOOM",
            meetingLink: data.meetingLink || "",
            producerName: data.producerName || "",
            producerDescription: data.producerDescription || "",
            visibility: data.visibility || "PUBLIC",
            status: data.status || "DRAFT",
            audioUrl: data.audioUrl || "",
            videoUrl: data.videoUrl || "",
            type: data.type || "OTHER",
            instructor: data.instructor || "",
            materials: data.materials || "",
            certificateBackgroundUrl: data.certificateBackgroundUrl || "",
            minMinutesForCertificate: data.minMinutesForCertificate || "",
            certificateRequiresSurvey: data.certificateRequiresSurvey || false,
            spaceId: data.spaceId || "",
            equipamentoId: data.equipamentoId || "",
          });

          // Fetch tickets
          try {
            const ticketRes = await api.get(`/events/${id}/tickets`);
            setTickets(ticketRes.data);
          } catch (e) { console.error(e); }
        })
        .finally(() => setLoading(false));
    }
  }, [id, tenantId]);

  const refreshGeocoding = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (e) { console.error(e); }
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio" | "video", setter: (url: string) => void) => {
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
        console.error(`Error uploading ${type}`, error);
        toast.error("Erro ao enviar arquivo");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const nextStep = () => {
    if (currentStep === 0 && !formData.title) {
      toast.error("Informe o título do evento");
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
    if (!tenantId) return;
    setSaving(true);
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        format: formData.format,
        location: formData.location || undefined,
        zipCode: formData.zipCode || undefined,
        address: formData.address || undefined,
        number: formData.number || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        platform: formData.platform,
        meetingLink: formData.meetingLink || undefined,
        producerName: formData.producerName || undefined,
        producerDescription: formData.producerDescription || undefined,
        visibility: formData.visibility,
        status: formData.status,
        type: formData.type,
        instructor: formData.instructor || undefined,
        materials: formData.materials || undefined,
        certificateRequiresSurvey: formData.certificateRequiresSurvey,
        tenantId,
        equipamentoId: formData.equipamentoId || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        isOnline: formData.format === 'ONLINE',
        minMinutesForCertificate: formData.minMinutesForCertificate ? Number(formData.minMinutesForCertificate) : null
      };

      if (formData.categoryId) payload.categoryId = formData.categoryId;
      if (formData.spaceId) payload.spaceId = formData.spaceId;
      if (formData.coverImageUrl) payload.coverImageUrl = formData.coverImageUrl;
      if (formData.audioUrl) payload.audioUrl = formData.audioUrl;
      if (formData.videoUrl) payload.videoUrl = formData.videoUrl;
      if (formData.certificateBackgroundUrl) payload.certificateBackgroundUrl = formData.certificateBackgroundUrl;

      let eventId = id;
      if (id) {
        await api.put(`/events/${id}`, payload);
      } else {
        const res = await api.post("/events", payload);
        eventId = res.data.id;
      }

      // Save Tickets (Simple create logic)
      if (eventId) {
        for (const ticket of tickets) {
          if (!ticket.id) await api.post(`/events/${eventId}/tickets`, ticket);
        }
      }

      toast.success(isEdit ? "Evento atualizado!" : "Evento criado!");
      navigate("/admin/eventos");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
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

  if (loading) return <div className="text-center p-10 text-zinc-400">Carregando evento...</div>;

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
        <Button variant="ghost" onClick={() => navigate("/admin/eventos")} className="p-0">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="admin-wizard-title">
            {isEdit ? t("admin.eventForm.editTitle", "Editar Evento") : t("admin.eventForm.newTitle", "Novo Evento")}
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
              onClick={() => {
                if (isEdit || index < currentStep) {
                  setDirection(index > currentStep ? 1 : -1);
                  setCurrentStep(index);
                }
              }}
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

      {/* Content */}
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
            style={{ width: "100%" }}
          >
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Input
                      label="Nome do Evento"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Concerto de Primavera"
                      required
                    />

                    <Select
                      label="Equipamento Responsável"
                      value={formData.equipamentoId}
                      onChange={e => setFormData({ ...formData, equipamentoId: e.target.value })}
                      required
                    >
                      <option value="">Selecione o equipamento...</option>
                      {equipamentos.map(e => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Categoria"
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </Select>

                      <Select
                        label="Tipo de Evento"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="OTHER">Geral / Outro</option>
                        <option value="WORKSHOP">Oficina / Workshop</option>
                        <option value="EXHIBITION">Exposição</option>
                        <option value="SHOW">Show / Apresentação</option>
                        <option value="LECTURE">Palestra / Aula</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-slate-500'}`}>
                               <Globe size={20} />
                            </div>
                            <div>
                               <h4 className="text-white font-bold text-sm">Visibilidade</h4>
                               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{formData.status === 'PUBLISHED' ? 'Público' : 'Rascunho'}</p>
                            </div>
                         </div>
                         <Switch 
                           checked={formData.status === 'PUBLISHED'} 
                           onCheckedChange={(val) => setFormData({...formData, status: val ? 'PUBLISHED' : 'DRAFT'})} 
                         />
                      </div>

                      <div className="space-y-4">
                         <label className="text-sm font-bold text-slate-400">Formato do Evento</label>
                         <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, format: "PRESENTIAL" })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${formData.format === 'PRESENTIAL' ? 'bg-gold-400/10 border-gold-400/50 text-gold-400' : 'bg-white/5 border-white/5 text-slate-500'}`}
                            >
                               <MapPin size={20} />
                               <span className="block font-black uppercase tracking-widest text-[10px]">Presencial</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, format: "ONLINE" })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${formData.format === 'ONLINE' ? 'bg-blue-400/10 border-blue-400/50 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500'}`}
                            >
                               <Monitor size={20} />
                               <span className="block font-black uppercase tracking-widest text-[10px]">Online</span>
                            </button>
                         </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {formData.type === 'WORKSHOP' && (
                  <AnimateIn variant="fadeUp">
                    <Card className="p-6 bg-blue-500/5 border-blue-500/20 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Instrutor / Facilitador"
                          placeholder="Nome do responsável..."
                          value={formData.instructor}
                          onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                        />
                        <Input
                          label="Materiais Necessários"
                          placeholder="Ex: Tesoura, papel, notebook..."
                          value={formData.materials}
                          onChange={e => setFormData({ ...formData, materials: e.target.value })}
                        />
                    </Card>
                  </AnimateIn>
                )}

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-400">Capa do Evento</label>
                      {formData.coverImageUrl && (
                        <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, coverImageUrl: ''})} className="text-red-400 h-8">Remover</Button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div 
                        onClick={() => document.getElementById('cover-upload')?.click()}
                        className="aspect-video rounded-3xl border-2 border-dashed border-white/10 hover:border-gold-400/50 bg-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all overflow-hidden relative"
                      >
                         {formData.coverImageUrl ? (
                           <>
                             <img src={formData.coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Upload className="text-white" size={32} />
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-gold-400 transition-colors">
                                <ImageIcon size={24} />
                             </div>
                             <div className="text-center">
                                <p className="text-white font-bold">Clique para subir a capa</p>
                                <p className="text-slate-500 text-xs">PNG, JPG ou WebP (Máx. 5MB)</p>
                             </div>
                           </>
                         )}
                         <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "image", (url) => setFormData({ ...formData, coverImageUrl: url }))} />
                      </div>
                      
                      <div className="space-y-6">
                        <Textarea
                          label="Descrição Completa"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={8}
                          placeholder="Descreva os detalhes incríveis do seu evento..."
                        />
                      </div>
                   </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                          <Clock size={20} />
                       </div>
                       Horários do Evento
                    </h3>
                    <div className="space-y-6">
                      <Input 
                        label="Data e Hora de Início"
                        type="datetime-local" 
                        value={formData.startDate} 
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                        required 
                        className="bg-black/20"
                      />
                      <Input 
                        label="Data e Hora de Término (Opcional)"
                        type="datetime-local" 
                        value={formData.endDate} 
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })} 
                        className="bg-black/20"
                      />
                    </div>
                  </Card>

                  {formData.format === 'PRESENTIAL' ? (
                    <Card className="p-8 bg-gold-400/5 border-gold-400/20 rounded-[32px] space-y-6">
                       <h3 className="text-lg font-bold text-gold-400 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center text-gold-400">
                             <Layout size={20} />
                          </div>
                          Reserva de Espaço
                       </h3>
                       <div className="space-y-6">
                         <Select
                           label="Espaço Físico do Museu"
                           value={formData.spaceId}
                           onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                           className="bg-black/20"
                         >
                           <option value="">Selecione um espaço...</option>
                           {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </Select>
                         <div className="flex items-start gap-3 p-4 bg-black/20 rounded-2xl border border-gold-400/10">
                           <Info size={18} className="text-gold-400 mt-0.5" />
                           <p className="text-xs text-slate-400 leading-relaxed">
                             Ao selecionar um espaço, o sistema verificará conflitos de agenda e reservará o local automaticamente para este evento.
                           </p>
                         </div>
                       </div>
                    </Card>
                  ) : (
                    <Card className="p-8 bg-blue-400/5 border-blue-400/20 rounded-[32px] space-y-6">
                       <h3 className="text-lg font-bold text-blue-400 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center text-blue-400">
                             <Monitor size={20} />
                          </div>
                          Transmissão Online
                       </h3>
                       <div className="space-y-6">
                          <Select 
                            label="Plataforma"
                            value={formData.platform} 
                            onChange={e => setFormData({ ...formData, platform: e.target.value })} 
                            className="bg-black/20"
                          >
                            <option value="ZOOM">Zoom</option>
                            <option value="MEET">Google Meet</option>
                            <option value="YOUTUBE">YouTube Live</option>
                          </Select>
                          <Input 
                            label="Link da Reunião / Live"
                            value={formData.meetingLink} 
                            onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} 
                            placeholder="https://..." 
                            className="bg-black/20"
                          />
                       </div>
                    </Card>
                  )}
                </div>

                {formData.format === 'PRESENTIAL' && (
                  <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] space-y-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                       <MapPin className="text-gold-400" size={20} />
                       Localização Detalhada
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div className="lg:col-span-2">
                         <Input 
                           label="Nome do Local"
                           placeholder="Ex: Auditório Principal, Sala de Cinema..." 
                           value={formData.location} 
                           onChange={e => setFormData({ ...formData, location: e.target.value })} 
                           className="bg-black/20"
                         />
                       </div>
                       <Input
                         label="CEP"
                         placeholder="00000-000"
                         value={formData.zipCode}
                         onChange={e => {
                           const v = e.target.value.replace(/\D/g, '');
                           setFormData({ ...formData, zipCode: v });
                           if (v.length === 8) refreshGeocoding(v);
                         }}
                         maxLength={8}
                         className="bg-black/20"
                       />
                       <div className="lg:col-span-2">
                         <Input label="Endereço" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="bg-black/20" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <Input label="Número" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} className="bg-black/20" />
                         <Input label="UF" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="bg-black/20" />
                       </div>
                       <Input label="Cidade" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="bg-black/20" />
                    </div>
                  </Card>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                       <Ticket className="text-gold-400" size={24} />
                       Lotes de Ingressos
                    </h3>
                    <p className="text-slate-500 text-sm">Configure os valores e a quantidade de ingressos disponíveis.</p>
                  </div>
                  <Button
                    onClick={() => setTickets([...tickets, { name: 'Novo Lote', type: 'FREE', price: 0, quantity: 100 }])}
                    className="rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    leftIcon={<Plus size={18} />}
                  >
                    Adicionar Lote
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {tickets.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className="p-12 text-center border-white/5 bg-black/20 rounded-[32px] border-dashed">
                          <Ticket className="mx-auto text-slate-700 mb-4" size={48} />
                          <p className="text-slate-500">Nenhum ingresso criado até o momento.</p>
                        </Card>
                      </motion.div>
                    ) : (
                      tickets.map((ticket, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] relative group hover:border-gold-400/30 transition-all">
                            <button
                              type="button"
                              onClick={() => { const n = [...tickets]; n.splice(idx, 1); setTickets(n); }}
                              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            >
                              <Trash2 size={20} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                              <div className="lg:col-span-1">
                                <Input
                                  label="Nome do Lote"
                                  value={ticket.name}
                                  onChange={e => {
                                    const n = [...tickets]; n[idx].name = e.target.value; setTickets(n);
                                  }}
                                  className="bg-black/20"
                                />
                              </div>
                              <Select
                                label="Tipo"
                                value={ticket.type}
                                onChange={e => {
                                  const n = [...tickets]; n[idx].type = e.target.value as any; setTickets(n);
                                }}
                                className="bg-black/20"
                              >
                                <option value="FREE">Gratuito</option>
                                <option value="PAID">Pago</option>
                              </Select>
                              <Input
                                label="Quantidade"
                                type="number"
                                value={ticket.quantity}
                                onChange={e => {
                                  const n = [...tickets]; n[idx].quantity = Number(e.target.value); setTickets(n);
                                }}
                                className="bg-black/20"
                              />
                              {ticket.type === 'PAID' && (
                                <Input
                                  label="Preço (R$)"
                                  type="number"
                                  value={ticket.price}
                                  onChange={e => {
                                    const n = [...tickets]; n[idx].price = Number(e.target.value); setTickets(n);
                                  }}
                                  className="bg-black/20"
                                />
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] space-y-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                         <PlayCircle className="text-gold-400" size={24} />
                         Mídia & Divulgação
                      </h3>
                      <div className="space-y-6">
                        <Input
                          label="Vídeo de Divulgação (Link YouTube)"
                          value={formData.videoUrl}
                          onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                          className="bg-black/20"
                        />
                        
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-slate-400">Áudio Guia (MP3)</label>
                           <div className="flex gap-2">
                             <Input
                               value={formData.audioUrl}
                               onChange={e => setFormData({ ...formData, audioUrl: e.target.value })}
                               placeholder="URL do arquivo de áudio..."
                               className="bg-black/20 flex-1"
                             />
                             <Button 
                               variant="glass" 
                               className="rounded-2xl h-12 w-12 p-0 border-white/5"
                               onClick={() => document.getElementById('audio-upload')?.click()}
                             >
                               <Upload size={20} />
                               <input id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={(e) => handleUpload(e, "audio", (url) => setFormData({ ...formData, audioUrl: url }))} />
                             </Button>
                           </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-8 bg-gold-400/5 border-gold-400/20 rounded-[32px] space-y-6">
                       <h3 className="text-xl font-bold text-gold-400 flex items-center gap-3">
                          <Target size={24} />
                          Controle de Visibilidade
                       </h3>
                       <div className="space-y-4">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, visibility: "PUBLIC" })}
                            className={`w-full p-6 rounded-2xl border transition-all flex items-center gap-4 text-left ${formData.visibility === 'PUBLIC' ? 'bg-gold-400/10 border-gold-400/50 text-gold-400' : 'bg-white/5 border-white/5 text-slate-500'}`}
                          >
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.visibility === 'PUBLIC' ? 'bg-gold-400/20' : 'bg-white/5'}`}>
                                <Globe size={24} />
                             </div>
                             <div>
                                <h4 className="font-bold text-white">Evento Público</h4>
                                <p className="text-xs text-slate-500">Visível para todos os visitantes no App.</p>
                             </div>
                             <div className="ml-auto">
                                {formData.visibility === 'PUBLIC' ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-20" />}
                             </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, visibility: "PRIVATE" })}
                            className={`w-full p-6 rounded-2xl border transition-all flex items-center gap-4 text-left ${formData.visibility === 'PRIVATE' ? 'bg-slate-500/10 border-slate-500/50 text-slate-500' : 'bg-white/5 border-white/5 text-slate-500'}`}
                          >
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.visibility === 'PRIVATE' ? 'bg-slate-500/20' : 'bg-white/5'}`}>
                                <Eye size={24} />
                             </div>
                             <div>
                                <h4 className="font-bold text-white">Apenas com Link</h4>
                                <p className="text-xs text-slate-500">Oculto na listagem, acessível via link direto.</p>
                             </div>
                             <div className="ml-auto">
                                {formData.visibility === 'PRIVATE' ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-20" />}
                             </div>
                          </button>
                       </div>
                    </Card>
                  </div>

                  <div className="space-y-8">
                     <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                           <Sparkles className="text-gold-400" size={24} />
                           Certificado Digital
                        </h3>
                        <p className="text-slate-500 text-sm">Gere certificados automáticos para os participantes do evento.</p>
                        
                        <div className="space-y-6">
                           <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                              <div className="space-y-1">
                                 <h4 className="text-white font-bold text-sm">Exigir Pesquisa</h4>
                                 <p className="text-xs text-slate-500">Libera o certificado após responder a pesquisa.</p>
                              </div>
                              <Switch 
                                checked={formData.certificateRequiresSurvey} 
                                onCheckedChange={(val) => setFormData({...formData, certificateRequiresSurvey: val})} 
                              />
                           </div>

                           <Input
                             label="Tempo Mínimo de Permanência (Minutos)"
                             type="number"
                             value={formData.minMinutesForCertificate}
                             onChange={e => setFormData({ ...formData, minMinutesForCertificate: e.target.value })}
                             placeholder="Ex: 60"
                             className="bg-black/20"
                           />
                           
                           <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-400">Fundo do Certificado</label>
                             <div className="flex gap-2">
                               <Input
                                 value={formData.certificateBackgroundUrl}
                                 onChange={e => setFormData({ ...formData, certificateBackgroundUrl: e.target.value })}
                                 placeholder="URL da imagem de fundo..."
                                 className="bg-black/20 flex-1"
                               />
                               <Button 
                                 variant="glass" 
                                 className="rounded-2xl h-12 w-12 p-0 border-white/5"
                                 onClick={() => document.getElementById('cert-upload')?.click()}
                               >
                                 <Upload size={20} />
                                 <input id="cert-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "image", (url) => setFormData({ ...formData, certificateBackgroundUrl: url }))} />
                               </Button>
                             </div>
                           </div>
                        </div>
                     </Card>

                     <Card className="p-8 bg-blue-500/5 border-blue-500/20 rounded-[32px] flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-2xl p-2 shrink-0">
                           <QRCodeCanvas value={id ? `https://msv.app/e/${id}` : 'https://msv.app'} size={64} style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-1">QR Code de Check-in</h4>
                           <p className="text-xs text-slate-400 leading-relaxed">
                              Este QR Code será usado pelos visitantes para validar a entrada no evento e registrar presença.
                           </p>
                        </div>
                     </Card>
                  </div>
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
            onClick={currentStep === 0 ? () => navigate("/admin/eventos") : prevStep}
            className="rounded-2xl h-14 px-8 text-slate-400 hover:text-white"
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-4">
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="rounded-2xl h-14 px-10 bg-gold-400 text-slate-950 font-black uppercase tracking-widest shadow-xl shadow-gold-400/20"
                leftIcon={<Save size={20} />}
              >
                Salvar Evento
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
