import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { api, isDemoMode } from "../../../api/client";
import {
  MapPin, Calendar, Share2,
  User, CheckCircle, Video, ArrowLeft
} from "lucide-react";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { getFullUrl } from "../../../utils/url";
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
        description: "Aprenda técnicas. Lorem ipsum dolor sit amet...",
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
    if (!selectedTicketId || !id) return;
    setSubmitting(true);
    try {
      await api.post(`/events/${id}/register`, {
        ticketId: selectedTicketId,
        answers
      });
      setIsCheckoutOpen(false);
      fetchEventData();
    } catch (err) {
      console.error("Registration failed", err);
      alert(t("common.error", "Erro ao realizar inscrição"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="event-loading">Carregando detalhes...</div>;
  if (!event) return <div className="event-error">Evento não encontrado</div>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="event-detail-container">
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
      <div className="event-cover">
        <img
          src={event.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
          className="event-cover-image"
          alt={event.title}
        />
        <div className="event-cover-gradient"></div>
        <Link to="/eventos" className="event-back-btn">
          <ArrowLeft size={16} /> Voltar
        </Link>
      </div>

      <div className="event-main-card">
        <div className="event-card-inner">
          {/* Header Info */}
          <div className="event-header">
            <div>
              <span className={`event-type-badge ${event.isOnline ? 'online' : 'presencial'}`}>
                {event.isOnline ? "Evento Online" : "Presencial"}
              </span>
              <h1 className="event-title">{event.title}</h1>
              {event.producerName && (
                <p className="event-producer">
                  Organizado por <strong>{event.producerName}</strong>
                </p>
              )}
            </div>

            <div className="event-date-card">
              <Calendar size={22} />
              <div>
                <p className="event-date-label">Data e Hora</p>
                <p className="event-date-value">{formatDate(event.startDate)}</p>
              </div>
            </div>
          </div>

          <div className="event-content-grid">
            <div className="event-main-content">
              {/* Description */}
              <div>
                <h3 className="event-section-title">Sobre o Evento</h3>
                <div className="event-description">
                  {event.description || "Sem descrição."}
                </div>
              </div>

              {/* AUDIO GUIDE */}
              <NarrativeAudioGuide
                audioUrl={event.audioUrl}
                title={event.title}
              />

              {/* Producer */}
              {event.producerDescription && (
                <div className="event-producer-section">
                  <h3><User size={18} /> Sobre o Produtor</h3>
                  <p>{event.producerDescription}</p>
                </div>
              )}

              {/* Gallery */}
              {event.galleryUrls && event.galleryUrls.length > 0 && (
                <div className="event-gallery">
                  <h3>Galeria</h3>
                  <div className="event-gallery-grid">
                    {event.galleryUrls.map((url, idx) => (
                      <div key={idx} className="event-gallery-item">
                        <img src={url} alt={`Galeria ${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="event-sidebar">
              {/* Location / Map */}
              <div className="event-location-card">
                <h3>
                  {event.isOnline ? <Video size={18} /> : <MapPin size={18} />}
                  {event.isOnline ? "Onde assistir" : "Localização"}
                </h3>

                {event.isOnline ? (
                  <div>
                    <p className="event-location-text"><strong>Plataforma:</strong> {event.platform || "Zoom/Meet"}</p>
                    {attendance ? (
                      <a href={event.meetingLink} target="_blank" className="event-stream-link">
                        Acessar Transmissão
                      </a>
                    ) : (
                      <div className="event-online-notice">
                        Link disponível após inscrição
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="event-location-text">{event.location}</p>
                    {event.address && <p className="event-location-text muted">{event.address}, {event.number}</p>}
                    {event.city && <p className="event-location-text muted">{event.city} - {event.state}</p>}
                    <div className="event-map-placeholder">Mapa Indisponível (Demo)</div>
                  </div>
                )}
              </div>

              {/* Share */}
              <button className="event-share-btn">
                <Share2 size={16} /> Compartilhar Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="event-sticky-footer">
        <div className="event-footer-inner">
          <div className="event-price-info">
            <p className="event-price-label">Ingressos a partir de</p>
            <p className="event-price-value">
              {tickets.length > 0 ? (Math.min(...tickets.map(t => Number(t.price))) === 0 ? 'Grátis' : `R$ ${Math.min(...tickets.map(t => Number(t.price)))}`) : 'Indisponível'}
            </p>
          </div>

          {attendance ? (
            <div className="event-registered-badge">
              <CheckCircle size={18} /> Inscrito
            </div>
          ) : (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="event-cta-btn"
            >
              Garantir Ingressos
            </button>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="event-modal-backdrop">
          <div className="event-modal">
            <div className="event-modal-header">
              <h3>Realizar Inscrição</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="event-modal-close">✕</button>
            </div>

            <div className="event-modal-body">
              {/* Ticket Selection */}
              <div>
                <h4 className="event-modal-section-title">Selecione o Ingresso</h4>
                <div className="event-ticket-list">
                  {tickets.map(t => (
                    <label key={t.id} className={`event-ticket-option ${selectedTicketId === t.id ? 'selected' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="radio"
                          name="ticket"
                          value={t.id}
                          checked={selectedTicketId === t.id}
                          onChange={() => setSelectedTicketId(t.id)}
                        />
                        <div>
                          <p className="event-ticket-name">{t.name}</p>
                          <p className="event-ticket-available">{t.quantity - t.sold} disponíveis</p>
                        </div>
                      </div>
                      <div className="event-ticket-price">
                        {Number(t.price) === 0 ? "Grátis" : `R$ ${Number(t.price)}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Form Questions */}
              {event?.customFormSchema && event.customFormSchema.length > 0 && (
                <div className="event-form-questions">
                  <h4 className="event-modal-section-title">Perguntas do Organizador</h4>
                  {event.customFormSchema.map((field, idx) => (
                    <div key={idx} className="event-form-group">
                      <label className="event-form-label">
                        {field.label} {field.required && <span>*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          className="event-form-textarea"
                          rows={3}
                          value={answers[field.label] || ''}
                          onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          className="event-form-select"
                          value={answers[field.label] || ''}
                          onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                        >
                          <option value="">Selecione...</option>
                          {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="event-form-input"
                          value={answers[field.label] || ''}
                          onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="event-modal-footer">
              <button onClick={() => setIsCheckoutOpen(false)} className="event-modal-cancel">
                Cancelar
              </button>
              <button
                onClick={handleRegister}
                disabled={submitting}
                className="event-modal-confirm"
              >
                {submitting ? "Processando..." : "Confirmar Inscrição"}
                {!submitting && <CheckCircle size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
