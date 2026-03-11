import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Calendar, Clock, MapPin, Ticket, ChevronRight, BarChart2, Users, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useIsCityMode } from "../../auth/TenantContext";

type DashboardData = {
  // ... (previous fields remain the same)
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
  const { tenantId } = useAuth();
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
      <div>
        <h1 className="section-title">{t("admin.dashboard.title")}</h1>
        {/* Skeleton Loader */}
        <div className="card-grid" style={{ marginBottom: "2rem" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card" style={{ minHeight: 90 }}>
              <div style={{
                width: "60%", height: 28, borderRadius: 6,
                background: "linear-gradient(90deg, rgba(212,175,55,0.08) 25%, rgba(212,175,55,0.15) 50%, rgba(212,175,55,0.08) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite"
              }} />
              <div style={{
                width: "40%", height: 14, borderRadius: 4, marginTop: 8,
                background: "rgba(212,175,55,0.06)"
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ minHeight: 200 }}>
              <div style={{ width: "50%", height: 20, borderRadius: 4, background: "rgba(212,175,55,0.1)", marginBottom: 16 }} />
              {[1, 2, 3].map(j => (
                <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ width: "60%", height: 14, borderRadius: 4, background: "rgba(212,175,55,0.06)" }} />
                  <div style={{ width: "20%", height: 14, borderRadius: 4, background: "rgba(212,175,55,0.08)" }} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="section-title">{t("admin.dashboard.title")}</h1>
        <div className="card" style={{
          textAlign: "center", padding: "3rem 2rem",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.05)"
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#ef4444", marginBottom: "0.5rem", fontSize: "1.2rem" }}>
            {t("common.error")}
          </h2>
          <p style={{ color: "var(--fg-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>{t("admin.dashboard.noFoiPossvelCarregarOsDadosDoDashboardVe", `
            Não foi possível carregar os dados do dashboard. Verifique sua conexão e tente novamente.
          `)}</p>
          <button
            className="btn btn-primary"
            onClick={() => { setLoading(true); loadDashboard(); }}
            aria-label="Tentar carregar dashboard novamente"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <span className={`${isCityMode ? 'text-blue-400' : 'text-gold-400'} font-black text-[10px] uppercase tracking-[0.3em] mb-4 block`}>
            Command Center
          </span>
          <h1 className="premium-title">{t("admin.dashboard.title")}</h1>
          <p className="text-slate-400 font-medium mt-4 max-w-lg leading-relaxed">
            Gestão estratégica de conteúdo, engajamento e logística institucional.
          </p>
        </div>
        <div className="flex gap-3">
           <button className="h-14 px-8 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all duration-300 shadow-xl shadow-white/5 active:scale-95">
              Configurar Espaço
           </button>
        </div>
      </header>

      {/* ROADMAP ANNOUNCEMENT - PREMIUM TREATMENT */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group p-1 w-full rounded-[40px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 overflow-hidden shadow-2xl shadow-blue-500/10"
      >
        <div className="relative z-10 p-10 rounded-[39px] bg-black/40 backdrop-blur-3xl border border-white/5 flex flex-col md:flex-row items-center gap-10">
           <div className="w-24 h-24 rounded-3xl bg-blue-500/20 flex items-center justify-center text-5xl shadow-inner border border-blue-500/30">
              🚀
           </div>
           <div className="flex-1 text-center md:text-left">
              <span className="bg-blue-500 text-white font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                ROADMAP MARÇO 2026
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">Cultura Viva Betim: Sistema Atualizado</h2>
              <p className="text-slate-400 font-medium text-sm mt-2 max-w-2xl leading-relaxed">
                Implementamos quizes, rotas dinâmicas e certificados automáticos para elevar o engajamento do seu público.
              </p>
           </div>
           <button 
             className="px-10 h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex-shrink-0"
             onClick={() => window.location.href = "/admin/comunidade"}
           >
              Ver Roadmap
           </button>
        </div>
      </motion.div>

      {/* INDICADORES PRINCIPAIS - DENSE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t("admin.dashboard.stats.visitors"), value: data.visitorsThisMonth, icon: Users, color: 'blue' },
          { label: t("admin.dashboard.stats.qrScans"), value: data.totalQRScans, icon: Ticket, color: 'purple' },
          { label: t("admin.dashboard.stats.xpDistributed"), value: data.totalXPDistributed.toLocaleString(), icon: Star, color: 'gold' },
          { label: t("admin.dashboard.stats.monthlyGrowth"), value: `+${data.monthlyGrowth}%`, icon: BarChart2, color: 'green' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card group hover:border-white/20"
          >
            <div className="flex justify-between items-start mb-6">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-white/20 transition-all`}>
                  <stat.icon size={18} className="text-slate-400 group-hover:text-white" />
               </div>
            </div>
            <div className="flex flex-col">
               <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</span>
               <span className="text-2xl font-black text-white tracking-tighter leading-none">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* AGENDA & BOOKINGS COL */}
        <div className="xl:col-span-1 space-y-8">
           <section className="card border-white/5 bg-black/20 p-8 rounded-[40px]">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-lg font-black text-white tracking-tight">🎨 Agenda Cultural</h2>
                 <button className="p-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10" onClick={() => window.location.href = "/admin/eventos"}>
                    <ChevronRight size={16} className="text-slate-400" />
                 </button>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="space-y-6">
                   {upcomingEvents.map((ev) => (
                     <div key={ev.id} className="flex gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center flex-shrink-0 group-hover:border-blue-500/30 transition-colors">
                           <span className="text-lg font-black text-white leading-none">{new Date(ev.startDate).getDate()}</span>
                           <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">{new Date(ev.startDate).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-white font-bold text-sm truncate">{ev.title}</h4>
                           <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1"><MapPin size={10} /> {ev.location || 'Online'}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs font-medium italic">Sem eventos próximos.</p>
              )}
           </section>

           <section className="card border-blue-500/10 bg-blue-500/[0.03] p-8 rounded-[40px]">
              <h2 className="text-lg font-black text-blue-400 tracking-tight mb-6">📅 Próximas Reservas</h2>
              <div className="space-y-4">
                 {data.upcomingBookings?.slice(0, 3).map((booking) => (
                   <div key={booking.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-400/70 mb-2">
                         <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                         <span>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h4 className="text-white font-bold text-xs">{booking.purpose}</h4>
                      <p className="text-slate-500 text-[10px] mt-1">{booking.space.name}</p>
                   </div>
                 ))}
                 {!data.upcomingBookings?.length && <p className="text-slate-600 text-xs italic">Sem reservas agendadas.</p>}
              </div>
           </section>
        </div>

        {/* ANALYTICS & CHARTS COL */}
        <div className="xl:col-span-2 space-y-8">
           <div className="card p-0 overflow-hidden border-white/5 bg-black/20 rounded-[40px]">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                 <h2 className="text-xl font-black text-white tracking-tight">🖼 Top Obras & Engajamento</h2>
                 <BarChart2 className="text-slate-600" size={20} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2">
                 <div className="p-10 space-y-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Acervo Mais Visitado</h3>
                    {data.topWorks.map((work, idx) => (
                      <div key={work.id} className="flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-700">{idx + 1}</span>
                            <span className="text-slate-300 font-bold text-sm hover:text-white transition-colors cursor-pointer">{work.title}</span>
                         </div>
                         <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{work.visits} v</span>
                      </div>
                    ))}
                 </div>
                 <div className="p-10 bg-white/[0.01] space-y-6 border-l border-white/5">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Acesso por Origem</h3>
                    <div className="space-y-6">
                       {Object.entries(data.accessBySource).map(([source, count]) => (
                         <div key={source} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                               <span>{source}</span>
                               <span className="text-white">{count}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${(count / Math.max(...Object.values(data.accessBySource))) * 100}%` }} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="card p-10 border-white/5 bg-black/20 rounded-[40px]">
              <h2 className="text-lg font-black text-white tracking-tight mb-8">📈 Crescimento Mensal</h2>
              <div className="flex items-end gap-2 h-48">
                 {data.visitsByDay.slice(-14).map((day, idx) => (
                   <div key={idx} className="flex-1 group relative flex flex-col items-center">
                      <div 
                        className="w-full bg-white/10 group-hover:bg-blue-500 transition-all rounded-t-lg shadow-lg group-hover:shadow-blue-500/20" 
                        style={{ height: `${(day.count / Math.max(...data.visitsByDay.map(d => d.count))) * 100}%` }} 
                      />
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[8px] font-black px-2 py-1 rounded whitespace-nowrap">
                         {day.count} visits
                      </div>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between mt-4 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                 <span>{data.visitsByDay[0]?.date}</span>
                 <span>Últimos 14 dias</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
