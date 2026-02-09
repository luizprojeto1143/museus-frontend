import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
  Calendar, MapPin, Ticket, User,
  ChevronRight, ChevronLeft, Check, Plus, Trash2, Globe, Video, Save,
  Image as ImageIcon, Monitor, Mic, PlayCircle
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import "../../master/pages/MasterShared.css"; // Reuse premium styles

interface TicketData {
  id?: string;
  name: string;
  type: 'FREE' | 'PAID';
  price: number;
  quantity: number;
}

export const AdminEventForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
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
    audioUrl: "",
    videoUrl: "",
    // Certificate
    certificateBackgroundUrl: "",
    minMinutesForCertificate: "",
    certificateRequiresSurvey: false,
  });

  const steps = [
    { id: 1, label: "Básico", desc: "Informações principais", icon: <Calendar size={18} /> },
    { id: 2, label: "Local & Data", desc: "Onde e quando", icon: <MapPin size={18} /> },
    { id: 3, label: "Ingressos", desc: "Valores e lotes", icon: <Ticket size={18} /> },
    { id: 4, label: "Divulgação", desc: "Extras e Mídia", icon: <PlayCircle size={18} /> } // Changed icon to PlayCircle for better compatibility
  ];

  // Load Data
  useEffect(() => {
    if (tenantId) {
      api.get("/categories", { params: { tenantId, type: 'EVENT' } })
        .then(res => setCategories(res.data))
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
            audioUrl: data.audioUrl || "",
            videoUrl: data.videoUrl || "",
            certificateBackgroundUrl: data.certificateBackgroundUrl || "",
            minMinutesForCertificate: data.minMinutesForCertificate || "",
            certificateRequiresSurvey: data.certificateRequiresSurvey || false,
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

  if (loading) return <div className="text-center p-10 text-slate-500">Carregando evento...</div>;

  return (
    <div className="flex h-screen bg-[#0a0a0c] overflow-hidden">

      {/* SIDEBAR STEPPER */}
      <div className="w-80 bg-[#0f172a] border-r border-white/5 p-8 flex flex-col pt-10">
        <div className="mb-12">
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">
            {isEdit ? "Editar Evento" : "Novo Evento"}
          </h1>
          <p className="text-sm text-slate-500">Configure os detalhes do seu evento passo a passo.</p>
        </div>

        <div className="space-y-6 relative">
          {/* Connecting line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/5 -z-10"></div>

          {steps.map((s, idx) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`group flex items-start gap-4 w-full text-left transition-all duration-300 ${isActive ? 'translate-x-2' : ''}`}
              >
                <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-xl shrink-0 z-10
                            ${isActive
                    ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-blue-500/20'
                    : isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                      : 'bg-[#1e293b] border-white/5 text-slate-500 group-hover:border-white/20'}
                        `}>
                  {isCompleted ? <Check size={18} /> : s.icon}
                </div>
                <div className="pt-2">
                  <div className={`font-bold text-sm transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {s.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-auto">
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-8">
            <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Dica Pro</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Você pode salvar o evento como Rascunho a qualquer momento e terminar depois.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0c] to-[#0a0a0c]">

        {/* SCROLLABLE FORM AREA */}
        <div className="flex-1 overflow-y-auto p-12">
          <div className="max-w-3xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Informações Básicas</h2>
                  <p className="text-slate-400">O que é o seu evento e para quem ele é?</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                  <Input
                    label="Nome do Evento"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Festival de Inverno 2024"
                    className="h-14 text-lg font-bold"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Categoria"
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      className="h-12"
                    >
                      <option value="">Selecione...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <ImageIcon size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-bold text-slate-500 uppercase">Capa do Evento</div>
                        <input
                          className="bg-transparent border-none text-sm text-white w-full focus:ring-0 p-0"
                          placeholder="URL da imagem..."
                          value={formData.coverImageUrl}
                          onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {formData.coverImageUrl && (
                    <div className="h-48 w-full rounded-2xl overflow-hidden relative group">
                      <img src={formData.coverImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Capa" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                        <span className="text-white font-bold text-sm">Preview da Capa</span>
                      </div>
                    </div>
                  )}

                  <Textarea
                    label="Descrição Completa"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    placeholder="Descreva os detalhes incríveis do seu evento..."
                    className="bg-black/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, format: "PRESENTIAL" })}
                    className={`p-6 rounded-2xl border text-left transition-all ${formData.format === 'PRESENTIAL' ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/20' : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                  >
                    <MapPin size={24} className={formData.format === 'PRESENTIAL' ? 'text-white' : 'text-slate-400'} />
                    <div className={`font-bold mt-4 text-lg ${formData.format === 'PRESENTIAL' ? 'text-white' : 'text-slate-200'}`}>Presencial</div>
                    <div className={`text-sm mt-1 ${formData.format === 'PRESENTIAL' ? 'text-blue-200' : 'text-slate-500'}`}>Em um local físico</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, format: "ONLINE" })}
                    className={`p-6 rounded-2xl border text-left transition-all ${formData.format === 'ONLINE' ? 'bg-purple-600 border-purple-500 shadow-xl shadow-purple-900/20' : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                  >
                    <Monitor size={24} className={formData.format === 'ONLINE' ? 'text-white' : 'text-slate-400'} />
                    <div className={`font-bold mt-4 text-lg ${formData.format === 'ONLINE' ? 'text-white' : 'text-slate-200'}`}>Online</div>
                    <div className={`text-sm mt-1 ${formData.format === 'ONLINE' ? 'text-purple-200' : 'text-slate-500'}`}>Transmissão remota</div>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Quando e Onde?</h2>
                  <p className="text-slate-400">Defina o cronograma e a localização.</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Início" type="datetime-local" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required className="h-12" />
                    <Input label="Fim" type="datetime-local" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="h-12" />
                  </div>

                  <div className="h-px bg-white/10 my-6"></div>

                  {formData.format === 'PRESENTIAL' ? (
                    <div className="space-y-4">
                      <Input label="Nome do Local" placeholder="Ex: Teatro Municipal" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                      <div className="flex gap-4">
                        <div className="w-40">
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
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Select label="Plataforma de Streaming" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })}>
                        <option value="ZOOM">Zoom</option>
                        <option value="MEET">Google Meet</option>
                        <option value="YOUTUBE">YouTube Live</option>
                      </Select>
                      <Input label="Link da Reunião" value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://..." leftIcon={<Monitor size={16} />} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Ingressos</h2>
                    <p className="text-slate-400">Gerencie a venda ou distribuição.</p>
                  </div>
                  <Button
                    onClick={() => setTickets([...tickets, { name: 'Novo Lote', type: 'FREE', price: 0, quantity: 100 }])}
                    leftIcon={<Plus size={18} />}
                    className="bg-white text-black hover:bg-slate-200"
                  >
                    Adicionar
                  </Button>
                </div>

                {tickets.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                    <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">Nenhum ingresso criado</h3>
                    <p className="text-slate-400">Clique em adicionar para criar o primeiro lote.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {tickets.map((t, idx) => (
                      <div key={idx} className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 flex gap-6 items-start animate-in slide-in-from-bottom-2">
                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0
                                            ${t.type === 'FREE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}
                                        `}>
                          {t.type === 'FREE' ? '0' : '$'}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Lote</label>
                              <input
                                className="w-full bg-transparent border-b border-white/10 py-1 text-white focus:outline-none focus:border-white/30 transition-colors"
                                value={t.name}
                                onChange={e => {
                                  const n = [...tickets]; n[idx].name = e.target.value; setTickets(n);
                                }}
                              />
                            </div>
                            <div className="w-32">
                              <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                              <select
                                className="w-full bg-transparent border-b border-white/10 py-1 text-white focus:outline-none text-sm"
                                value={t.type}
                                onChange={e => {
                                  const n = [...tickets]; n[idx].type = e.target.value as any; setTickets(n);
                                }}
                              >
                                <option value="FREE">Gratuito</option>
                                <option value="PAID">Pago</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Quantidade</label>
                              <input
                                type="number"
                                className="w-full bg-transparent border-b border-white/10 py-1 text-white focus:outline-none"
                                value={t.quantity}
                                onChange={e => {
                                  const n = [...tickets]; n[idx].quantity = Number(e.target.value); setTickets(n);
                                }}
                              />
                            </div>
                            {t.type === 'PAID' && (
                              <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Preço (R$)</label>
                                <input
                                  type="number"
                                  className="w-full bg-transparent border-b border-white/10 py-1 text-white focus:outline-none"
                                  value={t.price}
                                  onChange={e => {
                                    const n = [...tickets]; n[idx].price = Number(e.target.value); setTickets(n);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => { const n = [...tickets]; n.splice(idx, 1); setTickets(n); }}
                          className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Divulgação e Extras</h2>
                  <p className="text-slate-400">Detalhes finais para publicar.</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PlayCircle className="text-pink-400" size={20} /> Mídia e Áudio
                  </h3>
                  <Input label="Vídeo de Divulgação (YouTube)" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} leftIcon={<PlayCircle size={16} />} />
                  <Input label="Áudio-Guia (MP3)" value={formData.audioUrl} onChange={e => setFormData({ ...formData, audioUrl: e.target.value })} leftIcon={<Mic size={16} />} />
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="text-blue-400" size={20} /> Visibilidade
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, visibility: "PUBLIC" })}
                      className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${formData.visibility === "PUBLIC" ? 'bg-blue-500/10 border-blue-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                    >
                      <div className={`p-2 rounded-full ${formData.visibility === "PUBLIC" ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-500'}`}><Globe size={20} /></div>
                      <div>
                        <div className="font-bold text-white">Público</div>
                        <div className="text-xs text-slate-400">Visível no site e app</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, visibility: "PRIVATE" })}
                      className={`flex-1 p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${formData.visibility === "PRIVATE" ? 'bg-amber-500/10 border-amber-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                    >
                      <div className={`p-2 rounded-full ${formData.visibility === "PRIVATE" ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-500'}`}><Check size={20} /></div>
                      <div>
                        <div className="font-bold text-white">Privado</div>
                        <div className="text-xs text-slate-400">Apenas via link direto</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM NAV BAR */}
        <div className="h-24 bg-[#0f172a] border-t border-white/5 px-8 flex items-center justify-between z-20">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate('/admin/eventos') : setStep(s => s - 1)}
            className="text-slate-400 hover:text-white"
            leftIcon={step > 1 ? <ChevronLeft size={18} /> : undefined}
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          <div className="flex items-center gap-4">
            {step < 4 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                className="px-8 h-12 rounded-xl font-bold text-base bg-white text-black hover:bg-slate-200 border-none"
                rightIcon={<ChevronRight size={18} />}
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-green-500/20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 border-none text-white"
                leftIcon={<Save size={18} />}
              >
                {isEdit ? 'Salvar Alterações' : 'Publicar Evento'}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
