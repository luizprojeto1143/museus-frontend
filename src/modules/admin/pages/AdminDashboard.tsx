import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Calendar, Clock, MapPin, Ticket, ChevronRight, BarChart2, Users, Star, Layout, AlertTriangle, Sparkles, TrendingUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsCityMode } from "../../auth/TenantContext";
import { Card, AnimatedCounter, Button, Badge, AnimateIn } from "@/components/ui";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

type DashboardData = {
  visitorsThisMonth: number;
  topWorks: Array<{ id: string; title: string; visits: number }>;
  topTrails: Array<{ id: string; title: string; completions: number }>;
  topEvents: Array<{ id: string; title: string; views: number }>;
  totalQRScans: number;
  totalXPDistributed: number;
  weeklyGrowth: number;
  monthlyGrowth: number;

  visitsByDay: Array<{ date: string; count: number }>;
  visitsByWork: Array<{ workTitle: string; count: number }>;
  xpByCategory: Array<{ category: string; xp: number }>;
  accessBySource: { qr: number; app: number; map: number; trails: number };

  alerts: Array<{
    type: "warning" | "error" | "info";
    message: string;
    link?: string;
  }>;
  upcomingBookings: Array<{
    id: string;
    startTime: string;
    purpose: string;
    space: { name: string };
    user: { name: string };
  }>;
};

type UpcomingEvent = {
  id: string;
  title: string;
  startDate: string;
  location?: string;
  type?: string;
};

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId, name, role, hasPermission } = useAuth();
  const navigate = useNavigate();
  const isCityMode = useIsCityMode();
  const [data, setData] = useState<DashboardData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = React.useCallback(async () => {
    try {
      if (!tenantId) return;

      const [dashRes, eventsRes] = await Promise.all([
        api.get(`/analytics/dashboard/${tenantId}`),
        api.get("/events", { params: { tenantId, status: 'PUBLISHED', limit: 3 } })
      ]);

      setData(dashRes.data);
      setUpcomingEvents(eventsRes.data.data || []);
    } catch (err) {
      console.error("Erro ao carregar dashboard", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <AnimateIn className="space-y-12 pb-20">
        <div className="space-y-4">
           <div className="h-10 w-64 bg-white/5 rounded-2xl animate-pulse" />
           <div className="h-6 w-96 bg-white/5 rounded-xl animate-pulse opacity-50" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-8 h-32 bg-white/[0.02] border-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           <Card className="xl:col-span-1 h-[500px] bg-white/[0.02] border-white/5 rounded-[40px] animate-pulse" />
           <Card className="xl:col-span-2 h-[500px] bg-white/[0.02] border-white/5 rounded-[40px] animate-pulse" />
        </div>
      </AnimateIn>
    );
  }

  if (!data) {
    return (
      <AnimateIn className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="relative">
           <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
           <AlertTriangle size={80} className="text-red-500 relative z-10" />
        </div>
        <div className="text-center space-y-2">
           <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{t("admin.dashboard.sync_interrupted", "Sincronização Interrompida")}</h2>
           <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">{t("admin.dashboard.sync_error", "Não foi possível estabelecer conexão com o centro de comando estratégico.")}</p>
        </div>
        <Button 
          onClick={() => { setLoading(true); loadDashboard(); }}
          className="h-14 px-10 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest shadow-xl shadow-red-500/20"
          leftIcon={<Zap size={18} />}
        >
          {t("admin.dashboard.retry_connection", "Tentar Reconexão")}
        </Button>
      </AnimateIn>
    );
  }

  // Dashboard customization logic
  const canSeeAnalytics = hasPermission("view_analytics");
  const canSeeEvents = hasPermission("manage_events");
  const canSeeGamification = hasPermission("manage_gamification");
  const canSeeScanner = hasPermission("manage_scanner");
  const canSeeOps = hasPermission("manage_operations");

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge variant="glass" className={`${isCityMode ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' : 'text-gold-400 border-gold-400/20 bg-gold-400/5'} px-4 py-1.5`}>
            <Zap className="mr-2" size={14} />
            {t("admin.dashboard.commandCenter")}
          </Badge>
          <div className="flex flex-col">
            <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{t("admin.dashboard.welcomeBack", "Bem-vindo de volta")}, {name} • {role === 'master' ? t("admin.dashboard.board", "Diretoria") : role === 'admin' ? t("admin.dashboard.admin", "Administrador") : t("admin.dashboard.tech_team", "Equipe Técnica")}</span>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
              {t("admin.dashboard.title_dashboard", "Dashboard")} <span className={isCityMode ? 'text-blue-400' : 'text-gold-400'}>{t("admin.dashboard.title_strategic", "Estratégico")}</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-lg leading-relaxed">
            {t("admin.dashboard.subtitle", "Visão consolidada da operação, engajamento e métricas de impacto do museu.")}
          </p>
        </div>
        {(role === 'admin' || role === 'master') && (
          <div className="flex gap-3">
              <Button
                variant="glass"
                className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                onClick={() => navigate("/admin/configuracoes")}
              >
                 {t("admin.dashboard.configSpace")}
              </Button>
          </div>
        )}
      </header>

      {/* ROADMAP ANNOUNCEMENT */}
      {hasPermission("manage_roadmap") && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group p-1 w-full rounded-[48px] bg-gradient-to-r from-blue-500/10 via-gold-400/10 to-blue-500/10 overflow-hidden"
        >
          <div className="relative z-10 p-10 md:p-14 rounded-[47px] bg-black/40 backdrop-blur-3xl border border-white/5 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 rounded-[32px] bg-gold-400/10 flex items-center justify-center text-5xl shadow-inner border border-gold-400/20 group-hover:scale-110 transition-transform">
                <Sparkles className="text-gold-400" size={40} />
            </div>
            <div className="flex-1 text-center md:text-left">
                <span className="bg-gold-400/20 text-gold-400 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block border border-gold-400/20">
                  {t("admin.dashboard.next_update", "PROXIMA ATUALIZAÇÃO 2026")}
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{t("admin.dashboard.roadmap.title")}</h2>
                <p className="text-slate-400 font-medium text-sm mt-2 max-w-2xl leading-relaxed">
                  {t("admin.dashboard.roadmap.desc", "Estamos finalizando o módulo de Realidade Aumentada e Integração Web3 para o acervo digital. Participe da nossa comunidade de beta testers.")}
                </p>
            </div>
              <button 
                className="px-10 h-14 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-400/5 active:scale-95 flex-shrink-0"
                onClick={() => navigate("/admin/comunidade")}
              >
                {t("admin.dashboard.roadmap.button")}
              </button>
          </div>
        </motion.div>
      )}

      {/* INDICADORES PRINCIPAIS */}
      <motion.div 
        variants={staggerContainer(0.1, 0.2)}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: t("admin.dashboard.stats.visitors"), value: data.visitorsThisMonth, icon: Users, color: 'text-blue-400', show: canSeeAnalytics },
          { label: t("admin.dashboard.stats.qrScans"), value: data.totalQRScans, icon: Ticket, color: 'text-purple-400', show: canSeeScanner || canSeeGamification },
          { label: t("admin.dashboard.stats.xpDistributed"), value: data.totalXPDistributed, icon: Star, color: 'text-gold-400', show: canSeeGamification },
          { label: t("admin.dashboard.stats.monthlyGrowth"), value: data.monthlyGrowth, icon: TrendingUp, color: 'text-green-400', unit: '%', show: canSeeAnalytics },
        ].filter(s => s.show).map((stat, i) => (
          <motion.div key={i} variants={staggerItem}>
            <Card
              className="p-8 border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all rounded-[32px] overflow-hidden relative"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-white/20 transition-all ${stat.color}`}>
                    <stat.icon size={20} />
                 </div>
              </div>
              <div className="flex flex-col relative z-10">
                 <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 leading-none">{stat.label}</span>
                 <div className="text-4xl font-black text-white tracking-tighter leading-none flex items-baseline">
                   {stat.unit === '%' && <span className="mr-1 opacity-50 text-green-400">+</span>}
                   <AnimatedCounter value={stat.value} />
                   {stat.unit && <span className="ml-1 text-sm opacity-50 text-green-400">{stat.unit}</span>}
                 </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* SIDEBAR COL */}
        <div className="xl:col-span-4 space-y-8">
           {canSeeEvents && (
              <section className="card border-white/5 bg-white/[0.02] p-8 rounded-[40px] overflow-hidden relative">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <Calendar size={18} className="text-gold-400" />
                      {t("admin.dashboard.sections.agenda")}
                    </h2>
                      <button className="p-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors" onClick={() => navigate("/admin/eventos")}>
                        <ChevronRight size={16} className="text-slate-500" />
                      </button>
                  </div>

                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-6">
                      {upcomingEvents.map((ev) => (
                        <div key={ev.id} className="flex gap-5 group items-center">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-gold-400 group-hover:text-slate-950 transition-all duration-300">
                              <span className="text-lg font-black leading-none">{new Date(ev.startDate).getDate()}</span>
                              <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">{new Date(ev.startDate).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold text-sm truncate group-hover:text-gold-400 transition-colors">{ev.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5"><Clock size={10} className="text-gold-400/50" /> {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span className="flex items-center gap-1.5"><MapPin size={10} className="text-gold-400/50" /> {ev.location || 'Interno'}</span>
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs font-medium italic py-10 text-center bg-black/20 rounded-3xl border border-white/5">{t("admin.dashboard.sections.noEvents")}</p>
                  )}
              </section>
           )}

           {canSeeOps && (
              <section className="card border-gold-400/10 bg-gold-400/[0.02] p-8 rounded-[40px]">
                  <h2 className="text-lg font-black text-gold-400 tracking-tight mb-6 flex items-center gap-2">
                    <Clock size={18} />
                    {t("admin.dashboard.sections.bookings")}
                  </h2>
                  <div className="space-y-4">
                    {data.upcomingBookings?.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="p-5 rounded-3xl bg-black/20 border border-white/5 hover:border-gold-400/30 transition-all group">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gold-400/60 mb-2">
                              <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                              <span>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <h4 className="text-white font-bold text-sm truncate">{booking.purpose}</h4>
                          <p className="text-slate-500 text-[10px] mt-1 font-medium">{booking.space.name}</p>
                        </div>
                    ))}
                    {!data.upcomingBookings?.length && <p className="text-slate-600 text-xs italic py-8 text-center">{t("admin.dashboard.sections.noBookings")}</p>}
                  </div>
              </section>
           )}
        </div>

        {/* ANALYTICS COL */}
        <div className="xl:col-span-8 space-y-8">
           {canSeeAnalytics && (
              <>
                <div className="card p-0 overflow-hidden border-white/5 bg-white/[0.02] rounded-[48px]">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between">
                      <h2 className="text-xl font-black text-white tracking-tight">{t("admin.dashboard.sections.engagement")}</h2>
                      <BarChart2 className="text-slate-600" size={24} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5">
                      <div className="p-10 space-y-8">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{t("admin.dashboard.top_works", "Top Obras do Mês")}</h3>
                          <div className="space-y-6">
                            {data.topWorks.slice(0, 5).map((work, idx) => (
                              <div key={work.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-slate-700 w-4">{idx + 1}</span>
                                    <span className="text-slate-300 font-bold text-sm group-hover:text-gold-400 transition-colors cursor-pointer truncate max-w-[180px]">{work.title}</span>
                                </div>
                                <Badge variant="glass" className="text-[9px] font-black border-gold-400/20 text-gold-400">{work.visits} VISITS</Badge>
                              </div>
                            ))}
                          </div>
                      </div>
                      <div className="p-10 bg-white/[0.01] space-y-8">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{t("admin.dashboard.access_by_source", "Acessos por Origem")}</h3>
                          <div className="space-y-6">
                            {Object.entries(data.accessBySource).map(([source, count]) => (
                              <div key={source} className="space-y-3">
                                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                                      {source}
                                    </span>
                                    <span className="text-white">{count}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(count / Math.max(...Object.values(data.accessBySource))) * 100}%` }}
                                      className="h-full bg-gold-400" 
                                    />
                                  </div>
                              </div>
                            ))}
                          </div>
                      </div>
                    </div>
                </div>

                <div className="card p-10 border-white/5 bg-white/[0.02] rounded-[48px] relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-xl font-black text-white tracking-tight">{t("admin.dashboard.visibility_growth", "Crescimento de Visibilidade")}</h2>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px] font-black uppercase tracking-widest">{t("admin.dashboard.vs_previous", "+12% vs anterior")}</Badge>
                    </div>
                    <div className="flex items-end gap-3 h-48">
                      {data.visitsByDay.slice(-14).map((day, idx) => (
                        <div key={idx} className="flex-1 group relative flex flex-col items-center h-full justify-end">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${(day.count / (Math.max(...data.visitsByDay.map(d => d.count)) || 1)) * 100}%` }}
                              className="w-full bg-white/10 group-hover:bg-gold-400 transition-all rounded-t-xl relative" 
                            >
                              <div className="absolute inset-0 bg-gold-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 bg-white text-slate-950 text-[9px] font-black px-2 py-1 rounded shadow-xl pointer-events-none">
                              {day.count} v
                            </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[9px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5 pt-6">
                      <span>{data.visitsByDay[0]?.date || t("admin.dashboard.start", "Início")}</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gold-400" /> {t("admin.dashboard.visit_flow", "Fluxo de Visitas (Últimos 14 dias)")}</span>
                      <span>{data.visitsByDay[data.visitsByDay.length - 1]?.date || t("admin.dashboard.today", "Hoje")}</span>
                    </div>
                </div>
              </>
           )}
           
            {!canSeeAnalytics && !canSeeEvents && !canSeeOps && (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[48px]">
                 <Layout size={48} className="text-zinc-700 mx-auto mb-4" />
                 <p className="text-zinc-500 font-bold tracking-tight">{t("admin.dashboard.focused_access", "Seu painel está configurado para acesso focado em tarefas específicas.")}</p>
                 <p className="text-zinc-600 text-xs mt-1">{t("admin.dashboard.use_sidebar", "Use a barra lateral para acessar suas ferramentas.")}</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
