import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { BarChart3, Users, Eye, Star, BadgeCheck, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import "./MasterShared.css";

type TenantSummary = {
  tenantId: string;
  name: string;
  slug: string;
  worksCount: number;
  trailsCount: number;
  eventsCount: number;
  visitorsCount: number;
  visitsCount: number;
};

export const MasterDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    api
      .get("/analytics/tenants-summary")
      .then((res) => {
        setSummaries(res.data as TenantSummary[]);
      })
      .catch((err) => {
        console.error("Erro ao buscar analytics de tenants", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalVisitors = summaries.reduce((acc, s) => acc + (s.visitorsCount || 0), 0);
  const totalVisits = summaries.reduce((acc, s) => acc + (s.visitsCount || 0), 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HERO SECTION - REFINED */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">
            Intelligence Center
          </span>
          <h1 className="premium-title">Visão Geral</h1>
          <p className="text-slate-400 font-medium mt-4 max-w-lg leading-relaxed">
            Monitoramento global de performance, engajamento e logística cultural em tempo real.
          </p>
        </div>
        <div className="flex gap-3">
           <button className="h-14 px-8 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 active:scale-95">
              Exportar Relatório
           </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[1,2].map(i => <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* STATS GRID - HIGH FIDELITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.article 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative p-10 rounded-[40px] bg-gradient-to-br from-slate-900 to-black border border-white/5 overflow-hidden border-l-blue-500/50 border-l-4 shadow-2xl shadow-blue-500/5"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Users size={120} className="text-blue-500" />
              </div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20">
                  <Users className="text-blue-400" size={24} />
                </div>
                <h3 className="text-slate-500 font-black text-xs uppercase tracking-widest mb-2">{t("master.dashboard.totalVisitors")}</h3>
                <div className="flex items-baseline gap-4">
                  <p className="text-6xl font-black text-white tracking-tighter leading-none">
                    {totalVisitors.toLocaleString()}
                  </p>
                  <span className="text-blue-400 font-bold text-sm">+12%</span>
                </div>
                <p className="text-slate-500 text-sm mt-6 font-medium">
                  Visitantes únicos ativos em toda a rede cultural.
                </p>
              </div>
            </motion.article>

            <motion.article 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative p-10 rounded-[40px] bg-gradient-to-br from-slate-900 to-black border border-white/5 overflow-hidden border-l-purple-500/50 border-l-4 shadow-2xl shadow-purple-500/5"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Eye size={120} className="text-purple-500" />
              </div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20">
                  <Eye className="text-purple-400" size={24} />
                </div>
                <h3 className="text-slate-500 font-black text-xs uppercase tracking-widest mb-2">{t("master.dashboard.totalVisits")}</h3>
                <div className="flex items-baseline gap-4">
                  <p className="text-6xl font-black text-white tracking-tighter leading-none">
                    {totalVisits.toLocaleString()}
                  </p>
                  <span className="text-purple-400 font-bold text-sm">+8%</span>
                </div>
                <p className="text-slate-500 text-sm mt-6 font-medium">
                  Total de interações e visualizações de conteúdo.
                </p>
              </div>
            </motion.article>
          </div>

          {/* TABLE - MODERN LISTS */}
          <div className="card border-white/5 bg-black/40 backdrop-blur-3xl rounded-[40px] p-0 overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-black text-white tracking-tight">{t("master.dashboard.summaryByTenant")}</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Performance por Localidade</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                 <BarChart3 className="text-white/50" size={20} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("master.dashboard.table.client")}</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacidade</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("master.dashboard.table.visitors")}</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Trend</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {summaries.map((s) => (
                    <tr key={s.tenantId} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white/50 font-black text-xs border border-white/5">
                              {s.name.substring(0,2).toUpperCase()}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-white font-black text-sm">{s.name}</span>
                              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">{s.slug}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex gap-3 items-center">
                            <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
                               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ width: `${Math.min(100, (s.worksCount / 50) * 100)}%` }} />
                               </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-500">{s.worksCount} Itens</span>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-white font-black text-lg tracking-tighter">{s.visitorsCount.toLocaleString()}</span>
                      </td>
                      <td className="px-10 py-8">
                         <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20">
                            GROWING
                         </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <button className="p-3 rounded-xl bg-white/5 text-white/50 hover:bg-white hover:text-black transition-all border border-white/10 active:scale-95 group-hover:border-white/30">
                            <Eye size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
