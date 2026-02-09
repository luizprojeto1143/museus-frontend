import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
  Calendar, MapPin, Ticket, User,
  ChevronRight, ChevronLeft, Check, Plus, Trash2, Globe, Video, Save
} from 'lucide-react';
import { useTranslation } from "react-i18next";

// Types
interface TicketData {
  id?: string;
  name: string;
  type: 'FREE' | 'PAID';
  price: number;
  quantity: number;
  absorbFee: boolean;
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

  const steps = [
    { id: 1, label: t("admin.eventForm.steps.basic"), icon: <Calendar className="w-5 h-5" /> },
    { id: 2, label: t("admin.eventForm.steps.whenWhere"), icon: <MapPin className="w-5 h-5" /> },
    { id: 3, label: t("admin.eventForm.steps.tickets"), icon: <Ticket className="w-5 h-5" /> },
    { id: 4, label: t("admin.eventForm.steps.promotion"), icon: <User className="w-5 h-5" /> }
  ];


  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    coverImageUrl: "",

    // Format
    format: "PRESENTIAL", // PRESENTIAL, ONLINE
    startDate: "",
    endDate: "",

    // Presential
    location: "",
    zipCode: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",

    // Online
    platform: "ZOOM",
    meetingLink: "",

    // Producer
    producerName: "",
    producerDescription: "",
    producerLogoUrl: "",

    // Certificate
    certificateBackgroundUrl: "",
    minMinutesForCertificate: "",
    certificateRequiresSurvey: false,

    // Visibility
    visibility: "PUBLIC", // PUBLIC, PRIVATE

    // Audio Guide
    audioUrl: "",
    videoUrl: ""
  });

  const [tickets, setTickets] = useState<TicketData[]>([]);

  // Load Data
  useEffect(() => {
    if (tenantId) {
      // Fetch Categories
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
            complement: data.complement || "",
            neighborhood: data.neighborhood || "",
            city: data.city || "",
            state: data.state || "",
            platform: data.platform || "ZOOM",
            meetingLink: data.meetingLink || "",
            producerName: data.producerName || "",
            producerDescription: data.producerDescription || "",
            producerLogoUrl: data.producerLogoUrl || "",
            certificateBackgroundUrl: data.certificateBackgroundUrl || "",
            minMinutesForCertificate: data.minMinutesForCertificate || "",
            certificateRequiresSurvey: data.certificateRequiresSurvey || false,
            visibility: data.visibility || "PUBLIC",
            audioUrl: data.audioUrl || "",
            videoUrl: data.videoUrl || ""
          });

          // Fetch tickets
          try {
            const ticketRes = await api.get(`/events/${id}/tickets`);
            setTickets(ticketRes.data);
          } catch (e) {
            console.error("Error fetching tickets", e);
          }
        })
        .catch(err => {
          console.error(err);
          addToast("Erro ao carregar evento", "error");
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
    if (!tenantId) {
      addToast("Erro de autenticação", "error");
      return;
    }
    setSaving(true);

    try {
      // 1. Save Event
      const payload = {
        ...formData,
        tenantId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        isOnline: formData.format === 'ONLINE',
        minMinutesForCertificate: formData.minMinutesForCertificate ? Number(formData.minMinutesForCertificate) : null,
        certificateRequiresSurvey: formData.certificateRequiresSurvey
      };

      let eventId = id;

      if (id) {
        await api.put(`/events/${id}`, payload);
      } else {
        const res = await api.post("/events", payload);
        eventId = res.data.id;
      }

      // 2. Save Tickets (Create only for now, simple logic)
      if (eventId) {
        for (const t of tickets) {
          if (!t.id) { // New ticket
            await api.post(`/events/${eventId}/tickets`, t);
          } else {
            // Optional: Update ticket if modified
          }
        }
      }

      addToast(isEdit ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!", "success");
      navigate("/admin/eventos");
    } catch (error) {
      console.error("Error saving event", error);
      addToast("Erro ao salvar evento. Verifique os dados.", "error");
    } finally {
      setSaving(false);
    }
  };



  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">{t("admin.eventForm.steps.basic")}</h2>

            <Input
              label={t("admin.eventForm.labels.title") + " *"}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Workshop de Fotografia"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t("admin.eventForm.labels.category")}
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-1">{t("admin.eventForm.labels.format")}</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.format === 'PRESENTIAL' ? 'primary' : 'outline'}
                    onClick={() => setFormData({ ...formData, format: 'PRESENTIAL' })}
                    leftIcon={<MapPin className="w-4 h-4" />}
                    className="flex-1 justify-center"
                  >
                    {t("admin.eventForm.formats.presential")}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.format === 'ONLINE' ? 'primary' : 'outline'}
                    onClick={() => setFormData({ ...formData, format: 'ONLINE' })}
                    leftIcon={<Video className="w-4 h-4" />}
                    className="flex-1 justify-center"
                  >
                    {t("admin.eventForm.formats.online")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-1">{t("admin.eventForm.labels.coverImage")}</label>
              <div className="flex gap-2">
                <Input
                  containerClassName="flex-1 mb-0"
                  value={formData.coverImageUrl}
                  onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                />
                <div className="w-20 h-[42px] bg-gray-800 rounded overflow-hidden border border-gray-700">
                  {formData.coverImageUrl && <img src={formData.coverImageUrl} alt="Capa" className="w-full h-full object-cover" />}
                </div>
              </div>
            </div>

            <Textarea
              label={t("admin.eventForm.labels.description")}
              rows={5}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes do evento..."
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">{t("admin.eventForm.steps.whenWhere")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("admin.eventForm.labels.startDate") + " *"}
                type="datetime-local"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label={t("admin.eventForm.labels.endDate")}
                type="datetime-local"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <hr className="my-6 border-gray-700" />

            {formData.format === 'PRESENTIAL' ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Local do Evento</h3>
                <Input
                  label="Nome do Local (Ex: Teatro Municipal)"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      label="CEP"
                      value={formData.zipCode}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, zipCode: v });
                        if (v.length === 8) refreshGeocoding(v);
                      }}
                      placeholder="00000-000"
                      maxLength={8}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Cidade"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      label="Estado"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <Input
                      label="Endereço"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      label="Número"
                      value={formData.number}
                      onChange={e => setFormData({ ...formData, number: e.target.value })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Transmissão Online</h3>
                <Select
                  label="Plataforma"
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="ZOOM">Zoom</option>
                  <option value="MEET">Google Meet</option>
                  <option value="YOUTUBE">YouTube Live</option>
                  <option value="OTHER">Outra</option>
                </Select>
                <Input
                  label="Link da Transmissão"
                  value={formData.meetingLink}
                  onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://..."
                />
              </>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{t("admin.eventForm.tickets.title")}</h2>
              <Button
                type="button"
                variant="outline"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setTickets([...tickets, { name: 'Novo Ingresso', type: 'FREE', price: 0, quantity: 100, absorbFee: false }])}
              >
                {t("admin.eventForm.tickets.create")}
              </Button>
            </div>

            {tickets.length === 0 && (
              <div className="text-center py-10 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">{t("admin.eventForm.tickets.empty")}</p>
              </div>
            )}

            <div className="space-y-4">
              {tickets.map((ticket, idx) => (
                <div key={idx} className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-200">{t("admin.eventForm.tickets.itemTitle")} #{idx + 1}</h4>
                    <button className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors" onClick={() => {
                      const n = [...tickets]; n.splice(idx, 1); setTickets(n);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t("admin.eventForm.tickets.name")}
                      value={ticket.name}
                      onChange={e => {
                        const n = [...tickets]; n[idx].name = e.target.value; setTickets(n);
                      }}
                      containerClassName="mb-0"
                    />
                    <Input
                      label={t("admin.eventForm.tickets.quantity")}
                      type="number"
                      value={ticket.quantity}
                      onChange={e => {
                        const n = [...tickets]; n[idx].quantity = Number(e.target.value); setTickets(n);
                      }}
                      containerClassName="mb-0"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label={t("admin.eventForm.tickets.type")}
                      value={ticket.type}
                      onChange={e => {
                        const n = [...tickets]; n[idx].type = e.target.value as 'FREE' | 'PAID'; setTickets(n);
                      }}
                      containerClassName="mb-0"
                    >
                      <option value="FREE">{t("admin.eventForm.tickets.free")}</option>
                      <option value="PAID">{t("admin.eventForm.tickets.paid")}</option>
                    </Select>
                    {ticket.type === 'PAID' && (
                      <Input
                        label={t("admin.eventForm.tickets.price") + " (R$)"}
                        type="number"
                        step="0.01"
                        value={ticket.price}
                        onChange={e => {
                          const n = [...tickets]; n[idx].price = Number(e.target.value); setTickets(n);
                        }}
                        containerClassName="mb-0"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">{t("admin.eventForm.steps.promotion")}</h2>

            <Input
              label={t("admin.eventForm.labels.producerName")}
              value={formData.producerName}
              onChange={e => setFormData({ ...formData, producerName: e.target.value })}
              placeholder="Ex: Rede Juventude NC"
            />

            <Textarea
              label={t("admin.eventForm.labels.producerDescription")}
              rows={4}
              value={formData.producerDescription}
              onChange={e => setFormData({ ...formData, producerDescription: e.target.value })}
              placeholder="Conte um pouco sobre quem está organizando..."
            />

            <hr className="my-6 border-gray-700" />

            <h3 className="text-lg font-semibold mb-2">Certificado</h3>
            <div className="space-y-4 mb-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-1">{t("admin.eventForm.labels.certificateBg")}</label>
                <Input
                  value={formData.certificateBackgroundUrl}
                  onChange={e => setFormData({ ...formData, certificateBackgroundUrl: e.target.value })}
                  placeholder="https://..."
                  containerClassName="mb-1"
                />
                <p className="text-xs text-gray-500">Deixe em branco para usar o padrão do sistema.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label={t("admin.eventForm.labels.minMinutes")}
                    type="number"
                    value={formData.minMinutesForCertificate}
                    onChange={e => setFormData({ ...formData, minMinutesForCertificate: e.target.value })}
                    placeholder="Ex: 60"
                  />
                </div>
                <div className="flex-1 flex items-end pb-7">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-gold rounded focus:ring-gold bg-gray-800 border-gray-600"
                      checked={formData.certificateRequiresSurvey}
                      onChange={e => setFormData({ ...formData, certificateRequiresSurvey: e.target.checked })}
                    />
                    <span className="text-gray-300">{t("admin.eventForm.labels.surveyRequired")}</span>
                  </label>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-700" />

            <h3 className="text-lg font-semibold mb-2">{t("admin.eventForm.labels.visibility")}</h3>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 cursor-pointer border p-4 rounded-lg flex-1 hover:bg-gray-800 transition-colors ${formData.visibility !== "PRIVATE" ? 'border-gold bg-gold/10' : 'border-gray-700'}`}>
                <input type="radio" className="hidden" name="visibility" checked={formData.visibility !== "PRIVATE"} onChange={() => setFormData({ ...formData, visibility: "PUBLIC" })} />
                <div>
                  <div className="font-bold flex items-center gap-2"><Globe className="w-4 h-4" /> {t("admin.eventForm.visibility.public")}</div>
                  <div className="text-sm text-gray-400">{t("admin.eventForm.visibility.publicDesc")}</div>
                </div>
              </label>
              <label className={`flex items-center gap-2 cursor-pointer border p-4 rounded-lg flex-1 hover:bg-gray-800 transition-colors ${formData.visibility === "PRIVATE" ? 'border-gold bg-gold/10' : 'border-gray-700'}`}>
                <input type="radio" className="hidden" name="visibility" checked={formData.visibility === "PRIVATE"} onChange={() => setFormData({ ...formData, visibility: "PRIVATE" })} />
                <div>
                  <div className="font-bold flex items-center gap-2"><Check className="w-4 h-4" /> {t("admin.eventForm.visibility.private")}</div>
                  <div className="text-sm text-gray-400">{t("admin.eventForm.visibility.privateDesc")}</div>
                </div>
              </label>
            </div>

            <hr className="my-6 border-gray-700" />

            <h3 className="text-lg font-semibold mb-2">🎧 Áudio-Guia do Evento</h3>
            <div className="space-y-4 mb-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-1">{t("admin.eventForm.labels.audioUrl")} (MP3)</label>
                <Input
                  value={formData.audioUrl}
                  onChange={e => setFormData({ ...formData, audioUrl: e.target.value })}
                  placeholder="https://exemplo.com/audio-evento.mp3"
                  containerClassName="mb-1"
                />
                <p className="text-xs text-gray-500">Áudio que os visitantes poderão ouvir sobre o evento.</p>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-1">{t("admin.eventForm.labels.videoUrl")}</label>
                <Input
                  value={formData.videoUrl}
                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  containerClassName="mb-1"
                />
                <p className="text-xs text-gray-500">Vídeo de divulgação do evento.</p>
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-900 -m-6">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-8">
            {isEdit ? "Editar Evento" : "Novo Evento"}
          </h1>
          <div className="space-y-2">
            {steps.map(s => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all
                                ${step === s.id
                    ? "bg-gold text-black font-bold shadow-sm"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                {s.icon}
                {s.label}
                {step > s.id && <Check className="w-4 h-4 ml-auto text-green-500" />}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-center text-gray-500">
          Passo {step} de 4
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8 min-h-[500px]">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-20 bg-gray-800 border-t border-gray-700 px-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className={`flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
            onClick={() => setStep(s => Math.max(1, s - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate("/admin/eventos")}>
              Cancelar
            </Button>
            {step < 4 ? (
              <Button
                rightIcon={<ChevronRight className="w-4 h-4" />}
                onClick={() => setStep(s => Math.min(4, s + 1))}
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={saving || loading}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-green-600 hover:bg-green-700 text-white border-none"
              >
                {isEdit ? "Salvar Alterações" : "Publicar Evento"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
