import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
    Loader2, Plus, Building2, FileText, Calendar, Users, 
    Star, ArrowRight, MapPin, Globe, Phone, Mail, Clock, 
    Image, Shield, Hash, LayoutDashboard, Settings
} from "lucide-react";
import { Button, Badge, AnimateIn, Card, PageLoader } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/cn";

export const MunicipalEquipments: React.FC = () => {
  const { t } = useTranslation();
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

    if (loading) return <PageLoader message="Mapeando equipamentos..." />;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <Badge variant="glass" className="mb-4 text-amber-500 bg-amber-500/10 border-amber-500/20 uppercase tracking-widest text-[10px]">
                        Rede Municipal
                    </Badge>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Equipamentos Culturais</h1>
                    <p className="text-slate-500 font-medium mt-2">
                        {t("municipal.municipalplaceholders.gestoDeMuseusBibliotecasECentrosCulturai", `Gestão de museus, bibliotecas e centros culturais vinculados`)}
                    </p>
                </div>
                <Button
                    size="lg"
                    className="h-16 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl"
                    leftIcon={<Plus size={18} />}
                    onClick={() => toast("Apenas Master Admins podem criar equipamentos.", { icon: "ℹ️" })}
                >
                    Novo Equipamento
                </Button>
            </div>

            {equipments.length === 0 ? (
                <AnimateIn variant="fadeUp" className="bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] text-center py-32">
                    <Building2 size={60} className="mx-auto text-white/10 mb-6" />
                    <h3 className="text-2xl font-black text-white mb-2">Nenhum equipamento vinculado</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Sua rede municipal ainda não possui equipamentos cadastrados.
                    </p>
                </AnimateIn>
            ) : (
                <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {equipments.map(eq => (
                        <motion.div key={eq.id} variants={staggerItem}>
                            <Card hover="premium" className="h-full flex flex-col p-8 border-white/5 bg-white/5">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                                        <Building2 size={24} />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black border-white/10 text-slate-500">
                                        {eq.type}
                                    </Badge>
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 tracking-tight">{eq.name}</h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                                    {eq.mission || "Nenhuma missão cadastrada."}
                                </p>
                                
                                <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                        <FileText size={14} className="text-amber-500/50" /> 
                                        <span>{eq._count?.works ?? 0} Obras no Acervo</span>
                                    </div>
                                    <Button
                                        variant="glass"
                                        size="sm"
                                        className="h-10 px-4 font-black uppercase text-[10px] tracking-widest border-white/5"
                                        onClick={() => navigate(`/admin?tenantId=${eq.id}`)}
                                    >
                                        Gerenciar
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
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

    if (loading) return <PageLoader message="Sincronizando editais..." />;

    const statusLabels: Record<string, { label: string; className: string }> = {
        DRAFT: { label: "Rascunho", className: "bg-white/10 text-slate-500 border-white/5" },
        SUBMITTED: { label: "Submetido", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
        UNDER_REVIEW: { label: "Em Análise", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        APPROVED: { label: "Aprovado", className: "bg-green-500/10 text-green-400 border-green-500/20" },
        REJECTED: { label: "Rejeitado", className: "bg-red-500/10 text-red-400 border-red-500/20" },
        IN_EXECUTION: { label: "Em Execução", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
        COMPLETED: { label: "Concluído", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
        CANCELED: { label: "Cancelado", className: "bg-white/5 text-slate-600 border-white/5" }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Projetos e Editais</h1>
                    <p className="text-slate-500 font-medium mt-2">
                        {t("municipal.municipalplaceholders.monitoramentoDeExecuoFsicaEFinanceira", `Monitoramento de execução física e financeira`)}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="glass"
                        size="lg"
                        className="h-14 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-white/5"
                        leftIcon={<FileText size={18} />}
                        onClick={() => navigate("/admin/editais")}
                    >
                        Gerenciar Editais
                    </Button>
                    <Button
                        size="lg"
                        className="h-14 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest"
                        leftIcon={<Plus size={18} />}
                        onClick={() => navigate("/admin/projetos/novo")}
                    >
                        Lançar Projeto
                    </Button>
                </div>
            </div>

            <section>
                 <Badge variant="glass" className="mb-6 bg-amber-500/10 text-amber-500 border-amber-500/20">
                     <Calendar className="mr-1.5" size={12} /> Editais Ativos
                 </Badge>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {notices.filter(n => n.status !== 'DRAFT').map(notice => (
                        <Card 
                            key={notice.id} 
                            hover="premium" 
                            className="p-6 bg-white/5 border-white/5 flex justify-between items-center cursor-pointer"
                            onClick={() => navigate(`/admin/editais/${notice.id}`)}
                        >
                            <div>
                                <h4 className="font-black text-white tracking-tight">{notice.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                                    {notice._count?.projects ?? 0} Projetos inscritos
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-500">
                                <ArrowRight size={18} />
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                 <Badge variant="glass" className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20">
                     <Users className="mr-1.5" size={12} /> Portfolio em Execução
                 </Badge>
                <Card className="bg-white/5 border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5">Projeto</th>
                                    <th className="px-8 py-5">Proponente</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {projects.map(p => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6 font-black text-white tracking-tight">{p.title}</td>
                                        <td className="px-8 py-6 text-slate-400 font-medium text-sm">{p.proponent?.name || "Desconhecido"}</td>
                                        <td className="px-8 py-6">
                                            <Badge variant="outline" className={cn("text-[8px] font-black uppercase border-transparent", statusLabels[p.status]?.className)}>
                                                {statusLabels[p.status]?.label || p.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/projetos/${p.id}`)}
                                                className="text-amber-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-16 text-center text-slate-500 font-medium italic">Nenhum projeto cadastrado no momento.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
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

    if (loading) return <PageLoader message="Auditando conformidade..." />;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Conformidade Legal</h1>
                    <p className="text-slate-500 font-medium mt-2">
                        {t("municipal.municipalplaceholders.acompanhamentoAutomticoDeNormativasFeder", `Acompanhamento automático de normativas federais (LBI, NBR 9050)`)}
                    </p>
                </div>
                <div className="px-8 py-5 rounded-[2rem] bg-amber-500 text-black shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] flex items-center gap-4">
                    <Star size={24} fill="currentColor" /> 
                    <div>
                        <span className="block text-2xl font-black leading-none">{data?.summary?.complianceRate}%</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-black/60">Índice Conforme</span>
                    </div>
                </div>
            </div>

            <Card className="bg-white/5 border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Lei / Normativa</th>
                                <th className="px-8 py-5">Requisito</th>
                                <th className="px-8 py-5">{t("municipal.municipalplaceholders.evidnciaNoSistema", `Evidência`)}</th>
                                <th className="px-8 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data?.matrix?.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6 font-black text-white tracking-tight">{item.law}</td>
                                    <td className="px-8 py-6 text-slate-400 font-medium text-sm">{item.requirement}</td>
                                    <td className="px-8 py-6 text-slate-500 text-[10px] font-medium border-l border-white/5">{item.evidence}</td>
                                    <td className="px-8 py-6 text-center">
                                        {item.compliant ? (
                                            <Badge variant="glass" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black uppercase">Ok</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 text-[9px] font-black uppercase">Pendente</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
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

    if (loading) return <PageLoader message="Carregando preferências..." />;

    const TextInput = ({ label, field, placeholder, icon }: { label: string; field: string; placeholder?: string; icon?: React.ReactNode }) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                {icon} {label}
            </label>
            <input
                type="text"
                value={settings[field] || ""}
                onChange={e => updateField(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus:border-amber-500 transition-all outline-none text-white font-medium placeholder:opacity-20"
            />
        </div>
    );

    const TextArea = ({ label, field, placeholder, rows = 3 }: { label: string; field: string; placeholder?: string; rows?: number }) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <textarea
                value={settings[field] || ""}
                onChange={e => updateField(field, e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus:border-amber-500 transition-all outline-none text-white font-medium resize-none placeholder:opacity-20"
            />
        </div>
    );

    const NumberInput = ({ label, field, placeholder }: { label: string; field: string; placeholder?: string }) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <input
                type="number"
                value={settings[field] || ""}
                onChange={e => updateField(field, e.target.value ? Number(e.target.value) : null)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus:border-amber-500 transition-all outline-none text-white font-medium tabular-nums"
            />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">{t("municipal.municipalplaceholders.configuraesDaSecretaria", `Parâmetros Estratégicos`)}</h1>
                    <p className="text-slate-500 font-medium mt-2">
                        {t("municipal.municipalplaceholders.identidadeVisualContatoLocalizaoEParmetr", `Configurações globais de identidade e governança municipal`)}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl grid grid-cols-1 gap-8">
                {/* Identity */}
                <Card className="p-10 border-white/5 bg-white/5 space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-black">
                            <Building2 size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Identidade Institucional</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <TextInput label={t("municipal.municipalplaceholders.nomeDaSecretariaInstituio", `Entidade Gestora`)} field="name" placeholder="Ex: Secretaria de Cultura" icon={<Building2 size={14} />} />
                        <TextInput label={t("municipal.municipalplaceholders.endereoSede", `Endereço Sede`)} field="address" placeholder="Rua/Praça, Nº" icon={<MapPin size={14} />} />
                    </div>
                    
                    <TextArea label={t("municipal.municipalplaceholders.misso", `Diretriz de Missão`)} field="mission" placeholder="Descreva o propósito da instituição..." />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <TextInput label="CNPJ" field="cnpj" placeholder="00.000..." />
                        <TextInput label="Natureza" field="legalNature" placeholder="Pública" />
                        <TextInput label="Tipologia" field="typology" placeholder="Gestora" />
                        <NumberInput label="Fundação" field="foundationYear" placeholder="Ano" />
                    </div>
                </Card>

                {/* Integration & Tech */}
                <Card className="p-10 border-white/5 bg-white/5 space-y-8">
                     <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-black">
                            <Globe size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Canais Digitais</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TextInput label="Email Institucional" field="email" placeholder="gov@cidade.com" icon={<Mail size={14} />} />
                        <TextInput label="WhatsApp" field="whatsapp" placeholder="31 9..." icon={<Phone size={14} />} />
                        <TextInput label="Portal Transparência" field="website" placeholder="https://..." icon={<Globe size={14} />} />
                    </div>
                </Card>

                {/* Branding */}
                <Card className="p-10 border-white/5 bg-white/5 space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-black">
                            <Image size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Design System (White-Label)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Cor de Acento</label>
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                <input type="color" value={settings.primaryColor || "#f59e0b"} onChange={e => updateField("primaryColor", e.target.value)} className="h-10 w-10 bg-transparent cursor-pointer border-none" />
                                <span className="text-xs font-black text-white">{settings.primaryColor || "#f59e0b"}</span>
                            </div>
                         </div>
                    </div>
                </Card>

                <div className="flex justify-start">
                    <Button 
                        size="lg"
                        className="h-16 px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl"
                        onClick={handleSave} 
                        isLoading={saving}
                    >
                        {saving ? "Sincronizando..." : "Salvar Configurações"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
