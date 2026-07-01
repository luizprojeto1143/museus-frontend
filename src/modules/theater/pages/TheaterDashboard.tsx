import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

import { 
    Users, Ticket, TrendingUp, Calendar, Layout, 
    Music, Sparkles, Mic2, Tv, Map as MapIcon, 
    Clapperboard, UserPlus, Info, ArrowUpRight, Play
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../../../api/client";
import { Button } from "../../../components/ui";

import { theaterApi } from "../../../api/theater";
import { useTranslation } from "react-i18next";

export const TheaterDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTickets: 0,
        revenue: 0,
        occupancy: 0,
        activeSessions: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await theaterApi.getAnalytics();
                setStats(res.data);
            } catch (err: unknown) {
                logger.error("Error fetching theater stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const seats = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        status: i % 3 === 0 ? "occupied" : "available",
        type: i < 20 ? "vip" : "standard"
    }));

    if (loading) return <div className="p-10 text-center animate-pulse text-red-500 font-black italic">{t("theater.dashboard.loading", "Preparando o Palco...")}</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ═══ THEATER HERO ═══════════ */}
            <header className="relative p-12 rounded-[48px] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-slate-900 z-0"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('/placeholder-image.jpg')] bg-cover bg-center z-0 group-hover:scale-105 transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">{t("theater.dashboard.subtitle", "Stage Control Center")}</span>
                        <h1 className="text-6xl font-black text-white tracking-tighter italic">{t("theater.dashboard.title", "O Fantasma da Ópera")}</h1>
                        <p className="text-slate-400 font-medium mt-4 max-w-xl leading-relaxed text-lg">
                            {t("theater.dashboard.next_session_in", "Próxima sessão em")} <strong className="text-white">2h 15min</strong>. {t("theater.dashboard.tech_status", "Status técnico:")} <span className="text-green-400 font-bold uppercase tracking-widest text-xs">{t("theater.dashboard.status_ready", "Ready for Curtain Call")}</span>
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-7 rounded-[32px] font-black italic shadow-2xl shadow-red-600/20 flex items-center gap-3">
                            <Play size={20} fill="currentColor" /> {t("theater.dashboard.open_doors", "Abrir Portas")}
                        </Button>
                    </div>
                </div>
            </header>

            {/* ═══ QUICK ANALYTICS ═════════ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
                {[
                    { label: t("theater.dashboard.tickets_sold", "Ingressos Vendidos"), val: stats.totalTickets, icon: <Ticket />, color: "text-red-400", bg: "bg-red-500/10" },
                    { label: t("theater.dashboard.total_revenue", "Receita Total"), val: `R$ ${stats.revenue.toLocaleString()}`, icon: <TrendingUp />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: t("theater.dashboard.avg_occupancy", "Ocupação Média"), val: `${stats.occupancy}%`, icon: <Users />, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: t("theater.dashboard.active_sessions", "Sessões Ativas"), val: stats.activeSessions, icon: <Clapperboard />, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((item, idx) => (
                    <div key={idx} className="premium-glass p-8 rounded-[40px] border-white/5 glow-hover">
                        <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                            {item.icon}
                        </div>
                        <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">{item.label}</h3>
                        <p className="text-3xl font-black text-white tracking-tighter">{item.val}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ═══ INTERACTIVE SEAT MAP PREVIEW ═════════ */}
                <div className="lg:col-span-2 premium-glass p-10 rounded-[48px] border-white/5">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-white italic">{t("theater.dashboard.seat_map", "Mapa de Assentos")}</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{t("theater.dashboard.session_today", "Sessão: Hoje, 20h00")}</p>
                        </div>
                        <div className="flex gap-4">
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <div className="w-3 h-3 bg-red-500 rounded-sm" /> {t("theater.dashboard.seat_occupied", "Ocupado")}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <div className="w-3 h-3 bg-white/10 rounded-sm border border-white/20" /> {t("theater.dashboard.seat_free", "Livre")}
                             </div>
                        </div>
                    </div>

                    <div className="w-full h-8 bg-gradient-to-b from-slate-800 to-transparent rounded-full mb-12 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[1em] ml-[1em]">{t("theater.dashboard.stage", "PALCO")}</span>
                    </div>

                    <div className="grid grid-cols-10 gap-3">
                        {seats.map(seat => (
                            <motion.div
                                key={seat.id}
                                whileHover={{ scale: 1.2 }}
                                className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all border
                                    ${seat.status === 'occupied' 
                                        ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                                        : 'bg-white/5 border-white/10 text-slate-600 hover:border-white/30'}
                                    ${seat.type === 'vip' ? 'ring-2 ring-gold-500/30' : ''}
                                `}
                            >
                                <Users size={12} className={seat.status === 'occupied' ? 'opacity-100' : 'opacity-20'} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                        <div className="flex gap-8">
                            <div>
                                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{t("theater.dashboard.available", "Disponíveis")}</span>
                                <span className="text-xl font-black text-white">18</span>
                            </div>
                            <div>
                                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{t("theater.dashboard.reserved", "Reservados")}</span>
                                <span className="text-xl font-black text-white">42</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="text-[10px] px-8 rounded-2xl">{t("theater.dashboard.manage_batches", "Gerenciar Lotes")}</Button>
                    </div>
                </div>

                {/* ═══ BACKSTAGE FEED & CAST ═════════ */}
                <div className="space-y-8">
                    <div className="premium-glass p-8 rounded-[48px] border-red-500/20 bg-red-500/5">
                        <h3 className="text-lg font-black text-white italic mb-6 flex items-center gap-3">
                            <Mic2 className="text-red-500" /> {t("theater.dashboard.backstage_live", "Backstage Live")}
                        </h3>
                        <div className="space-y-6">
                            {[
                                { msg: t("theater.dashboard.msg_lighting", "Iluminação: Canal 4 ok"), time: "10m ago", status: "ok" },
                                { msg: t("theater.dashboard.msg_actor", "Aviso: Ator Principal no local"), time: "25m ago", status: "info" },
                                { msg: t("theater.dashboard.msg_mic", "Urgente: Microfone de lapela 2 falhando"), time: "40m ago", status: "warn" },
                            ].map((feed, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`w-1 h-10 rounded-full ${feed.status === 'warn' ? 'bg-red-500' : 'bg-green-500'} opacity-40`} />
                                    <div>
                                        <p className="text-xs font-bold text-white leading-tight">{feed.msg}</p>
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{feed.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-glass p-8 rounded-[48px] border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-white italic">{t("theater.dashboard.cast_crew", "Elenco & Crew")}</h3>
                            <UserPlus size={18} className="text-slate-500 cursor-pointer hover:text-white" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Erik Destler", role: t("theater.dashboard.role_protagonist", "Protagonista"), img: "E" },
                                { name: "Christine Daaé", role: t("theater.dashboard.role_soprano", "Soprano"), img: "C" },
                                { name: "Raoul de Chagny", role: t("theater.dashboard.role_tenor", "Tenor"), img: "R" },
                                { name: "Madame Giry", role: t("theater.dashboard.role_choreographer", "Coreógrafa"), img: "M" },
                            ].map((person, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-[28px] hover:bg-white/5 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-black flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform shadow-xl">
                                        {person.img}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white">{person.name}</p>
                                        <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">{person.role}</p>
                                    </div>
                                    <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
