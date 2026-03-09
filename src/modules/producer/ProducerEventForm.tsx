import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { Save, ArrowLeft, Calendar, MapPin, Image as ImageIcon, AlignLeft, Tag, Clock, Globe, Info } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { Button, Input, Textarea, Select } from "../../components/ui";

export const ProducerEventForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        coverUrl: "",
        location: "",
        visibility: "PUBLIC",
        status: "DRAFT"
    });

    useEffect(() => {
        api.get("/categories", { params: { tenantId } })
            .then(res => setCategories(res.data))
            .catch(err => console.error("Error fetching categories", err));

        if (id) {
            setLoading(true);
            api.get(`/events/${id}`)
                .then(res => {
                    const ev = res.data;
                    setFormData({
                        title: ev.title,
                        description: ev.description || "",
                        categoryId: ev.categoryId || "",
                        startDate: ev.startDate ? ev.startDate.split('T')[0] : "",
                        startTime: ev.startDate ? new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                        endDate: ev.endDate ? ev.endDate.split('T')[0] : "",
                        endTime: ev.endDate ? new Date(ev.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                        coverUrl: ev.coverUrl || "",
                        location: ev.location || "",
                        visibility: ev.visibility || "PUBLIC",
                        status: ev.status || "DRAFT"
                    });
                })
                .catch(err => {
                    console.error(err);
                    addToast("Erro ao carregar evento", "error");
                })
                .finally(() => setLoading(false));
        }
    }, [id, tenantId, addToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const startDateTime = new Date(`${formData.startDate}T${formData.startTime || "00:00"} `);
        const endDateTime = formData.endDate ? new Date(`${formData.endDate}T${formData.endTime || "23:59"} `) : null;

        const payload = {
            ...formData,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime?.toISOString(),
            tenantId
        };

        try {
            if (id) {
                await api.put(`/events/${id}`, payload);
            } else {
                await api.post("/events", payload);
            }
            addToast("Evento salvo com sucesso!", "success");
            navigate("/producer/events");
        } catch (error) {
            console.error("Error saving event", error);
            addToast("Erro ao salvar evento. Verifique os dados.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#1a1108]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1108] text-[#EAE0D5] p-6 md:p-12 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/producer/events")}
                        className="w-10 h-10 p-0 rounded-full bg-[#2c1e10] hover:bg-[#D4AF37]/10 text-[#B0A090] border border-[#463420]"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#D4AF37] font-serif">
                            {id ? "Editar Evento" : "Novo Evento"}
                        </h1>
                        <p className="text-[#B0A090]">{t("producer.producerevent.preenchaAsInformaesParaDivulgarNaAgendaC", `Preencha as informações para divulgar na agenda cultural.`)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#2c1e10] rounded-2xl p-8 border border-[#463420] shadow-lg shadow-black/20 space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[#D4AF37] font-bold border-b border-[#463420] pb-2">
                            <Info size={18} /> Informações Básicas
                        </div>

                        <Input
                            label={t("producer.producerevent.ttuloDoEvento", `Título do Evento`)}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Festival de Jazz 2024"
                            leftIcon={<AlignLeft size={18} className="text-[#D4AF37]" />}
                            className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] h-12 text-lg font-bold"
                        />

                        <Textarea
                            label={t("producer.producerevent.descrio", `Descrição`)}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            placeholder={t("producer.producerevent.descrevaOEventoAtraesEDetalhesImportante", `Descreva o evento, atrações e detalhes importantes...`)}
                            className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37]"
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#B0A090] flex items-center gap-2">
                                <Tag size={16} className="text-[#D4AF37]" /> Categoria
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-[#463420] rounded-xl px-4 py-3 text-[#EAE0D5] focus:border-[#D4AF37] outline-none transition-colors appearance-none"
                            >
                                <option value="" className="bg-[#2c1e10]">Selecione uma categoria (Opcional)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-[#2c1e10]">{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* DateTime */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[#D4AF37] font-bold border-b border-[#463420] pb-2">
                            <Calendar size={18} /> Data e Hora
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Input
                                    label={t("producer.producerevent.dataIncio", `Data Início`)}
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] [color-scheme:dark]"
                                />
                                <Input
                                    label={t("producer.producerevent.horrioIncio", `Horário Início`)}
                                    name="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] [color-scheme:dark]"
                                    leftIcon={<Clock size={18} className="text-[#D4AF37]" />}
                                />
                            </div>
                            <div className="space-y-4">
                                <Input
                                    label="Data Fim (Opcional)"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] [color-scheme:dark]"
                                />
                                <Input
                                    label={t("producer.producerevent.horrioFim", `Horário Fim`)}
                                    name="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] [color-scheme:dark]"
                                    leftIcon={<Clock size={18} className="text-[#D4AF37]" />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & Media */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[#D4AF37] font-bold border-b border-[#463420] pb-2">
                            <MapPin size={18} /> Localização e Mídia
                        </div>

                        <Input
                            label={t("producer.producerevent.localizao", `Localização`)}
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Ex: Teatro Municipal - Sala 2"
                            leftIcon={<MapPin size={18} className="text-[#D4AF37]" />}
                            className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37]"
                        />

                        <Input
                            label="URL da Imagem de Capa"
                            name="coverUrl"
                            value={formData.coverUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                            leftIcon={<ImageIcon size={18} className="text-[#D4AF37]" />}
                            className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37]"
                        />
                        {formData.coverUrl && (
                            <div className="h-48 w-full rounded-xl overflow-hidden border border-[#463420]">
                                <img src={formData.coverUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div className="bg-black/20 p-6 rounded-xl border border-[#463420]">
                        <label className="block text-sm font-medium text-[#B0A090] mb-4">Status do Evento</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: "DRAFT" }))}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all border ${formData.status === "DRAFT"
                                        ? "bg-[#B0A090]/10 border-[#B0A090] text-[#EAE0D5]"
                                        : "bg-transparent border-[#463420] text-[#B0A090] hover:bg-white/5"
                                    }`}
                            >
                                Rascunho
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: "PUBLISHED" }))}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all border ${formData.status === "PUBLISHED"
                                        ? "bg-[#4cd964]/10 border-[#4cd964] text-[#4cd964]"
                                        : "bg-transparent border-[#463420] text-[#B0A090] hover:bg-white/5"
                                    }`}
                            >
                                Publicado
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#463420]">
                        <Button
                            type="submit"
                            isLoading={saving}
                            leftIcon={<Save size={20} />}
                            className="bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] px-8 py-6 font-bold text-lg shadow-lg shadow-[#D4AF37]/20 border-none rounded-xl w-full md:w-auto"
                        >
                            Salvar Evento
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
};
