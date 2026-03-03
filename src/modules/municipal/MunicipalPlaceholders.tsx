import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { Loader2, Plus, Building2, FileText, Calendar, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { toast } from "react-hot-toast";

export const MunicipalEquipments: React.FC = () => {
    const { tenantId } = useAuth();
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
                <Button leftIcon={<Plus size={18} />}>Novo Equipamento</Button>
            </div>

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
                                <FileText size={14} /> <span>12 Obras</span>
                            </div>
                            <Button variant="outline" className="text-xs h-8 px-3">Gerenciar</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MunicipalProjects: React.FC = () => {
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Projetos e Editais</h1>
                    <p className="text-slate-500">Monitoramento de execução física e financeira</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<FileText size={18} />}>Gerenciar Editais</Button>
                    <Button leftIcon={<Plus size={18} />}>Lançar Projeto Especial</Button>
                </div>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="text-amber-500" size={20} /> Editais Ativos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notices.filter(n => n.status !== 'DRAFT').map(notice => (
                        <div key={notice.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-900">{notice.title}</h4>
                                <p className="text-xs text-slate-500">{notice._count.projects} Projetos inscritos</p>
                            </div>
                            <ArrowRight className="text-slate-400" />
                        </div>
                    ))}
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
                                    <td className="px-6 py-4 text-slate-500 text-sm">{p.proponentId}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-amber-600 font-bold text-xs hover:underline">Detalhes</button>
                                    </td>
                                </tr>
                            ))}
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
        try {
            await api.put(`/tenants/${tenantId}/settings`, settings);
            toast.success("Configurações salvas!");
        } catch (error) {
            toast.error("Erro ao salvar");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-serif">Configurações da Secretaria</h1>
                <p className="text-slate-500">Identidade visual e parâmetros globais do município</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-2xl space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Secretaria / Instituição</label>
                        <input
                            type="text"
                            value={settings.name || ""}
                            onChange={e => setSettings({ ...settings, name: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:border-amber-500 transition-colors outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Endereço Sede</label>
                        <input
                            type="text"
                            value={settings.address || ""}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:border-amber-500 transition-colors outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cor Primária</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.primaryColor || "#f59e0b"}
                                    onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                    className="h-10 w-10 overflow-hidden rounded-lg cursor-pointer border-none"
                                />
                                <input
                                    type="text"
                                    value={settings.primaryColor || ""}
                                    onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cor Secundária</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.secondaryColor || "#1e293b"}
                                    onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })}
                                    className="h-10 w-10 overflow-hidden rounded-lg cursor-pointer border-none"
                                />
                                <input
                                    type="text"
                                    value={settings.secondaryColor || ""}
                                    onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })}
                                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </div>
            </div>
        </div>
    );
};
