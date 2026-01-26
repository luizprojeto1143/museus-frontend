import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { Ticket, Award, LogOut, ChevronRight } from 'lucide-react';
import { TicketCard } from "../components/TicketCard";

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
        if (loading) return <div className="p-8 text-center animate-pulse">Carregando...</div>;

        switch (activeTab) {
            case 'info':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                {name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="btn btn-secondary flex flex-col items-center justify-center py-6 gap-2" onClick={() => navigate("/conquistas")}>
                                <Award className="w-8 h-8 text-yellow-500" />
                                <span className="font-semibold">{t("visitor.achievements.title", "Conquistas")}</span>
                            </button>
                            <button className="btn btn-secondary flex flex-col items-center justify-center py-6 gap-2" onClick={() => navigate("/passaporte")}>
                                <div className="w-8 h-8 flex items-center justify-center text-2xl">🛂</div>
                                <span className="font-semibold">{t("visitor.passport.title", "Passaporte")}</span>
                            </button>
                        </div>

                        <button className="btn w-full flex items-center justify-between text-red-500 hover:bg-red-50 mt-4" onClick={logout}>
                            <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> {t("visitor.sidebar.logout")}</span>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                );
            case 'tickets':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {registrations.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">Nenhum ingresso encontrado.</p>
                                <button className="btn btn-link mt-2" onClick={() => navigate('/eventos')}>Ver Eventos</button>
                            </div>
                        ) : (
                            registrations.map(reg => {
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
                            })
                        )}
                    </div>
                );
            case 'certificates':
                return (
                    <div className="space-y-3 animate-fadeIn">
                        {certificates.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">Nenhum certificado ainda.</p>
                            </div>
                        ) : (
                            certificates.map(cert => (
                                <div key={cert.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                        {(cert.metadata?.title as string) || (cert.type === 'EVENT' ? 'Certificado de Evento' : 'Certificado')}
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Emitido em {new Date(cert.generatedAt).toLocaleDateString()} por {cert.tenant.name}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline flex-1"
                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '') || ''}/certificates/${cert.id}/pdf`, '_blank')}
                                        >
                                            PDF
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost flex-1"
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

    return (
        <div className="pb-20">
            <h1 className="page-title mt-4 mb-1">{t("visitor.sidebar.profile")}</h1>
            <p className="page-subtitle mb-6">Sua conta pessoal</p>

            {/* Tabs Header */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                <button
                    onClick={() => handleTabChange('info')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'info' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                >
                    Info
                </button>
                <button
                    onClick={() => handleTabChange('tickets')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tickets' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                >
                    Ingressos
                </button>
                <button
                    onClick={() => handleTabChange('certificates')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'certificates' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                >
                    Certificados
                </button>
            </div>

            {renderContent()}
        </div>
    );
};
