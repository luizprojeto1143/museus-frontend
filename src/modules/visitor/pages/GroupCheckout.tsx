import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Users, ShoppingBag, Check } from "lucide-react";
import { toast } from "react-hot-toast";

export const GroupCheckout: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [form, setForm] = useState({ groupName: '', totalTickets: '5', contactName: '', contactEmail: '', contactPhone: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const onSubmit = async () => {
        if (!form.groupName || !form.contactName || !form.contactEmail) return toast.error("Preencha os campos obrigatórios");
        setLoading(true);
        try {
            await api.post("/group-tickets", { ...form, totalTickets: parseInt(form.totalTickets), tenantId });
            setSuccess(true);
            toast.success("Solicitação enviada!");
        } catch (err) { toast.error("Erro ao enviar"); }
        finally { setLoading(false); }
    };

    if (success) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Check size={40} style={{ color: '#22c55e' }} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{t("visitor.groupcheckout.solicitaoEnviada", `Solicitação Enviada!`)}</h1>
                <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>Entraremos em contato pelo email informado para confirmar os ingressos do grupo.</p>
                <button onClick={() => { setSuccess(false); setForm({ groupName: '', totalTickets: '5', contactName: '', contactEmail: '', contactPhone: '' }); }} style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 2rem', borderRadius: '1rem', fontWeight: 700, cursor: 'pointer' }}>Nova Solicitação</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Users size={36} style={{ color: '#d4af37', margin: '0 auto 0.75rem' }} />
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>Ingresso de Grupo</h1>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>Organize visitas em grupo com desconto</p>
            </div>
            <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nome do Grupo / Escola *</label>
                    <input value={form.groupName} onChange={e => setForm({ ...form, groupName: e.target.value })} placeholder={t("visitor.groupcheckout.exEscolaMunicipalSoPaulo", `Ex: Escola Municipal São Paulo`)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quantidade de Ingressos</label>
                    <input type="number" min="2" value={form.totalTickets} onChange={e => setForm({ ...form, totalTickets: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t("visitor.groupcheckout.responsvel", `Responsável *`)}</label>
                    <input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Nome completo" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Email *</label>
                    <input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} type="email" placeholder="email@contato.com" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Telefone</label>
                    <input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="(00) 00000-0000" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <button onClick={onSubmit} disabled={loading} style={{ marginTop: '0.5rem', width: '100%', background: loading ? '#555' : 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', border: 'none', padding: '1rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
                    {loading ? 'Enviando...' : 'Solicitar Ingressos'}
                </button>
            </div>
        </div>
    );
};
