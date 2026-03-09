import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { api } from "../../../api/client";
import { Loader2, Send, ArrowRightLeft, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";

export const TicketTransfer: React.FC = () => {
  const { t } = useTranslation();
    const { email } = useAuth();
    const [form, setForm] = useState({ registrationId: '', toName: '', toEmail: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<any>(null);

    const onTransfer = async () => {
        if (!form.registrationId || !form.toName || !form.toEmail) return toast.error("Preencha todos os campos");
        if (form.toEmail === email) return toast.error("Não pode transferir para você mesmo");
        setLoading(true);
        try {
            const res = await api.post("/ticket-transfers", form);
            setSuccess(res.data);
            toast.success("Ingresso transferido com sucesso!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Erro ao transferir");
        } finally { setLoading(false); }
    };

    if (success) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Check size={40} style={{ color: '#22c55e' }} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>{t("visitor.tickettransfer.transfernciaConcluda", `Transferência Concluída!`)}</h1>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>O ingresso foi transferido para <strong style={{ color: '#d4af37' }}>{success.toName}</strong></p>
                <div style={{ marginTop: '1.5rem', background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t("visitor.tickettransfer.novoCdigoDoIngresso", `Novo código do ingresso:`)}</p>
                    <p style={{ color: '#d4af37', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{success.newCode}</p>
                </div>
                <button onClick={() => { setSuccess(null); setForm({ registrationId: '', toName: '', toEmail: '' }); }} style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 2rem', borderRadius: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                    Nova Transferência
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <ArrowRightLeft size={36} style={{ color: '#d4af37', margin: '0 auto 0.75rem' }} />
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>Transferir Ingresso</h1>
                <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>Transfira seu ingresso para outra pessoa</p>
            </div>

            <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t("visitor.tickettransfer.cdigoDaInscrio", `Código da Inscrição`)}</label>
                    <input value={form.registrationId} onChange={e => setForm({ ...form, registrationId: e.target.value })} placeholder={t("visitor.tickettransfer.coleOIdDaInscrio", `Cole o ID da inscrição`)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t("visitor.tickettransfer.nomeDoDestinatrio", `Nome do Destinatário`)}</label>
                    <input value={form.toName} onChange={e => setForm({ ...form, toName: e.target.value })} placeholder="Nome completo" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t("visitor.tickettransfer.emailDoDestinatrio", `Email do Destinatário`)}</label>
                    <input value={form.toEmail} onChange={e => setForm({ ...form, toEmail: e.target.value })} type="email" placeholder="email@exemplo.com" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                </div>

                <button onClick={onTransfer} disabled={loading} style={{ marginTop: '0.5rem', width: '100%', background: loading ? '#555' : 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', border: 'none', padding: '1rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {loading ? 'Transferindo...' : 'Transferir Ingresso'}
                </button>
            </div>
        </div>
    );
};
