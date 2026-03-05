import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, GraduationCap, BookOpen, Calendar, Users, FileText, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

export const TeacherPortal: React.FC = () => {
    const { tenantId, email } = useAuth();
    const [tab, setTab] = useState<'visits' | 'resources'>('visits');
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ schoolName: '', grade: '', studentCount: '', preferredDate: '', objectives: '' });

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/teachers/visits?tenantId=${tenantId}`);
            setVisits(Array.isArray(res.data) ? res.data : []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSubmitVisit = async () => {
        if (!form.schoolName || !form.studentCount) return toast.error("Preencha os campos obrigatórios");
        try {
            await api.post('/teachers/visits', { ...form, studentCount: parseInt(form.studentCount), tenantId, teacherEmail: email });
            toast.success("Visita agendada!");
            setShowForm(false);
            setForm({ schoolName: '', grade: '', studentCount: '', preferredDate: '', objectives: '' });
            fetchData();
        } catch (err) { toast.error("Erro"); }
    };

    const educationalResources = [
        { title: 'Guia de Visita — Ensino Fundamental', desc: 'Roteiro com atividades para crianças de 6-10 anos', icon: '📚', level: 'Fundamental I' },
        { title: 'Caderno de Atividades — Arte Barroca', desc: 'Atividades de colorir e identificar elementos barrocos', icon: '🎨', level: 'Fundamental II' },
        { title: 'Projeto Interdisciplinar — Patrimônio', desc: 'Plano de aula conectando história, artes e geografia', icon: '🗺️', level: 'Ensino Médio' },
        { title: 'Ficha de Observação de Obras', desc: 'Template para alunos registrarem observações', icon: '📝', level: 'Todos' }
    ];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Loader2 className="animate-spin" style={{ color: '#d4af37' }} /></div>;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <GraduationCap size={36} style={{ color: '#d4af37', margin: '0 auto 0.5rem' }} />
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>Portal do Professor</h1>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>Agende visitas e acesse recursos educativos</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <button onClick={() => setTab('visits')} style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: tab === 'visits' ? '#d4af37' : 'rgba(255,255,255,0.05)', color: tab === 'visits' ? '#1a1108' : '#888' }}>
                    <Calendar size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '0.35rem' }} />Visitas
                </button>
                <button onClick={() => setTab('resources')} style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: tab === 'resources' ? '#d4af37' : 'rgba(255,255,255,0.05)', color: tab === 'resources' ? '#1a1108' : '#888' }}>
                    <BookOpen size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '0.35rem' }} />Recursos
                </button>
            </div>

            {tab === 'visits' && (
                <div>
                    <button onClick={() => setShowForm(!showForm)} style={{ width: '100%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '1rem', padding: '1rem', color: '#d4af37', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Plus size={16} /> Agendar Visita Escolar
                    </button>

                    {showForm && (
                        <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                            <input value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} placeholder="Nome da Escola *" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Série / Turma" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
                                <input type="number" value={form.studentCount} onChange={e => setForm({ ...form, studentCount: e.target.value })} placeholder="Nº de Alunos *" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
                            </div>
                            <input type="date" value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
                            <textarea value={form.objectives} onChange={e => setForm({ ...form, objectives: e.target.value })} placeholder="Objetivos da visita (opcional)" rows={2} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', outline: 'none', resize: 'none' }} />
                            <button onClick={onSubmitVisit} style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', border: 'none', padding: '0.75rem', borderRadius: '1rem', fontWeight: 800, cursor: 'pointer' }}>Agendar</button>
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {visits.map((v: any) => (
                            <div key={v.id} style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{v.schoolName || 'Escola'}</h3>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.25rem', background: v.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : 'rgba(212,175,55,0.1)', color: v.status === 'CONFIRMED' ? '#22c55e' : '#d4af37' }}>{v.status || 'PENDENTE'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#888' }}>
                                    <span><Users size={12} style={{ display: 'inline', marginBottom: '-2px' }} /> {v.studentCount} alunos</span>
                                    {v.grade && <span>📚 {v.grade}</span>}
                                    {v.preferredDate && <span>📅 {new Date(v.preferredDate).toLocaleDateString("pt-BR")}</span>}
                                </div>
                            </div>
                        ))}
                        {visits.length === 0 && <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>Nenhuma visita agendada</p>}
                    </div>
                </div>
            )}

            {tab === 'resources' && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {educationalResources.map((r, i) => (
                        <div key={i} style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}>
                            <span style={{ fontSize: '2rem' }}>{r.icon}</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{r.title}</h3>
                                <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.15rem' }}>{r.desc}</p>
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(255,255,255,0.05)', color: '#aaa' }}>{r.level}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
