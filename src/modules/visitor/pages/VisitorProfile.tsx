import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { 
  Award, LogOut, ChevronRight, User, Star, Map, ExternalLink, 
  CheckCircle, ShoppingBag, Clock, Package, TicketPercent, Zap, Share2
} from 'lucide-react';
import { useGamification } from "../../gamification/context/GamificationContext";
import { TicketCard } from "../components/TicketCard";
import { Button } from "../../../components/ui";
import { motion, AnimatePresence } from "framer-motion";
import "./VisitorProfile.css";

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

interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: string;
    xpCost: number;
    description: string;
    alreadyRedeemed: boolean;
}

interface RedeemedCoupon {
    id: string;
    redeemedAt: string;
    usedAt: string | null;
    coupon: Coupon;
}

export const VisitorProfile: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { name, email, logout, isGuest } = useAuth();
    const { currentLevel, stats, progressToNextLevel, nextLevel } = useGamification();

    const [activeTab, setActiveTab] = useState<'info' | 'tickets' | 'certificates' | 'orders' | 'rewards'>('info');

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [redeemedCoupons, setRedeemedCoupons] = useState<RedeemedCoupon[]>([]);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (tab: 'info' | 'tickets' | 'certificates' | 'orders' | 'rewards') => {
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
                .catch(() => setRegistrations([]))
                .finally(() => setLoading(false));
        }

        if (tab === 'orders' && orders.length === 0) {
            setLoading(true);
            api.get('/shop/my-orders')
                .then(res => setOrders(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }

        if (tab === 'rewards' && availableCoupons.length === 0) {
            setLoading(true);
            api.get('/coupons/available')
                .then(res => {
                    setAvailableCoupons(res.data.available);
                    setRedeemedCoupons(res.data.redeemed);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    };

    const redeemCoupon = async (couponId: string) => {
        try {
            setLoading(true);
            await api.post(`/coupons/${couponId}/redeem`);
            const res = await api.get('/coupons/available');
            setAvailableCoupons(res.data.available);
            setRedeemedCoupons(res.data.redeemed);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) return (
            <div className="flex justify-center p-20">
               <div className="splash-loader-fill h-1 w-20"></div>
            </div>
        );

        switch (activeTab) {
            case 'info':
                return (
                    <motion.div 
                        className="actions-grid-premium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="action-card-premium" onClick={() => navigate("/conquistas")}>
                            <div className="icon-box"><Award size={24} /></div>
                            <div>
                                <h4>Conquistas</h4>
                                <p>Sua jornada e medalhas</p>
                            </div>
                        </div>

                        <div className="action-card-premium" onClick={() => navigate("/passaporte")}>
                            <div className="icon-box"><Map size={24} /></div>
                            <div>
                                <h4>Passaporte</h4>
                                <p>Selos de visitação</p>
                            </div>
                        </div>

                        <div className="action-card-premium" onClick={() => navigate("/guarda-roupa")}>
                            <div className="icon-box"><User size={24} /></div>
                            <div>
                                <h4>Guarda-Roupa</h4>
                                <p>Customização de avatar</p>
                            </div>
                        </div>

                        <div className="action-card-premium" onClick={() => navigate("/marketplace")}>
                            <div className="icon-box"><ShoppingBag size={24} /></div>
                            <div>
                                <h4>Marketplace</h4>
                                <p>Trocas épicas por XP</p>
                            </div>
                        </div>

                        <button 
                            className="text-red-500 font-fm text-[10px] uppercase tracking-widest mt-10 hover:opacity-70 transition-opacity flex items-center gap-2"
                            onClick={logout}
                        >
                            <LogOut size={14} /> Sair da Conta
                        </button>
                    </motion.div>
                );

            case 'tickets':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {registrations.length === 0 ? (
                            <div className="text-center p-20">
                                <p className="text-muted font-fb mb-6">Nenhum ingresso emitido.</p>
                                <button onClick={() => navigate('/eventos')} className="gallery-cta !w-auto !px-8">Explorar Agenda</button>
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
                    </motion.div>
                );

            case 'certificates':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="actions-grid-premium">
                        {certificates.length === 0 ? (
                            <p className="text-muted p-20 text-center col-span-full">Nenhum certificado disponível.</p>
                        ) : (
                            certificates.map(cert => (
                                <div key={cert.id} className="sidebar-card-premium">
                                    <span className="sidebar-label-premium">EMITIDO POR {cert.tenant.name}</span>
                                    <h4 className="font-fd text-white text-xl mb-4">
                                        {(cert.metadata?.title as string) || (cert.type === 'EVENT' ? 'Certificado de Evento' : 'Certificado de Visita')}
                                    </h4>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '') || ''}/certificates/${cert.id}/pdf`, '_blank')}
                                            className="gallery-cta !h-10 !text-[10px]"
                                        >
                                            Ver PDF
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                );

            case 'orders':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {orders.length === 0 ? (
                            <p className="text-muted p-20 text-center">Nenhum pedido realizado.</p>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="sidebar-card-premium">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="sidebar-label-premium">PEDIDO #{order.id.slice(-6)}</span>
                                        <span className="bg-gold-dim text-gold px-3 py-1 rounded-full text-[10px] font-bold">{order.status}</span>
                                    </div>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-muted text-xs mb-2">
                                            <span>{item.quantity}x {item.product.name}</span>
                                            <span className="text-white">R$ {(item.priceAtTime * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-border flex justify-between">
                                        <span className="text-white font-fd">Total</span>
                                        <span className="text-gold-hi font-fd">R$ {Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                );

            case 'rewards':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="sidebar-card-premium !bg-gold-dim">
                            <h3 className="font-fd text-gold-hi text-xl mb-2">Resgate de Prestígio</h3>
                            <p className="text-muted text-xs mb-0">Use seu capital cultural (XP) para adquirir benefícios na Lojinha.</p>
                        </div>

                        <div className="actions-grid-premium">
                            {availableCoupons.map(coupon => (
                                <div key={coupon.id} className="action-card-premium !cursor-default">
                                    <div className="flex justify-between">
                                        <span className="font-fd text-gold-hi text-2xl">
                                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue}`}
                                        </span>
                                        <span className="bg-gold/10 text-gold px-2 py-1 rounded text-[10px] font-bold">{coupon.xpCost} XP</span>
                                    </div>
                                    <p className="font-fm text-white uppercase text-[10px] tracking-widest">{coupon.code}</p>
                                    {!coupon.alreadyRedeemed ? (
                                        <button onClick={() => redeemCoupon(coupon.id)} className="gallery-cta !h-10 !mt-4">Resgatar</button>
                                    ) : (
                                        <span className="text-green-500 text-[10px] font-fm uppercase mt-4">Já Resgatado</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <motion.div 
            className="profile-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="profile-header">
                <h1 className="work-title-premium !text-5xl">{t("visitor.sidebar.profile")}</h1>
                <p className="work-badge-premium !text-[12px] !mt-2">Prestígio Cultural & Patrimônio</p>
            </header>

            <section className="profile-card-premium">
                <div className="profile-hero-premium">
                    <div className="avatar-premium">
                        {name ? (
                            <span>{name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <User size={64} />
                        )}
                        <div className="level-badge-premium">LVL {currentLevel.level}</div>
                    </div>

                    <div className="profile-info-premium">
                        <div className="flex items-center gap-4">
                            <h2 className="profile-name-premium">{name || "Viajante"}</h2>
                        </div>
                        <p className="profile-rank-premium">{currentLevel.title}</p>
                        
                        <div className="progress-section-premium mt-6">
                            <div className="flex justify-between font-fm text-[10px] uppercase text-gold">
                                <span>Evolução de Prestígio</span>
                                <span>{Math.round(progressToNextLevel)}%</span>
                            </div>
                            <div className="xp-bar-premium">
                                <motion.div 
                                    className="xp-fill-premium" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNextLevel}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                            <div className="flex gap-6 mt-4 font-fb text-xs text-muted">
                                <div className="flex items-center gap-2"><Zap size={12} className="text-gold" /> {stats.xp} XP acumulado</div>
                                <div className="flex items-center gap-2"><Award size={12} className="text-gold" /> {stats.achievements.filter(a => a.unlockedAt).length} Conquistas</div>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="tabs-premium">
                    {(['info', 'tickets', 'orders', 'certificates', 'rewards'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`tab-btn-premium ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab === 'rewards' && <TicketPercent size={14} className="inline mr-2" />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>

                <div className="profile-content-premium">
                    {renderContent()}
                </div>
            </section>

            {isGuest && (
                <div className="sidebar-card-premium !bg-gold-dim !border-gold flex flex-col items-center text-center p-12">
                    <Star size={48} className="text-gold mb-6" />
                    <h2 className="text-2xl font-fd text-white mb-4">Acesso Restrito ao Legado</h2>
                    <p className="text-muted mb-8 max-w-lg">Crie uma conta para eternizar seu progresso, colecionar medalhas e acessar benefícios exclusivos em todo o ecossistema cultural.</p>
                    <button onClick={() => navigate("/register")} className="gallery-cta !w-auto !px-12">Iniciar Minha História</button>
                </div>
            )}
        </motion.div>
    );
};
