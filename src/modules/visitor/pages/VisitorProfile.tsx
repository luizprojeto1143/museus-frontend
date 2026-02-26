import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { Ticket, Award, LogOut, ChevronRight, User, Star, Map, ExternalLink, CheckCircle, ShoppingBag, Clock, CreditCard, Package } from 'lucide-react';
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

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    paymentMethod: string;
    items: Array<{
        product: { name: string };
        quantity: number;
        priceAtTime: number;
    }>;
}

export const VisitorProfile: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { name, email, logout, isGuest } = useAuth();

    // Tabs: 'info' | 'tickets' | 'certificates' | 'orders'
    const [activeTab, setActiveTab] = useState<'info' | 'tickets' | 'certificates' | 'orders'>('info');

    // Data
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (tab: 'info' | 'tickets' | 'certificates' | 'orders') => {
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

        if (tab === 'orders' && orders.length === 0) {
            setLoading(true);
            api.get('/shop/my-orders')
                .then(res => setOrders(res.data))
                .catch(console.error)
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
                                variant="outline"
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

            case 'orders':
                return (
                    <div className="animate-fadeIn space-y-4">
                        {orders.length === 0 ? (
                            <div className="empty-state">
                                <ShoppingBag size={48} style={{ margin: "0 auto", opacity: 0.5 }} />
                                <p>Você ainda não fez nenhum pedido.</p>
                                <Button
                                    onClick={() => navigate('/loja')}
                                    className="bg-gold hover:bg-gold/90 text-black font-bold rounded-full px-6"
                                >
                                    Ver Loja
                                </Button>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="cert-item" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Pedido #{order.id.slice(-6)}</span>
                                            <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${order.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
                                            order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {order.status === 'PAID' ? 'Pago' : order.status === 'PENDING' ? 'Aguardando Pagamento' : order.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-300 font-medium">{item.quantity}x {item.product.name}</span>
                                                <span className="text-white">R$ {(item.priceAtTime * item.quantity).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Total</span>
                                        <span className="text-lg font-black text-amber-400">R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
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

            {isGuest ? (
                <div className="empty-state" style={{ marginTop: "2rem", background: "rgba(212, 175, 55, 0.05)", border: "1px dashed var(--primary-color)", padding: "3rem" }}>
                    <Star size={48} className="text-gold mb-4" style={{ opacity: 0.5 }} />
                    <h2 className="text-xl font-bold text-gold">{t("visitor.profile.guestTitle", "Acesso Restrito")}</h2>
                    <p className="max-w-md mx-auto mb-6 text-secondary" style={{ color: "var(--text-secondary)" }}>
                        Crie uma conta para salvar seus ingressos, certificados e acompanhar suas conquistas em todos os seus dispositivos.
                    </p>
                    <Button onClick={() => navigate("/register")} className="bg-gold text-black font-bold h-12 px-8 rounded-full shadow-lg hover:scale-105 transition-transform">
                        Criar Conta Agora
                    </Button>
                </div>
            ) : (
                <>
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
                            onClick={() => handleTabChange('orders')}
                            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        >
                            Loja
                        </button>
                        <button
                            onClick={() => handleTabChange('certificates')}
                            className={`profile-tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
                        >
                            Certificados
                        </button>
                    </div>

                    {renderContent()}
                </>
            )}
        </div>
    );
};
