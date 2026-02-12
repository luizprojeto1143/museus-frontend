import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
  Calendar, MapPin, Ticket,
  ChevronRight, ChevronLeft, CheckCircle, Plus, Trash2, Globe, Video, Save,
  Image as ImageIcon, Monitor, Mic, PlayCircle, ArrowLeft, Upload, Circle
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminShared.css";
import { QRCodeCanvas } from "qrcode.react";

interface TicketData {
  id?: string;
  name: string;
  type: 'FREE' | 'PAID';
  price: number;
  quantity: number;
}

// Wizard Steps
const STEPS = [
  { id: 0, title: "Básico", desc: "Informações principais", icon: Calendar },
  { id: 1, title: "Local & Data", desc: "Onde e quando", icon: MapPin },
  { id: 2, title: "Ingressos", desc: "Valores e lotes", icon: Ticket },
  { id: 3, title: "Divulgação", desc: "Mídia e visibilidade", icon: PlayCircle }
];

export const AdminEventForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [spaces, setSpaces] = useState<{ id: string, name: string }[]>([]);
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

  // ... (refreshGeocoding, handleUpload, nextStep, prevStep omitted for brevity) ...
  // Re-inserting handleUpload etc not needed since I'm using replace on a block including fetching logic.
  // Wait, I need to be careful with Replace.
  // I will target specific blocks.

  // 1. Initial State Update
  // 2. Load Logic Update
  // 3. UI Update

  // Let's do it in chunks.
  // Chunk 1: Initial State & Load Logic


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
        addToast("Arquivo enviado com sucesso!", "success");
      } catch (error) {
        console.error(`Error uploading ${type}`, error);
        addToast("Erro ao enviar arquivo", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const nextStep = () => {
    // Simple validation per step could go here
    if (currentStep === 0 && !formData.title) {
      addToast("Informe o título do evento", "error");
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
      const payload = {
        ...formData,
        tenantId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        isOnline: formData.format === 'ONLINE',
        minMinutesForCertificate: formData.minMinutesForCertificate ? Number(formData.minMinutesForCertificate) : null
      };

      let eventId = id;
      if (id) {
        await api.put(`/events/${id}`, payload);
      } else {
        const res = await api.post("/events", payload);
        eventId = res.data.id;
      }

      // Save Tickets (Simple create logic)
      if (eventId) {
        for (const t of tickets) {
          if (!t.id) await api.post(`/events/${eventId}/tickets`, t);
        }
      }

      addToast(isEdit ? "Evento atualizado!" : "Evento criado!", "success");
      navigate("/admin/eventos");
    } catch (error) {
      console.error(error);
      addToast("Erro ao salvar.", "error");
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

  if (loading) return <div className="text-center p-10 text-slate-500">Carregando evento...</div>;

  return (
    <div className="admin-form-container">
      {isUploading && (
        <div className="admin-modal-overlay">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
            <p>Enviando arquivo...</p>
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
            {isEdit ? "Editar Evento" : "Novo Evento"}
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
            {/* STEP 0: BÁSICO */}
            {currentStep === 0 && (
              <div className="flex-col gap-6">
                <Input
                  label="Nome do Evento"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Festival de Inverno 2024"
                  required
                />

                <div className="admin-grid-2">
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

                  {formData.type === 'WORKSHOP' && (
                    <div className="admin-grid-2 col-span-2 bg-white/5 p-4 rounded-lg border border-white/10 mt-2">
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
                    </div>
                  )}

                  <div className="flex-col">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Capa do Evento</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                        placeholder="URL da imagem..."
                        value={formData.coverImageUrl}
                        onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      />
                      <label className="btn btn-secondary cursor-pointer">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "image", (url) => setFormData({ ...formData, coverImageUrl: url }))} />
                      </label>
                    </div>
                  </div>
                </div>

                {formData.coverImageUrl && (
                  <div className="h-48 w-full rounded-2xl overflow-hidden relative group border border-white/10">
                    <img src={formData.coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
                  </div>
                )}

                <Textarea
                  label="Descrição Completa"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  placeholder="Descreva os detalhes incríveis do seu evento..."
                />

                <div className="admin-grid-2">
                  <div
                    onClick={() => setFormData({ ...formData, format: "PRESENTIAL" })}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all group ${formData.format === 'PRESENTIAL'
                      ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className="absolute top-4 right-4 text-blue-400">
                      {formData.format === 'PRESENTIAL' ? <CheckCircle className="fill-blue-500/20" /> : <Circle className="text-slate-600 group-hover:text-slate-400" />}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${formData.format === 'PRESENTIAL' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                        <MapPin size={24} />
                      </div>
                      <div>
                        <span className={`block font-bold text-lg ${formData.format === 'PRESENTIAL' ? 'text-white' : 'text-slate-300'}`}>Presencial</span>
                        <p className="text-xs text-slate-400">Em um local físico</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, format: "ONLINE" })}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all group ${formData.format === 'ONLINE'
                      ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className="absolute top-4 right-4 text-purple-400">
                      {formData.format === 'ONLINE' ? <CheckCircle className="fill-purple-500/20" /> : <Circle className="text-slate-600 group-hover:text-slate-400" />}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${formData.format === 'ONLINE' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}>
                        <Monitor size={24} />
                      </div>
                      <div>
                        <span className={`block font-bold text-lg ${formData.format === 'ONLINE' ? 'text-white' : 'text-slate-300'}`}>Online</span>
                        <p className="text-xs text-slate-400">Transmissão remota</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LOCAL & DATA */}
            {currentStep === 1 && (
              <div className="flex-col gap-6">
                <div className="admin-grid-2">
                  <Input label="Início" type="datetime-local" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
                  <Input label="Fim" type="datetime-local" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>

                {formData.format === 'PRESENTIAL' && (
                  <div className="bg-blue-600/5 p-4 rounded-xl border border-blue-500/20 mb-4">
                    <Select
                      label="💾 Reservar Espaço Físico (Opcional)"
                      value={formData.spaceId}
                      onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                      description="Ao selecionar um espaço, o sistema verificará se não há conflitos de horário e reservará a sala automaticamente para este evento."
                    >
                      <option value="">Nenhum espaço selecionado</option>
                      {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                  </div>
                )}

                <div className="h-px bg-white/10 my-2"></div>

                {formData.format === 'PRESENTIAL' ? (
                  <>
                    <Input label="Nome do Local" placeholder="Ex: Teatro Municipal" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <Input
                          label="CEP"
                          value={formData.zipCode}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, zipCode: v });
                            if (v.length === 8) refreshGeocoding(v);
                          }}
                          maxLength={8}
                        />
                      </div>
                      <div className="flex-1">
                        <Input label="Endereço" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input label="Número" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                      <Input label="Cidade" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                      <Input label="Estado" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Select label="Plataforma" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })}>
                      <option value="ZOOM">Zoom</option>
                      <option value="MEET">Google Meet</option>
                      <option value="YOUTUBE">YouTube Live</option>
                    </Select>
                    <Input label="Link da Reunião" value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://..." />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: INGRESSOS */}
            {currentStep === 2 && (
              <div className="flex-col gap-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="admin-section-title">Lotes de Ingressos</h3>
                  <Button
                    variant="secondary"
                    onClick={() => setTickets([...tickets, { name: 'Novo Lote', type: 'FREE', price: 0, quantity: 100 }])}
                    leftIcon={<Plus size={16} />}
                  >
                    Adicionar
                  </Button>
                </div>

                {tickets.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                    <Ticket className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="text-slate-500">Nenhum ingresso criado.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tickets.map((t, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-4 items-start">
                        <div className="flex-1 gap-2 grid">
                          <Input
                            label="Nome do Lote"
                            value={t.name}
                            onChange={e => {
                              const n = [...tickets]; n[idx].name = e.target.value; setTickets(n);
                            }}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Select
                              label="Tipo"
                              value={t.type}
                              onChange={e => {
                                const n = [...tickets]; n[idx].type = e.target.value as any; setTickets(n);
                              }}
                            >
                              <option value="FREE">Gratuito</option>
                              <option value="PAID">Pago</option>
                            </Select>
                            <Input
                              label="Qtd."
                              type="number"
                              value={t.quantity}
                              onChange={e => {
                                const n = [...tickets]; n[idx].quantity = Number(e.target.value); setTickets(n);
                              }}
                            />
                            {t.type === 'PAID' && (
                              <Input
                                label="Preço (R$)"
                                type="number"
                                value={t.price}
                                onChange={e => {
                                  const n = [...tickets]; n[idx].price = Number(e.target.value); setTickets(n);
                                }}
                              />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => { const n = [...tickets]; n.splice(idx, 1); setTickets(n); }}
                          className="mt-8 p-2 text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DIVULGAÇÃO & REVISÃO */}
            {currentStep === 3 && (
              <div className="flex-col gap-6">
                <div className="admin-grid-2">
                  <Input
                    label="Vídeo de Divulgação (YouTube)"
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                  <div className="flex-col">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Áudio Guia (MP3)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        value={formData.audioUrl}
                        onChange={e => setFormData({ ...formData, audioUrl: e.target.value })}
                        placeholder="URL do aúdio..."
                      />
                      <label className="btn btn-secondary cursor-pointer">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleUpload(e, "audio", (url) => setFormData({ ...formData, audioUrl: url }))} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title">Visibilidade e Status</h3>
                  <div className="flex flex-col gap-4">
                    {/* Visibility */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFormData({ ...formData, visibility: "PUBLIC" })}
                        className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.visibility === "PUBLIC" ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/5'}`}
                      >
                        <Globe size={20} className={formData.visibility === "PUBLIC" ? 'text-blue-500' : 'text-slate-500'} />
                        <div>
                          <div className="font-bold text-white">Público</div>
                          <div className="text-xs text-slate-400">Visível no app</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, visibility: "PRIVATE" })}
                        className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.visibility === "PRIVATE" ? 'bg-amber-500/10 border-amber-500' : 'bg-white/5 border-white/5'}`}
                      >
                        <CheckCircle size={20} className={formData.visibility === "PRIVATE" ? 'text-amber-500' : 'text-slate-500'} />
                        <div>
                          <div className="font-bold text-white">Privado</div>
                          <div className="text-xs text-slate-400">Apenas link</div>
                        </div>
                      </button>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFormData({ ...formData, status: "DRAFT" })}
                        className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.status === "DRAFT" ? 'bg-slate-500/10 border-slate-500' : 'bg-white/5 border-white/5'}`}
                      >
                        <div className={`w-3 h-3 rounded-full ${formData.status === "DRAFT" ? 'bg-slate-400' : 'bg-slate-700'}`}></div>
                        <div>
                          <div className="font-bold text-white">Rascunho</div>
                          <div className="text-xs text-slate-400">Oculto do público</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, status: "PUBLISHED" })}
                        className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.status === "PUBLISHED" ? 'bg-green-500/10 border-green-500' : 'bg-white/5 border-white/5'}`}
                      >
                        <CheckCircle size={20} className={formData.status === "PUBLISHED" ? 'text-green-500' : 'text-slate-700'} />
                        <div>
                          <div className="font-bold text-white">Publicado</div>
                          <div className="text-xs text-slate-400">Visível imediatamente</div>
                        </div>
                      </button>
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
            onClick={currentStep === 0 ? () => navigate("/admin/eventos") : prevStep}
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="btn-primary"
                leftIcon={<Save size={18} />}
              >
                Salvar Evento
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
