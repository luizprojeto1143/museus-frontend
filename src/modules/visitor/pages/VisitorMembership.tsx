import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Crown, Check, Star, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const VisitorMembership: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId, email, name, isGuest } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);

    const fetchPlans = useCallback(async () => {
        try {
            const res = await api.get(`/memberships/plans?tenantId=${tenantId}`);
            setPlans(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchPlans(); }, [tenantId, fetchPlans]);

    const onSubscribe = async (planId: string) => {
        if (!email) return toast.error("Faça login para assinar");
        setSubscribing(planId);
        try {
            await api.post("/memberships", { planId, visitorEmail: email, visitorName: name || "Visitante", tenantId });
            toast.success("Assinatura realizada! 🎉");
            fetchPlans();
        } catch (err) { toast.error("Erro ao assinar"); }
        finally { setSubscribing(null); }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" style={{ color: '#d4af37' }} /></div>;

    if (isGuest) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto' }}>
                <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Recurso Exclusivo</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>{t("visitor.membership.crieUmaContaGratuitaParaSeTornarMembroDo", `Crie uma conta gratuita para se tornar membro do museu e garantir benefícios exclusivos!`)}</p>
                <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', padding: '0.8rem 2rem', borderRadius: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', width: '100%' }}>Criar Conta Gratuita</button>
            </div>
        );
    }

    return (
        <div className="membership-page" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Crown size={48} style={{ color: '#d4af37', margin: '0 auto 1rem' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Amigo do Museu</h1>
                <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>{t("visitor.membership.apoieACulturaEGanheBenefciosExclusivos", `Apoie a cultura e ganhe benefícios exclusivos`)}</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {plans.map((plan: any) => (
                    <div key={plan.id} style={{
                        background: 'rgba(30,32,38,0.9)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ color: '#d4af37', fontWeight: 800, fontSize: '1.3rem' }}>{plan.name}</h2>
                                {plan.description && <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>{plan.description}</p>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>R$ {Number(plan.monthlyPrice).toFixed(2)}</span>
                                <span style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>{t("visitor.membership.ms", `/mês`)}</span>
                                {plan.yearlyPrice && (
                                    <span style={{ color: '#d4af37', fontSize: '0.75rem' }}>ou R$ {Number(plan.yearlyPrice).toFixed(2)}/ano</span>
                                )}
                            </div>
                        </div>

                        {plan.benefits && (
                            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                                {(Array.isArray(plan.benefits) ? plan.benefits : []).map((b: string, i: number) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Check size={16} style={{ color: '#d4af37', flexShrink: 0 }} />
                                        <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{b}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {plan.shopDiscount && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(212,175,55,0.08)', borderRadius: '1rem', border: '1px solid rgba(212,175,55,0.15)' }}>
                                <Star size={14} style={{ color: '#d4af37' }} />
                                <span style={{ color: '#d4af37', fontSize: '0.8rem', fontWeight: 700 }}>{plan.shopDiscount}% de desconto na loja</span>
                            </div>
                        )}

                        <button
                            onClick={() => onSubscribe(plan.id)}
                            disabled={subscribing === plan.id}
                            style={{
                                marginTop: '1.5rem',
                                width: '100%',
                                background: subscribing === plan.id ? '#555' : 'linear-gradient(135deg, #d4af37, #b8941e)',
                                color: '#1a1108',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '1rem',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                cursor: subscribing === plan.id ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {subscribing === plan.id ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            {subscribing === plan.id ? 'Processando...' : 'Assinar Agora'}
                        </button>
                    </div>
                ))}
            </div>

            {plans.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <Crown size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>{t("visitor.membership.nenhumPlanoDisponvelNoMomento", `Nenhum plano disponível no momento`)}</p>
                </div>
            )}
        </div>
    );
};
