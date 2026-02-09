import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { Ticket, Award, LogOut, ChevronRight, User, Star, Map, ExternalLink, CheckCircle } from 'lucide-react';
import { TicketCard } from "../components/TicketCard";
import { Button } from "../../../components/ui";
import "./VisitorProfile.css"; // Import the dedicated CSS

interface Certificate {
    id: string;
    code: string;
    type: string;
    generatedAt: string;
    tenant: { name: string };
    metadata: Record<string, unknown>;
}

interface Registration {
    id: string;
    code: string;
    checkInDate?: string;
    guestName?: string;
    event: {
        id: string;
        title: string;
        startDate: string;
        location?: string;
    };
    ticket: {
        name: string;
        type: string;
    }
}

export const VisitorProfile: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { name, email, logout } = useAuth();

    // Tabs: 'info' | 'tickets' | 'certificates'
    const [activeTab, setActiveTab] = useState<'info' | 'tickets' | 'certificates'>('info');

    // Data
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (tab: 'info' | 'tickets' | 'certificates') => {
        setActiveTab(tab);

        if (tab === 'certificates' && certificates.length === 0) {
            setLoading(true);
            api.get('/certificates/mine')
                .then(res => setCertificates(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }

        if (tab === 'tickets' && registrations.length === 0) {
            setLoading(true);
            api.get('/registrations/my-registrations')
                .then(res => setRegistrations(res.data))
                .catch(async () => {
                    setRegistrations([]);
                })
                .finally(() => setLoading(false));
        }
    };

    const renderContent = () => {
        if (loading) return (
            <div className="empty-state">
                <p>Carregando...</p>
            </div>
        );

        switch (activeTab) {
            case 'info':
                return (
                    <div className="animate-fadeIn">
                        {/* Actions Grid */}
                        <div className="profile-actions-grid">
                            <div
                                className="action-card gold"
                                onClick={() => navigate("/conquistas")}
                            >
                                <Award className="bg-icon" size={80} />
                                <div className="action-icon-box">
                                    <Award size={24} />
                                </div>
                                <span className="action-card-title">{t("visitor.achievements.title", "Conquistas")}</span>
                                <span className="action-card-subtitle">Ver suas medalhas</span>
                            </div>

                            <div
                                className="action-card blue"
                                onClick={() => navigate("/passaporte")}
                            >
                                <Map className="bg-icon" size={80} />
                                <div className="action-icon-box">
                                    <Map size={24} />
                                </div>
                                <span className="action-card-title">{t("visitor.passport.title", "Passaporte")}</span>
                                <span className="action-card-subtitle">Carimbos de visita</span>
                            </div>
                        </div>

                        {/* Logout Section */}
                        <div className="logout-section">
                            <Button
                                variant="destructive"
                                onClick={logout}
                                className="w-full justify-between h-auto py-4 bg-red-500/10 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-red-500"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                        <LogOut size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-base font-bold text-red-500">Sair da Conta</h4>
                                        <span className="text-sm text-red-400/70 block font-normal">Encerrar sessão neste dispositivo</span>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-red-500/50" />
                            </Button>
                        </div>
                    </div>
                );

            case 'tickets':
                return (
                    <div className="animate-fadeIn">
                        {registrations.length === 0 ? (
                            <div className="empty-state">
                                <Ticket size={48} style={{ margin: "0 auto", opacity: 0.5 }} />
                                <p>Você ainda não tem ingressos.</p>
                                <Button
                                    onClick={() => navigate('/eventos')}
                                    className="bg-gold hover:bg-gold/90 text-black font-bold rounded-full px-6"
                                >
                                    Ver Eventos
                                </Button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {registrations.map(reg => {
                                    const eventDate = new Date(reg.event.startDate);
                                    return (
                                        <TicketCard
                                            key={reg.id}
                                            eventTitle={reg.event.title}
                                            code={reg.code}
                                            guestName={reg.guestName || name || "Visitante"}
                                            date={eventDate.toLocaleDateString('pt-BR')}
                                            time={eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            location={reg.event.location}
                                            ticketType={reg.ticket.name}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            case 'certificates':
                return (
                    <div className="animate-fadeIn">
                        {certificates.length === 0 ? (
                            <div className="empty-state">
                                <Star size={48} style={{ margin: "0 auto", opacity: 0.5 }} />
                                <p>Nenhum certificado emitido.</p>
                            </div>
                        ) : (
                            certificates.map(cert => (
                                <div key={cert.id} className="cert-item">
                                    <div className="cert-header">
                                        <div className="cert-icon">
                                            <Award size={20} />
                                        </div>
                                        <span className="cert-badge">CERTIFICADO</span>
                                    </div>

                                    <h4 className="cert-title">
                                        {(cert.metadata?.title as string) || (cert.type === 'EVENT' ? 'Certificado de Evento' : 'Certificado')}
                                    </h4>
                                    <p className="cert-date">
                                        Emitido em {new Date(cert.generatedAt).toLocaleDateString()} por {cert.tenant.name}
                                    </p>

                                    <div className="cert-actions">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '') || ''}/certificates/${cert.id}/pdf`, '_blank')}
                                            className="flex-1 bg-[#463420] text-gold hover:bg-[#5a432a] border-none"
                                            leftIcon={<ExternalLink size={14} />}
                                        >
                                            Baixar PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/verify/${cert.code}`)}
                                            className="flex-1 border-[#463420] text-gold hover:bg-[#463420]/20 hover:text-white"
                                            leftIcon={<CheckCircle size={14} />}
                                        >
                                            Validar
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">{t("visitor.sidebar.profile")}</h1>
                <p className="profile-subtitle">Gerencie sua conta e conquistas</p>
            </div>

            {/* VIP Card */}
            <div className="profile-card-vip">
                <div className="vip-decoration" />

                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                        {name ? (
                            <span>{name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <User />
                        )}
                    </div>
                </div>

                <div className="profile-info">
                    <h2 className="profile-name">{name || "Visitante"}</h2>
                    <p className="profile-email">{email}</p>
                    <div className="vip-badge">
                        <Star size={12} fill="#c9b58c" /> Membro VIP
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                <button
                    onClick={() => handleTabChange('info')}
                    className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                >
                    Informações
                </button>
                <button
                    onClick={() => handleTabChange('tickets')}
                    className={`profile-tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
                >
                    Ingressos
                </button>
                <button
                    onClick={() => handleTabChange('certificates')}
                    className={`profile-tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
                >
                    Certificados
                </button>
            </div>

            {renderContent()}
        </div>
    );
};
