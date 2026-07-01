import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
    Loader2, 
    Plus, 
    Building2, 
    FileText, 
    Calendar, 
    Users, 
    Star, 
    ArrowRight, 
    MapPin, 
    Globe, 
    Phone, 
    Mail, 
    Clock, 
    Image, 
    Shield, 
    Hash, 
    LayoutDashboard, 
    Settings,
    ArrowUpRight,
    Search,
    Activity,
    Compass
} from "lucide-react";
import { 
    Button, 
    Badge, 
    AnimateIn, 
    Card 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export const MunicipalEquipments: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const navigate = useNavigate();
    const [equipments, setEquipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchEquipments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tenants?parentId=${tenantId}`);
            setEquipments(res.data);
        } catch (error) {
            logger.error(error);
            toast.error(t("municipal.equipments.error_load", "Erro ao carregar rede de equipamentos."));
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    const filteredEquipments = equipments.filter(eq => 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("municipal.equipments.loading", "Mapeando Rede Cultural...")}</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {t("municipal.equipments.title_equipments", "Equipamentos")} <span className="text-emerald-500">{t("municipal.equipments.title_cultural", "Culturais")}</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">{t("municipal.equipments.subtitle", "Gestão e monitoramento da rede municipal de museus e centros culturais.")}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={t("municipal.equipments.search_placeholder", "Buscar unidade...")}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <Button
                        size="lg"
                        className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/10"
                        leftIcon={<Plus size={18} />}
                        onClick={() => toast(t("municipal.equipments.create_error", "Apenas Master Admins podem criar novos equipamentos."), { icon: "🛡️" })}
                    >
                        {t("municipal.equipments.new_equipment", "Novo Equipamento")}
                    </Button>
                </div>
            </div>

            {/* Content */}
            {filteredEquipments.length === 0 ? (
                <Card className="py-32 text-center bg-white/[0.02] border-white/5 rounded-[48px] border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 size={40} className="text-slate-700" />
                    </div>
                    <h3 className="text-xl font-black text-slate-600 uppercase tracking-widest">{t("municipal.equipments.empty_network", "Rede Vazia")}</h3>
                    <p className="text-slate-500 text-sm mt-2">{t("municipal.equipments.empty_network_desc", "Nenhum equipamento cultural foi vinculado à sua jurisdição.")}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEquipments.map((eq, idx) => (
                        <motion.div
                            key={eq.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="h-full flex flex-col p-8 bg-white/[0.02] border-white/5 rounded-[40px] group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                <div className="relative z-10 flex flex-col h-full space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 bg-emerald-600/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                            <Building2 size={28} />
                                        </div>
                                        <Badge variant="glass" className="bg-white/5 text-slate-500 border-white/5 uppercase text-[8px] font-black tracking-widest px-3 py-1">
                                            {eq.type || t("municipal.equipments.cultural_unit", "Unidade Cultural")}
                                        </Badge>
                                    </div>
                                    
                                    <div className="space-y-2 flex-1">
                                        <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors leading-tight">
                                            {eq.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-widest">
                                            <MapPin size={14} className="text-emerald-500/50" />
                                            {eq.address || t("municipal.equipments.no_location", "Localização não informada")}
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 pt-4">
                                            {eq.mission || t("municipal.equipments.no_mission", "Nenhuma missão institucional cadastrada para este equipamento.")}
                                        </p>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t("municipal.equipments.active_collection", "Acervo Ativo")}</span>
                                            <span className="text-lg font-black text-white">{eq._count?.works ?? 0} <span className="text-xs text-slate-500">{t("municipal.equipments.items", "itens")}</span></span>
                                        </div>
                                        <Button
                                            variant="glass"
                                            className="h-12 px-6 rounded-2xl bg-white/5 border-white/5 text-emerald-400 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                                            onClick={async () => {
                                                const loadingToast = toast.loading(t("municipal.equipments.switching_context", "Trocando contexto e registrando auditoria..."));
                                                try {
                                                    await api.post('/auth/switch-tenant', { targetTenantId: eq.id });
                                                    
                                                    // Armazenar localmente caso o frontend precise do tenant original depois (opcional)
                                                    localStorage.setItem("cultura_viva_switch_tenantId", eq.id);
                                                    
                                                    toast.success(t("municipal.equipments.context_switched", "Contexto alterado com sucesso! Redirecionando..."), { id: loadingToast });
                                                    
                                                    // Redirecionamento completo da página (força recarregar auth context e atualizar session no front)
                                                    window.location.href = "/admin";
                                                } catch (err) {
                                                    toast.error(t("municipal.equipments.switch_failed", "Falha ao trocar contexto. Sem permissão ou erro de servidor."), { id: loadingToast });
                                                }
                                            }}
                                        >
                                            {t("municipal.equipments.manage", "Gerenciar")} <ArrowUpRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Background Decorative Icon */}
                                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                    <Compass size={140} />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Info Footer */}
            <Card className="p-10 bg-gradient-to-r from-emerald-600/5 to-transparent border-emerald-500/10 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                    <Activity size={40} />
                </div>
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-black text-white italic">{t("municipal.equipments.real_time_monitoring", "Monitoramento em Tempo Real")}</h3>
                    <p className="text-slate-500 text-sm max-w-2xl font-medium leading-relaxed">
                        {t("municipal.equipments.monitoring_desc", "Como Secretário, você tem visão administrativa sobre todos os equipamentos da rede. Utilize o botão \"Gerenciar\" para atuar diretamente no acervo e exposições de cada unidade.")}
                    </p>
                </div>
                <div className="shrink-0">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2">
                        {t("municipal.equipments.approved_network", "Rede Homologada")}
                    </Badge>
                </div>
            </Card>
        </AnimateIn>
    );
};
