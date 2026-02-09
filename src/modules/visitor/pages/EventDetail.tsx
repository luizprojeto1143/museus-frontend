import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { api, isDemoMode } from "../../../api/client";
import {
  MapPin, Calendar, Share2,
  User, CheckCircle, Video, ArrowLeft, Loader2, X, Ticket as TicketIcon, Info
} from "lucide-react";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { getFullUrl } from "../../../utils/url";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./EventDetail.css";

type Ticket = {
  id: string;
  name: string;
  type: 'FREE' | 'PAID';
  price: number;
  quantity: number;
  sold: number;
};

type FormField = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

type EventDetailType = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  coverImageUrl?: string;
  producerName?: string;
  producerDescription?: string;
  producerLogoUrl?: string;
  isOnline: boolean;
  meetingLink?: string;
  platform?: string;
  address?: string;
  number?: string;
  city?: string;
  state?: string;
  customFormSchema?: FormField[];
  galleryUrls?: string[];
  tenant?: { name: string };
  audioUrl?: string | null;
};

export const EventDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<{ attended: boolean; attendance?: unknown } | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchEventData = useCallback(async () => {
    if (isDemoMode) {
      setEvent({
        id: "1", title: "Oficina de Aquarela",
        description: "Aprenda técnicas fundamentais de aquarela, desde a mistura de cores até o controle da água. Material incluído. Venha explorar sua criatividade em um ambiente inspirador.",
        location: "Atelier 1", startDate: new Date().toISOString(),
        isOnline: false, coverImageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f"
      });
      setLoading(false);
      return;
    }

    if (id) {
      setLoading(true);
      try {
        const [evRes, tickRes, attRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/tickets`).catch(() => ({ data: [] })),
          api.get(`/events/${id}/my-attendance`).catch(() => ({ data: { attended: false } }))
        ]);
        const evData = evRes.data;

        if (typeof evData.customFormSchema === 'string') {
          try { evData.customFormSchema = JSON.parse(evData.customFormSchema); } catch { evData.customFormSchema = []; }
        }
        if (typeof evData.galleryUrls === 'string') {
          try { evData.galleryUrls = JSON.parse(evData.galleryUrls); } catch { evData.galleryUrls = []; }
        }

        setEvent({
          ...evData,
          audioUrl: getFullUrl(evData.audioUrl)
        });
        setTickets(tickRes.data);
        if (attRes.data?.attended) setAttendance(attRes.data);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleRegister = async () => {
    if (!selectedTicketId || !id) {
      addToast("Por favor, selecione um ingresso.", "info");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/events/${id}/register`, {
        ticketId: selectedTicketId,
        answers
      });
      setIsCheckoutOpen(false);
      addToast("Inscrição realizada com sucesso!", "success");
      fetchEventData();
    } catch (err) {
      console.error("Registration failed", err);
      addToast(t("common.error", "Erro ao realizar inscrição"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="event-loading flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <p className="text-slate-500 font-medium">Carregando detalhes do evento...</p>
    </div>
  );

  if (!event) return (
    <div className="event-error p-20 text-center">
      <Info className="mx-auto text-slate-300 mb-4" size={64} />
      <h2 className="text-2xl font-bold text-slate-400">Evento não encontrado</h2>
      <Button onClick={() => navigate('/eventos')} variant="outline" className="mt-6 mx-auto w-auto px-8">
        Voltar para Eventos
      </Button>
    </div>
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="event-detail-container bg-[#0a0a0c]">
      <Helmet>
        <title>{event.title} | Museus</title>
        <meta name="description" content={event.description?.substring(0, 150)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Evento: ${event.title}`} />
        <meta property="og:description" content={event.description?.substring(0, 150)} />
        <meta property="og:image" content={event.coverImageUrl} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      {/* Cover Image */}
      <div className="event-cover group">
        <img
          src={event.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
          className="event-cover-image"
          alt={event.title}
        />
        <div className="event-cover-gradient"></div>
        <button onClick={() => navigate(-1)} className="event-back-btn backdrop-blur-md bg-black/20 hover:bg-black/40 transition-colors">
          <ArrowLeft size={16} /> {t("common.back")}
        </button>
      </div>

      <div className="event-main-card">
        <div className="event-card-inner">
          {/* Header Info */}
          <div className="event-header">
            <div>
              <span className={`event-type-badge ${event.isOnline ? 'online' : 'presencial'}`}>
                {event.isOnline ? "Evento Online" : "Presencial"}
              </span>
              <h1 className="event-title text-4xl md:text-5xl font-black mt-4">{event.title}</h1>
              {event.producerName && (
                <p className="event-producer text-blue-400 mt-2 font-medium">
                  Organizado por <strong className="text-white">{event.producerName}</strong>
                </p>
              )}
            </div>

            <div className="event-date-card bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <Calendar size={28} className="text-blue-400" />
              </div>
              <div className="text-center md:text-left">
                <p className="event-date-label text-slate-500 text-xs font-bold uppercase tracking-widest">Data e Hora</p>
                <p className="event-date-value text-white font-bold">{formatDate(event.startDate)}</p>
              </div>
            </div>
          </div>

          <div className="event-content-grid mt-12">
            <div className="event-main-content space-y-12">
              {/* Description */}
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                <h3 className="event-section-title text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  Sobre o Evento
                </h3>
                <div className="event-description text-slate-400 leading-relaxed text-lg">
                  {event.description || "Sem descrição disponível."}
                </div>
              </div>

              {/* AUDIO GUIDE */}
              <NarrativeAudioGuide
                audioUrl={event.audioUrl}
                title={event.title}
              />

              {/* Producer */}
              {event.producerDescription && (
                <div className="event-producer-section bg-gradient-to-br from-indigo-500/5 to-transparent p-8 rounded-3xl border border-white/5">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><User size={20} className="text-indigo-400" /> Sobre o Produtor</h3>
                  <p className="text-slate-400 leading-relaxed">{event.producerDescription}</p>
                </div>
              )}

              {/* Gallery */}
              {event.galleryUrls && event.galleryUrls.length > 0 && (
                <div className="event-gallery">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    Momentos & Galeria
                  </h3>
                  <div className="event-gallery-grid">
                    {event.galleryUrls.map((url, idx) => (
                      <div key={idx} className="event-gallery-item group overflow-hidden rounded-2xl aspect-video border border-white/10">
                        <img src={url} alt={`Galeria ${idx}`} className="group-hover:scale-105 transition-transform duration-500 object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="event-sidebar space-y-6">
              {/* Location / Map */}
              <div className="event-location-card bg-white/5 p-8 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  {event.isOnline ? <Video size={20} className="text-blue-400" /> : <MapPin size={20} className="text-red-400" />}
                  {event.isOnline ? "Onde assistir" : "Localização"}
                </h3>

                {event.isOnline ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-slate-500 text-sm font-medium">Plataforma</span>
                      <span className="text-white font-bold">{event.platform || "Zoom/Meet"}</span>
                    </div>
                    {attendance ? (
                      <Button onClick={() => window.open(event.meetingLink, '_blank')} className="w-full py-6 text-lg rounded-2xl">
                        Acessar Transmissão
                      </Button>
                    ) : (
                      <div className="event-online-notice p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-center text-sm font-medium">
                        Link de acesso será liberado após a inscrição
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-white font-bold text-lg">{event.location}</p>
                      {event.address && <p className="text-slate-400 text-sm mt-1">{event.address}, {event.number}</p>}
                      {event.city && <p className="text-slate-500 text-xs mt-0.5">{event.city} - {event.state}</p>}
                    </div>
                    <div className="event-map-placeholder aspect-video bg-black/40 rounded-2xl flex flex-col items-center justify-center border border-white/5 text-slate-500 text-xs gap-2">
                      <MapPin size={24} className="opacity-20" />
                      Mapa Indisponível (Modo Demo)
                    </div>
                  </div>
                )}
              </div>

              {/* Share */}
              <Button variant="outline" className="w-full py-6 rounded-2xl border-white/10 hover:bg-white/5" leftIcon={<Share2 size={18} />}>
                Indicar para um amigo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="event-sticky-footer fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp">
        <div className="event-footer-inner max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] flex justify-between items-center shadow-2xl">
          <div className="event-price-info px-4">
            <p className="event-price-label text-[10px] uppercase font-black tracking-tighter text-slate-500">Valor Inicial</p>
            <p className="event-price-value text-2xl font-black text-white">
              {tickets.length > 0 ? (Math.min(...tickets.map(t => Number(t.price))) === 0 ? 'Grátis' : `R$ ${Math.min(...tickets.map(t => Number(t.price)))}`) : 'Indisponível'}
            </p>
          </div>

          {attendance ? (
            <div className="event-registered-badge bg-green-500/20 text-green-400 border border-green-500/30 px-8 py-4 rounded-2xl font-black flex items-center gap-2">
              <CheckCircle size={20} /> INSCRITO
            </div>
          ) : (
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              className="event-cta-btn px-10 py-5 rounded-2xl text-lg font-black shadow-xl shadow-blue-600/20"
            >
              Garantir Vaga
            </Button>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="event-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="event-modal bg-[#0f172a] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
            <div className="event-modal-header p-8 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-white">Ingressos</h3>
                <p className="text-slate-500 text-sm">Selecione sua modalidade de participação</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="event-modal-body p-8 overflow-y-auto space-y-10 custom-scrollbar">
              {/* Ticket Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-blue-500">
                  <TicketIcon size={14} />
                  Opções Disponíveis
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {tickets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`
                            flex items-center justify-between p-6 rounded-3xl border transition-all text-left
                            ${selectedTicketId === t.id ? 'bg-blue-600/20 border-blue-500 ring-4 ring-blue-500/10' : 'bg-white/5 border-white/5 hover:border-white/20'}
                        `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedTicketId === t.id ? 'border-blue-500 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-white/20'}`}>
                          {selectedTicketId === t.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className={`font-black text-lg ${selectedTicketId === t.id ? 'text-white' : 'text-slate-300'}`}>{t.name}</p>
                          <p className="text-xs text-slate-500 font-medium">Restam {t.quantity - t.sold} unidades</p>
                        </div>
                      </div>
                      <div className={`text-xl font-black ${selectedTicketId === t.id ? 'text-white' : 'text-slate-400'}`}>
                        {Number(t.price) === 0 ? "FREE" : `R$ ${Number(t.price)}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Form Questions */}
              {event?.customFormSchema && event.customFormSchema.length > 0 && (
                <div className="event-form-questions space-y-6">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-blue-500">
                    <User size={14} />
                    Informações Adicionais
                  </div>
                  <div className="space-y-5">
                    {event.customFormSchema.map((field, idx) => (
                      <div key={idx} className="event-form-group">
                        {field.type === 'textarea' ? (
                          <Textarea
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            rows={3}
                            value={answers[field.label] || ''}
                            onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                            placeholder="Descreva aqui..."
                          />
                        ) : field.type === 'select' ? (
                          <Select
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            value={answers[field.label] || ''}
                            onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                          >
                            <option value="">Selecione...</option>
                            {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                          </Select>
                        ) : (
                          <Input
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            type="text"
                            value={answers[field.label] || ''}
                            onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                            placeholder="Clique para digitar"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="event-modal-footer p-8 border-t border-white/10 flex gap-4 bg-[#0f172a] sticky bottom-0">
              <Button onClick={() => setIsCheckoutOpen(false)} variant="outline" className="flex-1 py-4 border-white/10 text-slate-400 hover:bg-white/5 rounded-2xl">
                Cancelar
              </Button>
              <Button
                onClick={handleRegister}
                disabled={submitting}
                className="flex-[2] py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                leftIcon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
              >
                {submitting ? "Confirmando..." : "Confirmar Inscrição"}
                {!submitting && <CheckCircle size={18} className="ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
