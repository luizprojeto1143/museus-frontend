import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { Ticket, Award, LogOut, ChevronRight, User, Star, Map } from 'lucide-react';
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
        if (loading) return (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-pulse gap-2">
                <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                <p style={{ color: "var(--text-secondary)" }}>Carregando...</p>
            </div>
        );

        switch (activeTab) {
            case 'info':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Stats / Quick Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate("/conquistas")}
                                className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-[1.02]"
                                style={{
                                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(44, 30, 16, 0.4) 100%)",
                                    border: "1px solid rgba(212, 175, 55, 0.3)"
                                }}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Award size={64} />
                                </div>
                                <div className="relative z-10 flex flex-col items-start">
                                    <div className="p-2 rounded-lg bg-[#D4AF37] text-black mb-3 shadow-lg shadow-yellow-900/20">
                                        <Award size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-[#D4AF37]">{t("visitor.achievements.title", "Conquistas")}</span>
                                    <span className="text-xs text-[#B0A090] mt-1">Ver suas medalhas</span>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate("/passaporte")}
                                className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-[1.02]"
                                style={{
                                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(44, 30, 16, 0.4) 100%)",
                                    border: "1px solid rgba(59, 130, 246, 0.3)"
                                }}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Map size={64} />
                                </div>
                                <div className="relative z-10 flex flex-col items-start">
                                    <div className="p-2 rounded-lg bg-blue-500 text-white mb-3 shadow-lg shadow-blue-900/20">
                                        <div className="text-xl">🛂</div>
                                    </div>
                                    <span className="text-lg font-bold text-blue-400">{t("visitor.passport.title", "Passaporte")}</span>
                                    <span className="text-xs text-[#B0A090] mt-1">Carimbos de visita</span>
                                </div>
                            </button>
                        </div>

                        {/* Logout Action */}
                        <div className="mt-8 pt-6 border-t border-[#463420]">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <LogOut size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-semibold text-red-400 group-hover:text-red-300">Sair da Conta</span>
                                        <span className="text-xs text-[#B0A090]">Encerrar sessão neste dispositivo</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-red-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={20} />
                            </button>
                        </div>
                    </div>
                );
            case 'tickets':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {registrations.length === 0 ? (
                            <div className="text-center py-12 rounded-xl border border-dashed border-[#463420] bg-[rgba(0,0,0,0.2)]">
                                <Ticket className="w-12 h-12 text-[#463420] mx-auto mb-3" />
                                <p className="text-[#B0A090] mb-4">Você ainda não tem ingressos.</p>
                                <button
                                    className="px-6 py-2 rounded-full bg-[#D4AF37] text-black font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                    onClick={() => navigate('/eventos')}
                                >
                                    Ver Eventos Disponíveis
                                </button>
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
                    <div className="space-y-4 animate-fadeIn">
                        {certificates.length === 0 ? (
                            <div className="text-center py-12 rounded-xl border border-dashed border-[#463420] bg-[rgba(0,0,0,0.2)]">
                                <Star className="w-12 h-12 text-[#463420] mx-auto mb-3" />
                                <p className="text-[#B0A090]">Nenhum certificado emitido.</p>
                            </div>
                        ) : (
                            certificates.map(cert => (
                                <div key={cert.id} className="group relative overflow-hidden rounded-xl bg-[#2c1e10] border border-[#463420] hover:border-[#D4AF37] transition-all p-5 shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                                            <Award size={20} />
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold border border-[#D4AF37]/20">
                                            CERTIFICADO
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-[#EAE0D5] text-lg mb-1 font-serif">
                                        {(cert.metadata?.title as string) || (cert.type === 'EVENT' ? 'Certificado de Evento' : 'Certificado')}
                                    </h4>
                                    <p className="text-sm text-[#B0A090] mb-4">
                                        Emitido em {new Date(cert.generatedAt).toLocaleDateString()} por {cert.tenant.name}
                                    </p>

                                    <div className="flex gap-3 mt-4 border-t border-[#463420] pt-4">
                                        <button
                                            className="flex-1 py-2 rounded-lg bg-[#463420] text-[#D4AF37] text-sm font-semibold hover:bg-[#5c452b] transition-colors"
                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '') || ''}/certificates/${cert.id}/pdf`, '_blank')}
                                        >
                                            Baixar PDF
                                        </button>
                                        <button
                                            className="flex-1 py-2 rounded-lg border border-[#463420] text-[#B0A090] text-sm font-semibold hover:text-[#EAE0D5] hover:border-[#B0A090] transition-colors"
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
        <div className="pb-24">
            {/* Simple Header */}
            <div className="mb-8 mt-2">
                <h1 className="text-3xl font-bold text-[#D4AF37] font-serif mb-1">{t("visitor.sidebar.profile")}</h1>
                <p className="text-[#B0A090]">Gerencie sua conta e conquistas</p>
            </div>

            {/* Premium Profile Header Card */}
            <div className="relative overflow-hidden rounded-2xl p-6 mb-8 shadow-2xl" style={{
                background: "linear-gradient(135deg, #2c1e10 0%, #1a1108 100%)",
                border: "1px solid #463420"
            }}>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full filter blur-[60px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C7323] p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                            <div className="w-full h-full rounded-full bg-[#1a1108] flex items-center justify-center overflow-hidden">
                                {name ? (
                                    <span className="text-3xl font-bold text-[#D4AF37] font-serif">{name.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <User className="text-[#D4AF37]" size={40} />
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1a1108] border-2 border-[#D4AF37] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-[#EAE0D5] font-serif tracking-wide">{name || "Visitante"}</h2>
                        <p className="text-[#D4AF37] opacity-80 mb-2">{email}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#362712] border border-[#463420] text-xs text-[#B0A090]">
                            <Star size={12} className="text-[#D4AF37]" /> Membro VIP
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex p-1 rounded-xl bg-[#0f0a05] border border-[#2c1e10] mb-8 overflow-x-auto">
                <button
                    onClick={() => handleTabChange('info')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'info'
                            ? 'bg-[#2c1e10] text-[#D4AF37] shadow-lg border border-[#463420]'
                            : 'text-[#B0A090] hover:text-[#EAE0D5]'
                        }`}
                >
                    Informações
                </button>
                <button
                    onClick={() => handleTabChange('tickets')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tickets'
                            ? 'bg-[#2c1e10] text-[#D4AF37] shadow-lg border border-[#463420]'
                            : 'text-[#B0A090] hover:text-[#EAE0D5]'
                        }`}
                >
                    Meus Ingressos
                </button>
                <button
                    onClick={() => handleTabChange('certificates')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'certificates'
                            ? 'bg-[#2c1e10] text-[#D4AF37] shadow-lg border border-[#463420]'
                            : 'text-[#B0A090] hover:text-[#EAE0D5]'
                        }`}
                >
                    Certificados
                </button>
            </div>

            {renderContent()}
        </div>
    );
};
