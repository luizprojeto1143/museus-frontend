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

  // ... (previous logic stays same, replacing render)

  return (
    <div className="admin-form-container">
      {/* Header */}
      <div className="admin-wizard-header">
        <Button variant="ghost" onClick={() => navigate("/admin/eventos")} className="p-0 text-zinc-400 hover:text-white">
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

      <div className="admin-wizard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 0: BASIC */}
            {currentStep === 0 && (
              <div className="flex flex-col gap-6">
                <div className="admin-section">
                  <h3 className="admin-section-title"><Calendar size={20} /> Dados Principais</h3>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Nome do Evento"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
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
                        label="Formato"
                        value={formData.format}
                        onChange={e => setFormData({ ...formData, format: e.target.value })}
                      >
                        <option value="PRESENTIAL">Presencial</option>
                        <option value="ONLINE">Online</option>
                        <option value="HYBRID">Híbrido</option>
                      </Select>
                    </div>
                    <Textarea
                      label="Descrição"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: DATE & LOCATION */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div className="admin-section">
                  <h3 className="admin-section-title"><Calendar size={20} /> Cronograma</h3>
                  <div className="admin-grid-2">
                    <Input
                      label="Início"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                    <Input
                      label="Término"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {formData.format !== 'ONLINE' && (
                  <div className="admin-section">
                    <h3 className="admin-section-title"><MapPin size={20} /> Localização</h3>
                    <div className="admin-grid-2">
                      <Input
                        label="Local / Espaço"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: Teatro Municipal"
                      />
                      <Input
                        label="CEP"
                        value={formData.zipCode}
                        onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                      />
                    </div>
                    <div className="admin-grid-2">
                      <Input
                        label="Endereço"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Número"
                          value={formData.number}
                          onChange={e => setFormData({ ...formData, number: e.target.value })}
                        />
                        <Input
                          label="Cidade/UF"
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(formData.format === 'ONLINE' || formData.format === 'HYBRID') && (
                  <div className="admin-section">
                    <h3 className="admin-section-title"><Video size={20} /> Transmissão Online</h3>
                    <div className="admin-grid-2">
                      <Select
                        label="Plataforma"
                        value={formData.platform}
                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                      >
                        <option value="ZOOM">Zoom</option>
                        <option value="GOOGLE_MEET">Google Meet</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="OTHER">Outra</option>
                      </Select>
                      <Input
                        label="Link da Reunião"
                        value={formData.meetingLink}
                        onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: TICKETS (Placeholder for now, keeping it simple visual update) */}
            {currentStep === 2 && (
              <div className="admin-section">
                <h3 className="admin-section-title"><Ticket size={20} /> Ingressos</h3>
                <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-700 rounded-xl bg-black/20">
                  <p>Gestão de Lotes e Ingressos aqui.</p>
                  <Button variant="ghost" className="mt-4 border border-zinc-700">Adicionar Lote</Button>
                </div>
              </div>
            )}

            {/* STEP 3: MEDIA & PUBLISH */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-6">
                <div className="admin-section">
                  <h3 className="admin-section-title"><ImageIcon size={20} /> Imagem de Capa</h3>
                  {/* Reusing Upload UI logic from WorkForm manually since reusable component isn't extracted yet */}
                  <div className="upload-box relative group">
                    {formData.coverImageUrl ? (
                      <>
                        <img src={formData.coverImageUrl} className="w-full h-64 object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                          <Button variant="ghost" className="text-white border-white">Trocar Imagem</Button>
                        </div>
                      </>
                    ) : (
                      <div className="py-8">
                        <Upload className="mx-auto mb-2 text-zinc-500" />
                        <p className="text-zinc-400">Clique para fazer upload da capa</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-section">
                  <h3 className="admin-section-title"><CheckCircle size={20} /> Publicação</h3>
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                    <div>
                      <span className="block font-bold text-white">Status do Evento</span>
                      <span className="text-sm text-zinc-400">{formData.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}</span>
                    </div>
                    <Select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      containerClassName="mb-0 w-40"
                    >
                      <option value="DRAFT">Rascunho</option>
                      <option value="PUBLISHED">Publicado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="admin-wizard-footer">
        <div className="admin-wizard-footer-inner">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => navigate("/admin/eventos") : () => setCurrentStep(p => p - 1)}
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 ? (
              <Button onClick={() => { }} className="btn-primary" leftIcon={<Save size={20} />}>
                Salvar Evento
              </Button>
            ) : (
              <Button onClick={() => setCurrentStep(p => p + 1)} className="btn-primary" rightIcon={<ChevronRight size={20} />}>
                Próximo
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};


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
  <div className="max-w-4xl mx-auto pb-20 animate-fadeIn">
    {isUploading && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[#d4af37] rounded-full animate-spin mb-4 mx-auto"></div>
          <p>Enviando arquivo...</p>
        </div>
      </div>
    )}

    {/* Header */}
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" onClick={() => navigate("/admin/eventos")} className="btn-ghost w-12 h-12 rounded-full p-0 flex items-center justify-center">
        <ArrowLeft size={24} />
      </Button>
      <div>
        <h1 className="section-title">
          {isEdit ? "Editar Evento" : "Novo Evento"}
        </h1>
        <p className="text-gray-400 italic">
          Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
        </p>
      </div>
    </div>

    {/* Stepper */}
    <div className="mb-8 flex items-center justify-between px-4 overflow-x-auto">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            className="flex flex-col items-center gap-2 min-w-[100px] cursor-pointer"
            onClick={() => {
              // Allow navigation to completed steps or if editing
              if (isEdit || index < currentStep) {
                setDirection(index > currentStep ? 1 : -1);
                setCurrentStep(index);
              }
            }}
          >
            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                                ${isActive ? 'bg-[#d4af37] border-[#d4af37] text-[#1a1108] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110' :
                isCompleted ? 'bg-[#22c55e] border-[#22c55e] text-[#1a1108]' :
                  'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-gray-500'
              }
                            `}>
              {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-[#d4af37]' : 'text-gray-500'}`}>
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
          {/* STEP 0: BÁSICO */}
          {currentStep === 0 && (
            <div className="card space-y-6">
              <div className="form-group">
                <label className="form-label">Nome do Evento</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Festival de Inverno 2024"
                  required
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Evento</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="input w-full"
                  >
                    <option value="OTHER">Geral / Outro</option>
                    <option value="WORKSHOP">Oficina / Workshop</option>
                    <option value="EXHIBITION">Exposição</option>
                    <option value="SHOW">Show / Apresentação</option>
                    <option value="LECTURE">Palestra / Aula</option>
                  </select>
                </div>

                {formData.type === 'WORKSHOP' && (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[rgba(255,255,255,0.03)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="form-group">
                      <label className="form-label">Instrutor / Facilitador</label>
                      <input
                        placeholder="Nome do responsável..."
                        value={formData.instructor}
                        onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Materiais Necessários</label>
                      <input
                        placeholder="Ex: Tesoura, papel, notebook..."
                        value={formData.materials}
                        onChange={e => setFormData({ ...formData, materials: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 form-group">
                  <label className="form-label">Capa do Evento</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
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
                <div className="h-64 w-full rounded-xl overflow-hidden relative border border-[rgba(212,175,55,0.2)]">
                  <img src={formData.coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Descrição Completa</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  placeholder="Descreva os detalhes incríveis do seu evento..."
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setFormData({ ...formData, format: "PRESENTIAL" })}
                  className={`relative p-6 rounded-xl border cursor-pointer transition-all group ${formData.format === 'PRESENTIAL'
                    ? 'bg-[rgba(34,197,94,0.1)] border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                >
                  <div className="absolute top-4 right-4">
                    {formData.format === 'PRESENTIAL' ? <CheckCircle className="text-[#22c55e]" /> : <Circle className="text-gray-600" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${formData.format === 'PRESENTIAL' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-gray-800 text-gray-400'}`}>
                      <MapPin size={24} />
                    </div>
                    <div>
                      <span className={`block font-bold text-lg ${formData.format === 'PRESENTIAL' ? 'text-[#f5e6d3]' : 'text-gray-400'}`}>Presencial</span>
                      <p className="text-sm text-gray-500">Em um local físico</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, format: "ONLINE" })}
                  className={`relative p-6 rounded-xl border cursor-pointer transition-all group ${formData.format === 'ONLINE'
                    ? 'bg-[rgba(168,85,247,0.1)] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                >
                  <div className="absolute top-4 right-4">
                    {formData.format === 'ONLINE' ? <CheckCircle className="text-purple-500" /> : <Circle className="text-gray-600" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${formData.format === 'ONLINE' ? 'bg-purple-500/20 text-purple-500' : 'bg-gray-800 text-gray-400'}`}>
                      <Monitor size={24} />
                    </div>
                    <div>
                      <span className={`block font-bold text-lg ${formData.format === 'ONLINE' ? 'text-[#f5e6d3]' : 'text-gray-400'}`}>Online</span>
                      <p className="text-sm text-gray-500">Transmissão remota</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: LOCAL & DATA */}
          {currentStep === 1 && (
            <div className="card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Início</label>
                  <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required className="input w-full" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fim</label>
                  <input type="datetime-local" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="input w-full" />
                </div>
              </div>

              {formData.format === 'PRESENTIAL' && (
                <div className="bg-[rgba(212,175,55,0.05)] p-6 rounded-xl border border-[rgba(212,175,55,0.1)] mb-4">
                  <div className="form-group">
                    <label className="form-label">💾 Reservar Espaço Físico (Opcional)</label>
                    <select
                      value={formData.spaceId}
                      onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Nenhum espaço selecionado</option>
                      {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <p className="text-xs text-[#d4af37] mt-2">Ao selecionar um espaço, o sistema verificará conflitos de horário.</p>
                  </div>
                </div>
              )}

              <div className="h-px bg-[rgba(255,255,255,0.1)] my-2"></div>

              {formData.format === 'PRESENTIAL' ? (
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">Nome do Local</label>
                    <input placeholder="Ex: Teatro Municipal" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="input w-full" />
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1/3 form-group">
                      <label className="form-label">CEP</label>
                      <input
                        value={formData.zipCode}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, zipCode: v });
                          if (v.length === 8) refreshGeocoding(v);
                        }}
                        maxLength={8}
                        className="input w-full"
                      />
                    </div>
                    <div className="flex-1 form-group">
                      <label className="form-label">Endereço</label>
                      <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input w-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">Número</label>
                      <input value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} className="input w-full" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cidade</label>
                      <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="input w-full" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estado</label>
                      <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="input w-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Plataforma</label>
                    <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="input w-full">
                      <option value="ZOOM">Zoom</option>
                      <option value="MEET">Google Meet</option>
                      <option value="YOUTUBE">YouTube Live</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link da Reunião</label>
                    <input value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://..." className="input w-full" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: INGRESSOS */}
          {currentStep === 2 && (
            <div className="card space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="card-title">Lotes de Ingressos</h3>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTickets([...tickets, { name: 'Novo Lote', type: 'FREE', price: 0, quantity: 100 }])}
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.02)]">
                  <Ticket className="mx-auto text-gray-600 mb-2" size={32} />
                  <p className="text-gray-500">Nenhum ingresso criado.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tickets.map((t, idx) => (
                    <div key={idx} className="bg-[rgba(255,255,255,0.03)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)] flex gap-4 items-start">
                      <div className="flex-1 gap-4 grid">
                        <div className="form-group">
                          <label className="form-label">Nome do Lote</label>
                          <input
                            value={t.name}
                            onChange={e => {
                              const n = [...tickets]; n[idx].name = e.target.value; setTickets(n);
                            }}
                            className="input w-full"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="form-group">
                            <label className="form-label">Tipo</label>
                            <select
                              value={t.type}
                              onChange={e => {
                                const n = [...tickets]; n[idx].type = e.target.value as any; setTickets(n);
                              }}
                              className="input w-full"
                            >
                              <option value="FREE">Gratuito</option>
                              <option value="PAID">Pago</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Quantidade</label>
                            <input
                              type="number"
                              value={t.quantity}
                              onChange={e => {
                                const n = [...tickets]; n[idx].quantity = Number(e.target.value); setTickets(n);
                              }}
                              className="input w-full"
                            />
                          </div>
                          {t.type === 'PAID' && (
                            <div className="form-group">
                              <label className="form-label">Preço (R$)</label>
                              <input
                                type="number"
                                value={t.price}
                                onChange={e => {
                                  const n = [...tickets]; n[idx].price = Number(e.target.value); setTickets(n);
                                }}
                                className="input w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { const n = [...tickets]; n.splice(idx, 1); setTickets(n); }}
                        className="mt-8 p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
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
            <div className="space-y-6">
              <div className="card">
                <h3 className="card-title mb-6">Mídia & Divulgação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Vídeo de Divulgação (YouTube)</label>
                    <input
                      value={formData.videoUrl}
                      onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="form-label">Áudio Guia (MP3)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input flex-1"
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
              </div>

              <div className="card">
                <h3 className="card-title mb-6">Visibilidade e Status</h3>
                <div className="flex flex-col gap-4">
                  {/* Visibility */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, visibility: "PUBLIC" })}
                      className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.visibility === "PUBLIC" ? 'bg-blue-500/10 border-blue-500' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]'}`}
                    >
                      <Globe size={24} className={formData.visibility === "PUBLIC" ? 'text-blue-500' : 'text-gray-500'} />
                      <div>
                        <div className="font-bold text-[#f5e6d3]">Público</div>
                        <div className="text-xs text-gray-500">Visível no app</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, visibility: "PRIVATE" })}
                      className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.visibility === "PRIVATE" ? 'bg-amber-500/10 border-amber-500' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]'}`}
                    >
                      <CheckCircle size={24} className={formData.visibility === "PRIVATE" ? 'text-amber-500' : 'text-gray-500'} />
                      <div>
                        <div className="font-bold text-[#f5e6d3]">Privado</div>
                        <div className="text-xs text-gray-500">Apenas link</div>
                      </div>
                    </button>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, status: "DRAFT" })}
                      className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.status === "DRAFT" ? 'bg-gray-500/10 border-gray-500' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]'}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${formData.status === "DRAFT" ? 'bg-gray-400' : 'bg-gray-700'}`}></div>
                      <div>
                        <div className="font-bold text-[#f5e6d3]">Rascunho</div>
                        <div className="text-xs text-gray-500">Oculto do público</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, status: "PUBLISHED" })}
                      className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.status === "PUBLISHED" ? 'bg-[#22c55e]/10 border-[#22c55e]' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]'}`}
                    >
                      <CheckCircle size={24} className={formData.status === "PUBLISHED" ? 'text-[#22c55e]' : 'text-gray-700'} />
                      <div>
                        <div className="font-bold text-[#f5e6d3]">Publicado</div>
                        <div className="text-xs text-gray-500">Visível imediatamente</div>
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
    <div className="flex justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.1)]">
      <Button
        variant="ghost"
        className="btn-ghost"
        onClick={currentStep === 0 ? () => navigate("/admin/eventos") : prevStep}
      >
        {currentStep === 0 ? "Cancelar" : "Voltar"}
      </Button>

      <div className="flex gap-2">
        {currentStep === STEPS.length - 1 ? (
          <Button
            onClick={handleSubmit}
            isLoading={saving}
            className="btn btn-primary px-8"
            leftIcon={<Save size={18} />}
          >
            Salvar Evento
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            className="btn btn-primary"
            rightIcon={<ChevronRight size={18} />}
          >
            Próximo
          </Button>
        )}
      </div>
    </div>
  </div>
);
};
