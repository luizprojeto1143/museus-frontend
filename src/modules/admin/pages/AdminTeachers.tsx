import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, GraduationCap, Plus, Calendar, Users, CheckCircle, BookOpen } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


export const AdminTeachers: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'teachers' | 'visits'>('teachers');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', school: '', city: '', subject: '' });

    const fetchData = useCallback(async () => {
        try {
            const [t, v] = await Promise.all([
                api.get(`/teachers?tenantId=${tenantId}`),
                api.get(`/teachers/visits?tenantId=${tenantId}`)
            ]);
            setTeachers(t.data);
            setVisits(v.data);
        } catch (error) { console.error(error); toast.error("Erro ao carregar dados"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSaveTeacher = async () => {
        if (!form.name || !form.email || !form.school) return toast.error("Preencha nome, email e escola");
        try {
            await api.post("/teachers", form);
            toast.success("Professor cadastrado!");
            setShowForm(false);
            setForm({ name: '', email: '', phone: '', school: '', city: '', subject: '' });
            fetchData();
        } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.teachers.portalEducao", `Portal Educação`)}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.teachers.professoresVisitasEscolaresEAtividadesPe", `Professores, visitas escolares e atividades pedagógicas`)}</p>
                </div>
                <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>Novo Professor</Button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setTab('teachers')} className={`px-4 py-2 rounded-full text-xs font-bold ${tab === 'teachers' ? 'bg-amber-500 text-black' : 'bg-zinc-900/40 border border-gold/20/5 text-gray-400'}`}>
                    <GraduationCap size={14} style={{ display: "inline", marginRight: "0.25rem" }} /> Professores ({teachers.length})
                </button>
                <button onClick={() => setTab('visits')} className={`px-4 py-2 rounded-full text-xs font-bold ${tab === 'visits' ? 'bg-amber-500 text-black' : 'bg-zinc-900/40 border border-gold/20/5 text-gray-400'}`}>
                    <Calendar size={14} style={{ display: "inline", marginRight: "0.25rem" }} /> Visitas Escolares ({visits.length})
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Cadastrar Professor</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {(['name', 'email', 'phone', 'school', 'city', 'subject'] as const).map(field => (
                            <div key={field}>
                                <label className="block text-sm font-bold text-gray-400 mb-1 capitalize">{field === 'name' ? 'Nome' : field === 'email' ? 'Email' : field === 'phone' ? 'Telefone' : field === 'school' ? 'Escola' : field === 'city' ? 'Cidade' : 'Disciplina'}</label>
                                <input type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={onSaveTeacher}>Salvar</Button>
                    </div>
                </div>
            )}

            {tab === 'teachers' && (
                <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            <tr><th className="px-6 py-3">Professor</th><th className="px-6 py-3">Escola</th><th className="px-6 py-3">Disciplina</th><th className="px-6 py-3 text-center">Visitas</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {teachers.map((t: any) => (
                                <tr key={t.id} className="hover:bg-zinc-900/40 border border-gold/20/5">
                                    <td className="px-6 py-3"><p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{t.name}</p><p style={{ color: "#64748b", fontSize: "0.75rem" }}>{t.email}</p></td>
                                    <td className="px-6 py-3 text-gray-300 text-sm">{t.school}</td>
                                    <td className="px-6 py-3 text-gray-400 text-sm">{t.subject || '—'}</td>
                                    <td className="px-6 py-3 text-center text-amber-400 font-bold">{t._count?.schoolVisits || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'visits' && (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {visits.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                            <Calendar size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                            <p style={{ color: "#64748b" }}>Nenhuma visita escolar agendada</p>
                        </div>
                    ) : visits.map((v: any) => (
                        <div key={v.id} className="card" style={{ padding: "1.25rem" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{v.schoolName}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${v.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : v.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{v.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                                        <span><GraduationCap size={12} style={{ display: "inline", marginRight: "0.25rem" }} />{v.teacher?.name}</span>
                                        <span><Users size={12} style={{ display: "inline", marginRight: "0.25rem" }} />{v.studentCount} alunos</span>
                                        <span><Calendar size={12} style={{ display: "inline", marginRight: "0.25rem" }} />{new Date(v.visitDate).toLocaleDateString("pt-BR")}</span>
                                        {v.grade && <span><BookOpen size={12} style={{ display: "inline", marginRight: "0.25rem" }} />{v.grade}</span>}
                                    </div>
                                </div>
                                {v.certificateIssued && <CheckCircle size={20} className="text-green-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
