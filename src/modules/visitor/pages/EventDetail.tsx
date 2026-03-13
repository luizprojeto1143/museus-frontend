import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import {
  Calendar, Share2,
  User, Video, ArrowLeft, X, MapPin, Star
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { getFullUrl } from "../../../utils/url";
import { VideoPlayer } from "../../../components/common/VideoPlayer";
import { useToast } from "../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
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
  type?: string;
  instructor?: string;
  materials?: string;
};

export const EventDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isGuest } = useAuth();

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<{ attended: boolean; attendance?: unknown } | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<{ pixQrCode?: string; pixPayload?: string; invoiceUrl?: string } | null>(null);

  const fetchEventData = useCallback(async () => {
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
          audioUrl: getFullUrl(evData.audioUrl),
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

  useEffect(() => {
    if (!id || isGuest) return;
    api.get(`/favorites/check?type=event&id=${id}`)
      .then(res => setIsFavorite(res.data.isFavorite))
      .catch(err => console.error("Error checking favorite status", err));
  }, [id, isGuest]);

  const toggleFavorite = async () => {
    if (isGuest) {
      addToast(t("visitor.favorites.loginRequired", "Crie uma conta para salvar favoritos!"), "info");
      return;
    }
    try {
      if (isFavorite) {
        await api.delete(`/favorites/event/${id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { type: 'event', itemId: id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Erro ao favoritar", err);
    }
  };

  const handleRegister = async () => {
    if (!selectedTicketId || !id) {
      addToast("Por favor, selecione um ingresso.", "info");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/events/${id}/register`, {
        ticketId: selectedTicketId,
        answers
      });

      if (res.data.payment) {
        setPaymentData(res.data.payment);
        addToast("Ingresso reservado! Aguardando pagamento.", "success");
      } else {
        setIsCheckoutOpen(false);
        addToast("Inscrição realizada com sucesso!", "success");
        fetchEventData();
      }
    } catch (err) {
      console.error("Registration failed", err);
      addToast(t("common.error", "Erro ao realizar inscrição"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-40">
       <div className="splash-loader-fill h-1 w-40"></div>
    </div>
  );

  if (!event) return (
    <div className="work-error p-20 text-center">
      <h2 className="text-2xl font-fd text-gold-hi mb-6">Espetáculo não encontrado</h2>
      <button onClick={() => navigate('/eventos')} className="gallery-cta">
        Voltar para Agenda
      </button>
    </div>
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <motion.div 
      className="event-detail-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="event-hero-premium">
        <img
          src={event.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
          className="event-hero-img-premium"
          alt={event.title}
        />
        <div className="event-hero-overlay"></div>
        <button onClick={() => navigate(-1)} className="action-btn-premium !absolute top-8 left-8">
          <ArrowLeft size={16} />
        </button>
      </header>

      <div className="event-header-premium">
        <span className="event-badge-premium">
           {event.isOnline ? "Transmissão Digital" : (event.type === 'WORKSHOP' ? "Oficina Cultural" : "Espetáculo Presencial")}
        </span>
        <h1 className="event-title-premium">{event.title}</h1>
        
        <div className="flex items-center gap-4 mt-6">
           <div className="flex items-center gap-2 bg-gold-dim border border-gold-glow px-4 py-2 rounded-full">
              <Calendar size={16} className="text-gold" />
              <span className="font-fd text-white">{formatDate(event.startDate)}</span>
           </div>
           
           <button 
             onClick={toggleFavorite}
             className={`action-btn-premium ${isFavorite ? 'active' : ''}`}
           >
             <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
           </button>
           
           <button className="action-btn-premium">
              <Share2 size={18} />
           </button>
        </div>
      </div>

      <div className="px-10">
        <div className="event-editorial-grid">
          <main className="event-main-premium">
            <section className="work-body-premium">
               {event.description || "Informaçes em breve."}
            </section>

            <NarrativeAudioGuide audioUrl={event.audioUrl} title={event.title} />

            {event.galleryUrls && event.galleryUrls.length > 0 && (
              <div className="related-section-premium !mt-0">
                <span className="sidebar-label-premium">Galeria do Espetáculo</span>
                <div className="related-grid-premium">
                  {event.galleryUrls.map((url, idx) => (
                    <div key={idx} className="related-card-premium overflow-hidden aspect-video">
                      <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="work-sidebar-premium">
            <div className="sidebar-card-premium">
               <span className="sidebar-label-premium">{event.isOnline ? "Acesso" : "Palco"}</span>
               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     {event.isOnline ? <Video className="text-gold" size={20} /> : <MapPin className="text-gold" size={20} />}
                     <span className="font-fd text-white">{event.location || (event.isOnline ? "Ambiente Digital" : "Galeria Principal")}</span>
                  </div>
                  {!event.isOnline && event.address && (
                    <p className="text-muted text-sm">{event.address}, {event.number} - {event.city}</p>
                  )}
               </div>
            </div>

            {event.producerName && (
               <div className="sidebar-card-premium">
                  <span className="sidebar-label-premium">Curadoria & Produção</span>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gold-dim border border-gold-glow flex items-center justify-center">
                        <User size={18} className="text-gold" />
                     </div>
                     <span className="font-fd text-white">{event.producerName}</span>
                  </div>
               </div>
            )}
          </aside>
        </div>
      </div>

      <div className="event-footer-premium">
        <motion.div 
           className="event-footer-bar"
           initial={{ y: 100 }}
           animate={{ y: 0 }}
        >
          <div className="flex flex-col">
            <span className="font-fm text-[10px] uppercase text-gold">Ingressos a partir de</span>
            <span className="event-footer-price">
              {tickets.length > 0 ? (Math.min(...tickets.map(t => Number(t.price))) === 0 ? 'Grátis' : `R$ ${Math.min(...tickets.map(t => Number(t.price)))}`) : '---'}
            </span>
          </div>

          {attendance ? (
            <div className="bg-gold-dim border border-gold-glow px-10 py-4 rounded-full font-fm text-[12px] uppercase text-gold">
               Presença Confirmada
            </div>
          ) : (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="gallery-cta !w-auto !px-12"
            >
              Garantir Acesso
            </button>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="modal-backdrop-premium bg-bg/95 backdrop-blur-xl">
            <motion.div 
              className="bg-surface border border-gold-glow p-10 rounded-[40px] max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                 onClick={() => { setIsCheckoutOpen(false); setPaymentData(null); }} 
                 className="absolute top-8 right-8 text-muted hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-fd text-gold-hi mb-2">Reserva de Entrada</h2>
              <p className="text-muted text-sm font-fb mb-10">Escolha sua modalidade de participação neste evento cultural.</p>

              {paymentData ? (
                <div className="space-y-8 text-center">
                  <div className="p-8 bg-white rounded-[40px] inline-block shadow-2xl">
                    <img src={`data:image/png;base64,${paymentData.pixQrCode}`} alt="QR Code" className="w-48 h-48" />
                  </div>
                  
                  <div className="space-y-4">
                     <p className="font-fd text-white text-xl">Confirmação via PIX</p>
                     <p className="text-muted text-sm">Copie o código abaixo para finalizar a transação no seu banco.</p>
                     
                     <div className="flex gap-2 bg-bg2 p-4 rounded-2xl border border-border">
                        <input readOnly value={paymentData.pixPayload || ''} className="bg-transparent border-none text-[10px] text-muted outline-none flex-1 font-mono" />
                        <button 
                           onClick={() => navigator.clipboard.writeText(paymentData.pixPayload || '')}
                           className="text-gold font-fm text-[10px] uppercase"
                        >
                           Copiar
                        </button>
                     </div>
                  </div>
                  
                  <button onClick={() => { setIsCheckoutOpen(false); setPaymentData(null); }} className="gallery-cta w-full">Finalizar</button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    {tickets.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`event-ticket-card-premium ${selectedTicketId === t.id ? 'selected' : ''}`}
                      >
                        <div className="flex flex-col">
                           <span className="font-fd text-white text-xl">{t.name}</span>
                           <span className="text-muted text-xs uppercase tracking-widest">{t.quantity - t.sold} disponíveis</span>
                        </div>
                        <span className="font-fd text-2xl text-gold-hi">
                           {Number(t.price) === 0 ? "FREE" : `R$ ${t.price}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {event.customFormSchema && event.customFormSchema.length > 0 && (
                    <div className="space-y-6 pt-6 border-t border-border">
                      <span className="sidebar-label-premium">Dados Necessários</span>
                      {event.customFormSchema.map((field, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                           <label className="text-xs font-fm uppercase text-muted">{field.label}</label>
                           {field.type === 'textarea' ? (
                             <textarea 
                                className="bg-bg2 border border-border rounded-xl p-4 text-white font-fb focus:border-gold outline-none" 
                                rows={3} 
                                onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                             />
                           ) : (
                             <input 
                                className="bg-bg2 border border-border rounded-xl p-4 text-white font-fb focus:border-gold outline-none" 
                                type="text" 
                                onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                             />
                           )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    className="gallery-cta w-full !h-16"
                    onClick={handleRegister}
                    disabled={submitting}
                  >
                    {submitting ? "Processando..." : "Confirmar Inscrição"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
