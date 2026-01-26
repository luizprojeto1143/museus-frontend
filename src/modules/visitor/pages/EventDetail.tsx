import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { api, isDemoMode } from "../../../api/client";
import {
  MapPin, Calendar, Share2,
  User, CheckCircle, Video
} from "lucide-react";

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

type EventDetail = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;

  // New Fields
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

  // Sympla Killer Features
  customFormSchema?: FormField[];
  galleryUrls?: string[];

  tenant?: { name: string };
};

export const EventDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<{ attended: boolean; attendance?: unknown } | null>(null);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Demo Fallback
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

        // Parse JSON fields if they come as strings (safe check)
        if (typeof evData.customFormSchema === 'string') {
          try { evData.customFormSchema = JSON.parse(evData.customFormSchema); } catch { evData.customFormSchema = []; }
        }
        if (typeof evData.galleryUrls === 'string') {
          try { evData.galleryUrls = JSON.parse(evData.galleryUrls); } catch { evData.galleryUrls = []; }
        }

        setEvent(evData);
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
      fetchEventData(); // Refresh data
    } catch (err) {
      console.error("Registration failed", err);
      alert(t("common.error", "Erro ao realizar inscrição"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Carregando detalhes...</div>;
  if (!event) return <div className="p-8 text-center">Evento não encontrado</div>;



  const formatDate = (d: string) => new Date(d).toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="pb-24">
      <Helmet>
        <title>{event.title} | Museus</title>
        <meta name="description" content={event.description?.substring(0, 150)} />
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Evento: ${event.title}`} />
        <meta property="og:description" content={event.description?.substring(0, 150)} />
        <meta property="og:image" content={event.coverImageUrl} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      {/* Cover Image Parallax */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gray-900">
        <img
          src={event.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
          className="w-full h-full object-cover opacity-80"
          alt={event.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <Link to="/eventos" className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white backdrop-blur-sm hover:bg-black/50 transition-all">
          ← Voltar
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${event.isOnline ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {event.isOnline ? "Evento Online" : "Presencial"}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
              {event.producerName && (
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  Organizado por <strong className="text-gray-700 dark:text-gray-300">{event.producerName}</strong>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Data e Hora</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{formatDate(event.startDate)}</p>
                </div>
              </div>

              {/* Photo Gallery (Sympla Killer) */}
              {event.galleryUrls && event.galleryUrls.length > 0 && (
                <div className="space-y-4">
                  <h3 className="section-title text-xl">Galeria</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {event.galleryUrls.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
                        <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="section-title text-xl mb-4">Sobre o Evento</h3>
                <div className="whitespace-pre-line text-gray-600 dark:text-gray-300">
                  {event.description || "Sem descrição."}
                </div>
              </div>

              {/* Producer */}
              {event.producerDescription && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" /> Sobre o Produtor
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{event.producerDescription}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Location / Map */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {event.isOnline ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  {event.isOnline ? "Onde assistir" : "Localização"}
                </h3>

                {event.isOnline ? (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2"><strong>Plataforma:</strong> {event.platform || "Zoom/Meet"}</p>
                    {attendance ? (
                      <a href={event.meetingLink} target="_blank" className="btn btn-primary w-full text-center block">
                        Acessar Transmissão
                      </a>
                    ) : (
                      <div className="p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-xs text-center">
                        Link disponível após inscrição
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm space-y-2">
                    <p className="font-medium text-gray-800">{event.location}</p>
                    {event.address && <p className="text-gray-500">{event.address}, {event.number}</p>}
                    {event.city && <p className="text-gray-500">{event.city} - {event.state}</p>}

                    {/* Static Map Placeholder - In real app use Google Maps Embed */}
                    <div className="w-full h-32 bg-gray-200 rounded mt-4 flex items-center justify-center text-gray-400 text-xs">
                      Mapa Indisponível (Demo)
                    </div>
                  </div>
                )}
              </div>

              {/* Share */}
              <button className="w-full py-3 border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors font-medium text-gray-700">
                <Share2 className="w-4 h-4" /> Compartilhar Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile / CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50 md:sticky md:bottom-4 md:mx-auto md:max-w-4xl md:rounded-2xl md:mb-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="hidden md:block">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ingressos a partir de</p>
            <p className="text-xl font-bold text-green-600">
              {tickets.length > 0 ? (Math.min(...tickets.map(t => Number(t.price))) === 0 ? 'Grátis' : `R$ ${Math.min(...tickets.map(t => Number(t.price)))}`) : 'Indisponível'}
            </p>
          </div>

          {attendance ? (
            <div className="flex-1 md:flex-none flex gap-3">
              <div className="flex-1 bg-green-50 text-green-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-200">
                <CheckCircle className="w-5 h-5" /> Inscrito
              </div>
              {/* If event ended, show Download Button logic here */}
            </div>
          ) : (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
            >
              Garantir Ingressos
            </button>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-lg">Realizar Inscrição</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Ticket Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Selecione o Ingresso</label>
                <div className="space-y-2">
                  {tickets.map(t => (
                    <label key={t.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedTicketId === t.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="ticket"
                          value={t.id}
                          checked={selectedTicketId === t.id}
                          onChange={() => setSelectedTicketId(t.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.quantity - t.sold} disponíveis</p>
                        </div>
                      </div>
                      <div className="font-bold text-green-600">
                        {Number(t.price) === 0 ? "Grátis" : `R$ ${Number(t.price)}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Form Questions */}
              {event?.customFormSchema && event.customFormSchema.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">Perguntas do Organizador</h4>
                  {event.customFormSchema.map((field, idx) => (
                    <div key={idx} className="form-group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                          rows={3}
                          value={answers[field.label] || ''}
                          onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                          value={answers[field.label] || ''}
                          onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                        >
                          <option value="">Selecione...</option>
                          {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'text' ? 'text' : 'text'}
                          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                          value={answers[field.label] || ''}
                          onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 rounded text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegister}
                disabled={submitting}
                className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? "Processando..." : "Confirmar Inscrição"}
                {!submitting && <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};
