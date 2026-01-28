import React, { useState } from "react";
import React, { Component } from "react";
import { withTranslation, WithTranslationProps } from "react-i18next";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { AuthContextType, withAuth } from "../../auth/AuthContext"; // Assuming withAuth HOC
import { api } from "../../../api/client";
import { Ticket, Award, LogOut, ChevronRight, User, Star, Map } from 'lucide-react';
import { TicketCard } from "../components/TicketCard";
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

// Define props for the class component, including those from HOCs
interface VisitorProfileProps extends WithTranslationProps {
    navigate: NavigateFunction;
    auth: AuthContextType; // Assuming auth context is passed via HOC
}

interface VisitorProfileState {
    activeTab: 'info' | 'tickets' | 'certificates';
    certificates: Certificate[];
    registrations: Registration[];
    loading: boolean;
}

class VisitorProfileClass extends Component<VisitorProfileProps, VisitorProfileState> {
    constructor(props: VisitorProfileProps) {
        super(props);
        this.state = {
            activeTab: 'info',
            certificates: [],
            registrations: [],
            loading: false,
        };
    }

    handleTabChange = (tab: 'info' | 'tickets' | 'certificates') => {
        this.setState({ activeTab: tab });

        if (tab === 'certificates' && this.state.certificates.length === 0) {
            this.setState({ loading: true });
            api.get('/certificates/mine')
                .then(res => this.setState({ certificates: res.data }))
                .catch(console.error)
                .finally(() => this.setState({ loading: false }));
        }

        if (tab === 'tickets' && this.state.registrations.length === 0) {
            this.setState({ loading: true });
            api.get('/registrations/my-registrations')
                .then(res => this.setState({ registrations: res.data }))
                .catch(async () => {
                    this.setState({ registrations: [] });
                })
                .finally(() => this.setState({ loading: false }));
        }
    };

    renderContent = () => {
        const { activeTab, loading, certificates, registrations } = this.state;
        const { t, navigate, auth } = this.props;
        const { name } = auth;

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
                            <button onClick={auth.logout} className="logout-btn">
                                <div className="logout-content">
                                    <div className="logout-icon">
                                        <LogOut size={20} />
                                    </div>
                                    <div className="logout-text">
                                        <h4>Sair da Conta</h4>
                                        <span>Encerrar sessão neste dispositivo</span>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="#ef4444" opacity={0.5} />
                            </button>
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
                                <button className="empty-btn" onClick={() => navigate('/eventos')}>
                                    Ver Eventos
                                </button>
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
                                        <button
                                            className="btn-gold-text"
                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '') || ''}/certificates/${cert.id}/pdf`, '_blank')}
                                        >
                                            Baixar PDF
                                        </button>
                                        <button
                                            className="btn-outline-gold"
                                            onClick={() => navigate(`/verify/${cert.code}`)}
                                        >
                                            Validar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
        }
    };

        </div>
    );
};
