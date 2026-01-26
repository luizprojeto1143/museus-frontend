import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, Ticket, User,
  ChevronRight, ChevronLeft, Check, Plus, Trash2, Globe, Video
} from 'lucide-react';

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
  // const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

    // Visibility
    visibility: "PUBLIC" // PUBLIC, PRIVATE
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
            visibility: data.visibility || "PUBLIC"
          });

          // Fetch tickets
          try {
            const ticketRes = await api.get(`/events/${id}/tickets`);
            setTickets(ticketRes.data);
          } catch (e) {
            console.error("Error fetching tickets", e);
          }
        })
        .catch(console.error)
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
    setLoading(true);

    try {
      // 1. Save Event
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

      navigate("/admin/eventos");
    } catch (error) {
      console.error("Error saving event", error);
      alert("Erro ao salvar evento. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: "Informações Básicas", icon: <Calendar className="w-5 h-5" /> },
    { id: 2, label: "Quando e Onde", icon: <MapPin className="w-5 h-5" /> },
    { id: 3, label: "Ingressos", icon: <Ticket className="w-5 h-5" /> },
    { id: 4, label: "Divulgação", icon: <User className="w-5 h-5" /> }
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Informações Básicas</h2>

            <div className="form-group">
              <label>Nome do Evento *</label>
              <input
                className="input w-full text-lg font-medium"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Workshop de Fotografia"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Assunto / Categoria</label>
                <select
                  className="input w-full"
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Formato</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 btn ${formData.format === 'PRESENTIAL' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setFormData({ ...formData, format: 'PRESENTIAL' })}
                  >
                    <MapPin className="w-4 h-4 mr-2" /> Presencial
                  </button>
                  <button
                    className={`flex-1 btn ${formData.format === 'ONLINE' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setFormData({ ...formData, format: 'ONLINE' })}
                  >
                    <Video className="w-4 h-4 mr-2" /> Online
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Imagem de Capa (URL)</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  value={formData.coverImageUrl}
                  onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                />
                <div className="w-20 h-10 bg-gray-100 rounded overflow-hidden border">
                  {formData.coverImageUrl && <img src={formData.coverImageUrl} className="w-full h-full object-cover" />}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                className="input w-full"
                rows={5}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes do evento..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Quando e Onde?</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Data de Início *</label>
                <input type="datetime-local" className="input w-full" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Data de Término</label>
                <input type="datetime-local" className="input w-full" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {formData.format === 'PRESENTIAL' ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Local do Evento</h3>
                <div className="form-group">
                  <label>Nome do Local (Ex: Teatro Municipal)</label>
                  <input className="input w-full" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="form-group col-span-1">
                    <label>CEP</label>
                    <input
                      className="input w-full"
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
                  <div className="form-group col-span-2">
                    <label>Cidade</label>
                    <input className="input w-full" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div className="form-group col-span-1">
                    <label>Estado</label>
                    <input className="input w-full" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="form-group col-span-3">
                    <label>Endereço</label>
                    <input className="input w-full" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <div className="form-group col-span-1">
                    <label>Número</label>
                    <input className="input w-full" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Transmissão Online</h3>
                <div className="form-group">
                  <label>Plataforma</label>
                  <select className="input w-full" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })}>
                    <option value="ZOOM">Zoom</option>
                    <option value="MEET">Google Meet</option>
                    <option value="YOUTUBE">YouTube Live</option>
                    <option value="OTHER">Outra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Link da Transmissão</label>
                  <input className="input w-full" value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://..." />
                </div>
              </>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Ingressos</h2>
              <button
                className="btn flex items-center gap-2"
                onClick={() => setTickets([...tickets, { name: 'Novo Ingresso', type: 'FREE', price: 0, quantity: 100, absorbFee: false }])}
              >
                <Plus className="w-4 h-4" /> Criar Ingresso
              </button>
            </div>

            {tickets.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Nenhum ingresso criado ainda.</p>
              </div>
            )}

            <div className="space-y-4">
              {tickets.map((t, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-700">Ingresso #{idx + 1}</h4>
                    <button className="text-red-500 hover:bg-red-50 p-1 rounded" onClick={() => {
                      const n = [...tickets]; n.splice(idx, 1); setTickets(n);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label>Nome</label>
                      <input className="input w-full" value={t.name} onChange={e => {
                        const n = [...tickets]; n[idx].name = e.target.value; setTickets(n);
                      }} />
                    </div>
                    <div className="form-group">
                      <label>Quantidade</label>
                      <input type="number" className="input w-full" value={t.quantity} onChange={e => {
                        const n = [...tickets]; n[idx].quantity = Number(e.target.value); setTickets(n);
                      }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label>Tipo</label>
                      <select className="input w-full" value={t.type} onChange={e => {
                        const n = [...tickets]; n[idx].type = e.target.value as 'FREE' | 'PAID'; setTickets(n);
                      }}>
                        <option value="FREE">Gratuito</option>
                        <option value="PAID">Pago</option>
                      </select>
                    </div>
                    {t.type === 'PAID' && (
                      <div className="form-group">
                        <label>Preço (R$)</label>
                        <input type="number" step="0.01" className="input w-full" value={t.price} onChange={e => {
                          const n = [...tickets]; n[idx].price = Number(e.target.value); setTickets(n);
                        }} />
                      </div>
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
            <h2 className="text-2xl font-bold mb-4">Produtor & Divulgação</h2>

            <div className="form-group">
              <label>Nome do Produtor / Organizador</label>
              <input
                className="input w-full"
                value={formData.producerName}
                onChange={e => setFormData({ ...formData, producerName: e.target.value })}
                placeholder="Ex: Rede Juventude NC"
              />
            </div>
            <div className="form-group">
              <label>Descrição do Produtor</label>
              <textarea
                className="input w-full"
                rows={4}
                value={formData.producerDescription}
                onChange={e => setFormData({ ...formData, producerDescription: e.target.value })}
                placeholder="Conte um pouco sobre quem está organizando..."
              />
            </div>

            <hr className="my-6 border-gray-200" />

            <h3 className="text-lg font-semibold mb-2">Visibilidade</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer border p-4 rounded-lg flex-1 hover:bg-gray-50">
                <input type="radio" name="visibility" checked={formData.visibility !== "PRIVATE"} onChange={() => setFormData({ ...formData, visibility: "PUBLIC" })} />
                <div>
                  <div className="font-bold flex items-center gap-1"><Globe className="w-4 h-4" /> Público</div>
                  <div className="text-sm text-gray-500">Visível para todos na busca</div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer border p-4 rounded-lg flex-1 hover:bg-gray-50">
                <input type="radio" name="visibility" checked={formData.visibility === "PRIVATE"} onChange={() => setFormData({ ...formData, visibility: "PRIVATE" })} />
                <div>
                  <div className="font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Privado</div>
                  <div className="text-sm text-gray-500">Apenas quem tem o link</div>
                </div>
              </label>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 -m-6">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-8">
            {isEdit ? "Editar Evento" : "Novo Evento"}
          </h1>
          <div className="space-y-2">
            {steps.map(s => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all
                                ${step === s.id
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {s.icon}
                {s.label}
                {step > s.id && <Check className="w-4 h-4 ml-auto text-green-500" />}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-center text-gray-400">
          Passo {step} de 4
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-20 bg-white border-t border-gray-200 px-8 flex items-center justify-between">
          <button
            className={`btn btn-secondary flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
            onClick={() => setStep(s => Math.max(1, s - 1))}
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex gap-2">
            <button className="btn btn-ghost text-gray-500" onClick={() => navigate("/admin/eventos")}>
              Cancelar
            </button>
            {step < 4 ? (
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setStep(s => Math.min(4, s + 1))}
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                className="btn btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Publicar Evento"} <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
