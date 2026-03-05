import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Building2, FileText, Calendar, Users, Star, ArrowRight, MapPin, Globe, Phone, Mail, Clock, Image, Shield, Hash } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { toast } from "react-hot-toast";

export const MunicipalEquipments: React.FC = () => {
    const { tenantId } = useAuth();
    const navigate = useNavigate();
    const [equipments, setEquipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEquipments = useCallback(async () => {
        try {
            const res = await api.get(`/tenants?parentId=${tenantId}`);
            setEquipments(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar equipamentos");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Equipamentos Culturais</h1>
                    <p className="text-slate-500">Gestão de museus, bibliotecas e centros culturais vinculados</p>
                </div>
                <Button
                    leftIcon={<Plus size={18} />}
                    onClick={() => toast("Funcionalidade disponível apenas para administradores Master. Contate o suporte.", { icon: "ℹ️" })}
                >
                    Novo Equipamento
                </Button>
            </div>

            {equipments.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center py-24">
                    <Building2 size={60} className="mx-auto text-slate-300 mb-6" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum equipamento vinculado</h3>
                    <p className="text-slate-400">Equipamentos culturais filhos aparecerão aqui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {equipments.map(eq => (
                        <div key={eq.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                        <Building2 size={24} />
                                    </div>
                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">{eq.type}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{eq.name}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{eq.mission || "Nenhuma missão cadastrada."}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-1 text-slate-400 text-xs text-center">
                                    <FileText size={14} /> <span>{eq._count?.works ?? 0} Obras</span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="text-xs h-8 px-3"
                                    onClick={() => navigate(`/admin?tenantId=${eq.id}`)}
                                >
                                    Gerenciar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const MunicipalProjects: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [projRes, noticeRes] = await Promise.all([
                api.get(`/projects`),
                api.get(`/notices`)
            ]);
            setProjects(projRes.data);
            setNotices(noticeRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar projetos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" /></div>;

    const statusLabels: Record<string, { label: string; className: string }> = {
        DRAFT: { label: "Rascunho", className: "bg-slate-100 text-slate-600" },
        SUBMITTED: { label: "Submetido", className: "bg-blue-100 text-blue-700" },
        UNDER_REVIEW: { label: "Em Análise", className: "bg-amber-100 text-amber-700" },
        APPROVED: { label: "Aprovado", className: "bg-green-100 text-green-700" },
        REJECTED: { label: "Rejeitado", className: "bg-red-100 text-red-700" },
        IN_EXECUTION: { label: "Em Execução", className: "bg-purple-100 text-purple-700" },
        COMPLETED: { label: "Concluído", className: "bg-emerald-100 text-emerald-700" },
        CANCELED: { label: "Cancelado", className: "bg-gray-100 text-gray-600" }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Projetos e Editais</h1>
                    <p className="text-slate-500">Monitoramento de execução física e financeira</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        leftIcon={<FileText size={18} />}
                        onClick={() => navigate("/admin/editais")}
                    >
                        Gerenciar Editais
                    </Button>
                    <Button
                        leftIcon={<Plus size={18} />}
                        onClick={() => navigate("/admin/projetos/novo")}
                    >
                        Lançar Projeto Especial
                    </Button>
                </div>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="text-amber-500" size={20} /> Editais Ativos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notices.filter(n => n.status !== 'DRAFT').map(notice => (
                        <div
                            key={notice.id}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => navigate(`/admin/editais/${notice.id}`)}
                        >
                            <div>
                                <h4 className="font-bold text-slate-900">{notice.title}</h4>
                                <p className="text-xs text-slate-500">{notice._count?.projects ?? 0} Projetos inscritos</p>
                            </div>
                            <ArrowRight className="text-slate-400" />
                        </div>
                    ))}
                    {notices.filter(n => n.status !== 'DRAFT').length === 0 && (
                        <p className="text-slate-400 italic text-sm col-span-2">Nenhum edital ativo no momento.</p>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="text-amber-500" size={20} /> Projetos em Execução
                </h2>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Projeto</th>
                                <th className="px-6 py-4">Proponente</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {projects.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{p.title}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{p.proponent?.name || "Desconhecido"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusLabels[p.status]?.className || 'bg-slate-100 text-slate-600'}`}>
                                            {statusLabels[p.status]?.label || p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/projetos/${p.id}`)}
                                            className="text-amber-600 font-bold text-xs hover:underline"
                                        >
                                            Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Nenhum projeto cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export const MunicipalCompliance: React.FC = () => {
    const { tenantId } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompliance = useCallback(async () => {
        try {
            const res = await api.get(`/secretary/legal-compliance?tenantId=${tenantId}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar matriz de conformidade");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchCompliance();
    }, [fetchCompliance]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Matriz de Conformidade Legal</h1>
                    <p className="text-slate-500">Acompanhamento automático de normativas federais (LBI, NBR 9050)</p>
                </div>
                <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Star size={18} fill="currentColor" /> {data?.summary?.complianceRate}% Conforme
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Lei / Normativa</th>
                            <th className="px-6 py-4">Requisito</th>
                            <th className="px-6 py-4">Evidência no Sistema</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data?.matrix?.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{item.law}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{item.requirement}</td>
                                <td className="px-6 py-4 text-slate-400 text-xs italic">{item.evidence}</td>
                                <td className="px-6 py-4 text-center">
                                    {item.compliant ? (
                                        <span className="text-green-500 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">Ok</span>
                                    ) : (
                                        <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">Pendente</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const MunicipalSettings: React.FC = () => {
    const { tenantId } = useAuth();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await api.get(`/tenants/${tenantId}/settings`);
            setSettings(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/tenants/${tenantId}/settings`, settings);
            toast.success("Configurações salvas!");
        } catch (error) {
            toast.error("Erro ao salvar");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" /></div>;

    const TextInput = ({ label, field, placeholder, icon }: { label: string; field: string; placeholder?: string; icon?: React.ReactNode }) => (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                {icon} {label}
            </label>
            <input
                type="text"
                value={settings[field] || ""}
                onChange={e => updateField(field, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 transition-colors outline-none text-sm"
            />
        </div>
    );

    const TextArea = ({ label, field, placeholder, rows = 3 }: { label: string; field: string; placeholder?: string; rows?: number }) => (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <textarea
                value={settings[field] || ""}
                onChange={e => updateField(field, e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 transition-colors outline-none text-sm resize-none"
            />
        </div>
    );

    const NumberInput = ({ label, field, placeholder }: { label: string; field: string; placeholder?: string }) => (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <input
                type="number"
                value={settings[field] || ""}
                onChange={e => updateField(field, e.target.value ? Number(e.target.value) : null)}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 transition-colors outline-none text-sm"
            />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-serif">Configurações da Secretaria</h1>
                <p className="text-slate-500">Identidade visual, contato, localização e parâmetros globais do município</p>
            </div>

            <div className="max-w-3xl space-y-8">
                {/* Identity */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Building2 size={20} className="text-amber-500" /> Identificação
                    </h2>
                    <TextInput label="Nome da Secretaria / Instituição" field="name" placeholder="Ex: Secretaria Municipal de Cultura" icon={<Building2 size={14} />} />
                    <TextInput label="Endereço Sede" field="address" placeholder="Ex: Praça Tiradentes, 123" icon={<MapPin size={14} />} />
                    <TextArea label="Missão" field="mission" placeholder="Missão institucional da secretaria..." />
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput label="CNPJ" field="cnpj" placeholder="00.000.000/0000-00" icon={<Hash size={14} />} />
                        <TextInput label="Natureza Jurídica" field="legalNature" placeholder="Público Municipal" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput label="Tipologia" field="typology" placeholder="Ex: Museu, Centro Cultural" />
                        <NumberInput label="Ano de Fundação" field="foundationYear" placeholder="Ex: 1985" />
                    </div>
                    <TextInput label="Representante Legal" field="legalRepresentative" placeholder="Nome completo do responsável" />
                </div>

                {/* Contact */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Mail size={20} className="text-amber-500" /> Contato
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput label="Email" field="email" placeholder="contato@secretaria.gov.br" icon={<Mail size={14} />} />
                        <TextInput label="WhatsApp" field="whatsapp" placeholder="+55 31 99999-9999" icon={<Phone size={14} />} />
                    </div>
                    <TextInput label="Website" field="website" placeholder="https://cultura.cidade.gov.br" icon={<Globe size={14} />} />
                </div>

                {/* Schedule */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Clock size={20} className="text-amber-500" /> Horário de Funcionamento
                    </h2>
                    <TextArea label="Horários" field="openingHours" placeholder="Seg-Sex: 8h-17h&#10;Sáb: 9h-13h" rows={4} />
                </div>

                {/* Location */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <MapPin size={20} className="text-amber-500" /> Geolocalização
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput label="Latitude" field="latitude" placeholder="-20.3855" />
                        <NumberInput label="Longitude" field="longitude" placeholder="-43.5035" />
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Image size={20} className="text-amber-500" /> Mídia e Identidade Visual
                    </h2>
                    <TextInput label="Logo URL" field="logoUrl" placeholder="https://..." icon={<Image size={14} />} />
                    <TextInput label="Imagem de Capa" field="coverImageUrl" placeholder="https://..." icon={<Image size={14} />} />
                    <TextInput label="Banner URL" field="bannerUrl" placeholder="https://..." icon={<Image size={14} />} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cor Primária</label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.primaryColor || "#f59e0b"} onChange={e => updateField("primaryColor", e.target.value)} className="h-10 w-10 overflow-hidden rounded-lg cursor-pointer border-none" />
                                <input type="text" value={settings.primaryColor || ""} onChange={e => updateField("primaryColor", e.target.value)} className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cor Secundária</label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.secondaryColor || "#1e293b"} onChange={e => updateField("secondaryColor", e.target.value)} className="h-10 w-10 overflow-hidden rounded-lg cursor-pointer border-none" />
                                <input type="text" value={settings.secondaryColor || ""} onChange={e => updateField("secondaryColor", e.target.value)} className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal (LGPD) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Shield size={20} className="text-amber-500" /> Termos Legais (LGPD)
                    </h2>
                    <TextArea label="Termos de Uso" field="termsOfUse" placeholder="Texto dos termos de uso (aceita Markdown/HTML)..." rows={6} />
                    <TextArea label="Política de Privacidade" field="privacyPolicy" placeholder="Texto da política de privacidade..." rows={6} />
                </div>

                <div className="flex justify-end pb-10">
                    <Button onClick={handleSave} disabled={saving} className="px-8">
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
