import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import { ArrowLeft, Save, Calendar, Clock, MapPin, Users, Info } from "lucide-react";
import "./AdminShared.css";

interface InPersonService {
    id: string;
    name: string;
    description: string | null;
}

interface Space {
    id: string;
    name: string;
}

interface Event {
    id: string;
    title: string;
}

export const AdminBookingForm: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [services, setServices] = useState<InPersonService[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    const [formData, setFormData] = useState({
        inPersonServiceId: "",
        date: "",
        startTime: "",
        endTime: "",
        participants: "",
        spaceId: "",
        eventId: "",
        purpose: ""
    });

    useEffect(() => {
        if (!tenantId) return;

        const loadFormOptions = async () => {
            setLoading(true);
            try {
                // Since this uses the QS Inclusão master tenant for services in our prototype workflow
                const servicesRes = await api.get(`/in-person-services?tenantId=8cc9b546-7f7d-4908-a6cf-acdd7b86982b`);
                const spacesRes = await api.get(`/spaces?tenantId=${tenantId}`);
                const eventsRes = await api.get(`/events?tenantId=${tenantId}`);

                setServices(servicesRes.data);
                setSpaces(spacesRes.data);
                setEvents(eventsRes.data);
            } catch (err) {
                console.error("Erro ao carregar opções para o formulário:", err);
            } finally {
                setLoading(false);
            }
        };

        loadFormOptions();
    }, [tenantId]);

    const handleSubmit = async () => {
        if (!tenantId) return;
        if (!formData.inPersonServiceId || !formData.date || !formData.startTime || !formData.endTime) {
            return alert("Por favor, preencha os campos obrigatórios (Serviço, {t("admin.bookingForm.dateTimeTab", "Data e Horário")}s).");
        }

        setSaving(true);
        try {
            // Combine date & time
            const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
            const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

            const payload = {
                tenantId,
                date: startDateTime.toISOString(), // Standard Booking request needs date
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                inPersonServiceId: formData.inPersonServiceId,
                participants: formData.participants ? parseInt(formData.participants) : undefined,
                spaceId: formData.spaceId || undefined,
                eventId: formData.eventId || undefined,
                purpose: formData.purpose
            };

            await api.post("/bookings", payload);
            alert("Solicitação de serviço presencial enviada com sucesso!");

            // Navigate back to somewhere, maybe the calendar or dashboard
            navigate("/admin");
        } catch (error: any) {
            console.error("Erro ao solicitar serviço presencial:", error);
            alert(error.response?.data?.message || "Erro ao solicitar serviço presencial.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[var(--bg-root)]">
                <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            {/* Header */}
            <div className="admin-wizard-header">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="p-0 text-[var(--fg-muted)] hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="admin-wizard-title">
                        {t("admin.bookingForm.title", "Solicitar Serviço Presencial")}
                    </h1>
                    <p className="admin-wizard-subtitle">
                        {t("admin.bookingForm.subtitle", "Faça uma solicitação para intérprete de Libras, guias ou outros serviços para o seu equipamento.")}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
                <div className="lg:col-span-2 space-y-8">

                    {/* SERVIÇO */}
                    <div className="admin-section">
                        <h2 className="admin-section-title">
                            <span style={{ color: "#60a5fa" }}>🤝</span> {t("admin.bookingForm.serviceTab", "Serviço Desejado")}
                        </h2>

                        <div className="space-y-4">
                            <Select
                                label="{t("admin.bookingForm.serviceLabel", "Selecione o Serviço Presencial *")}"
                                value={formData.inPersonServiceId}
                                onChange={e => setFormData({ ...formData, inPersonServiceId: e.target.value })}
                            >
                                <option value="">{t("admin.bookingForm.chooseService", "Escolha um serviço...")}</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Select>
                            {services.find(s => s.id === formData.inPersonServiceId)?.description && (
                                <p className="text-sm text-[var(--fg-muted)] p-3 bg-[var(--bg-surface-active)] rounded-md border border-[var(--border-subtle)]">
                                    <Info size={14} className="inline mr-2 text-[var(--accent-gold)]" />
                                    {services.find(s => s.id === formData.inPersonServiceId)?.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* DATA E HORÁRIO */}
                    <div className="admin-section">
                        <h2 className="admin-section-title">
                            <Calendar className="text-[var(--accent-gold)]" size={20} /> {t("admin.bookingForm.dateTimeTab", "Data e Horário")}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="{t("admin.bookingForm.date", "Data *")}"
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                            <Input
                                label="{t("admin.bookingForm.start", "Início *")}"
                                type="time"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                leftIcon={<Clock size={16} />}
                            />
                            <Input
                                label="{t("admin.bookingForm.end", "Término *")}"
                                type="time"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                leftIcon={<Clock size={16} />}
                            />
                        </div>
                    </div>

                    {/* LOCAL E EVENTO */}
                    <div className="admin-section">
                        <h2 className="admin-section-title">
                            <MapPin className="text-[var(--accent-gold)]" size={20} /> Local
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="{t("admin.bookingForm.spaceLabel", "Espaço (Opcional)")}"
                                value={formData.spaceId}
                                onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                            >
                                <option value="">{t("admin.bookingForm.noSpace", "Nenhum espaço reservado")}</option>
                                {spaces.map(sp => (
                                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                                ))}
                            </Select>
                            <Select
                                label="{t("admin.bookingForm.eventLabel", "Evento Vinculado (Opcional)")}"
                                value={formData.eventId}
                                onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                            >
                                <option value="">{t("admin.bookingForm.noEvent", "Nenhum evento específico")}</option>
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* DETALHES ADICIONAIS */}
                    <div className="admin-section">
                        <h2 className="admin-section-title">{t("admin.bookingForm.detailsTab", "Detalhes Adicionais")}</h2>

                        <div className="space-y-6">
                            <Input
                                label="{t("admin.bookingForm.participants", "Quantidade de Participantes")}"
                                type="number"
                                min="1"
                                value={formData.participants}
                                onChange={e => setFormData({ ...formData, participants: e.target.value })}
                                leftIcon={<Users size={16} />}
                                placeholder="Ex: 25"
                            />

                            <Textarea
                                label="{t("admin.bookingForm.observations", "Observações e Necessidades Específicas")}"
                                value={formData.purpose}
                                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                placeholder="{t("admin.bookingForm.observationsPlaceholder", "Forneça detalhes que possam ajudar o prestador de serviço...")}"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="admin-wizard-footer">
                <div className="admin-wizard-footer-inner">
                    <span className="text-xs text-[var(--fg-muted)] font-medium ml-2 hidden sm:block">
                        {t("admin.bookingForm.pendingNotice", "A solicitação ficará pendente até aprovação")}
                    </span>
                    <Button
                        onClick={handleSubmit}
                        isLoading={saving}
                        className="btn-primary"
                        leftIcon={<Save size={18} />{t("admin.bookingform.EnviarSolicitao", "}
                    >
                        Enviar Solicitação")}</Button>
                </div>
            </div>
        </div>
    );
};
