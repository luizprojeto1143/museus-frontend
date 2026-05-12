import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useTerminology } from "../../../hooks/useTerminology";
import { 
  Card, 
  Button, 
  Badge, 
  AnimateIn 
} from "@/components/ui";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin, 
  Download, 
  FileText, 
  Calendar,
  Flame,
  ArrowUpRight,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  MousePointer2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface AnalyticsData {
  totalVisitors: number;
  recurringVisitors: number;
  averageAge: number;
  accessBySource: { qr: number; app: number; web: number };
  peakHours: Array<{ hour: number; count: number }>;
  hotWorks: Array<{ id: string; title: string; heat: number }>;
  hotTrails: Array<{ id: string; title: string; heat: number }>;
  hotEvents: Array<{ id: string; title: string; heat: number }>;
  visitorsByAge: Array<{ range: string; count: number }>;
  visitorsByDay: Array<{ date: string; count: number; recurring: number }>;
}

export const AdminAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const term = useTerminology();
  const { tenantId } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const loadAnalytics = React.useCallback(async () => {
    try {
      if (!tenantId) return;
      setLoading(true);
      const res = await api.get(`/analytics/advanced/${tenantId}?range=${dateRange}`);
      setData(res.data);
    } catch (err) {
      console.error("Erro ao carregar analytics", err);
      toast.error("Erro ao carregar dados analíticos");
    } finally {
      setLoading(false);
    }
  }, [tenantId, dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportCSV = () => {
    if (!data) return;
    const csv = [
      ["Data", "Visitantes", "Recorrentes"],
      ...data.visitorsByDay.map(d => [d.date, d.count, d.recurring])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${Date.now()}.csv`;
    a.click();
    toast.success("CSV exportado com sucesso!");
  };

  const handleExportPDF = async () => {
    try {
      toast.loading("Gerando PDF...", { id: 'pdf-export' });
      const response = await api.get("/reports/financial", {
        responseType: 'blob',
        params: {
          startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
          endDate: new Date().toISOString()
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_analitico_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Relatório PDF gerado!", { id: 'pdf-export' });
    } catch (error) {
      console.error("Erro ao baixar PDF", error);
      toast.error("Erro ao gerar PDF", { id: 'pdf-export' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-white/10 border-t-gold-400 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Compilando métricas...</p>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ['#D4AF37', '#71717a', '#18181b', '#3b82f6'];

  return (
    <AnimateIn className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
             <BarChart3 className="text-gold-400" size={32} />
             Inteligência & Dados
          </h1>
          <p className="text-slate-400 font-medium">
            Métricas avançadas de visitação e comportamento do público.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
             {(['7d', '30d', '90d'] as const).map((range) => (
               <button
                 key={range}
                 onClick={() => setDateRange(range)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === range ? 'bg-gold-400 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
               >
                 {range}
               </button>
             ))}
          </div>
          <Button variant="glass" onClick={handleExportPDF} className="rounded-2xl h-12 border-white/5">
             <FileText size={18} />
          </Button>
          <Button variant="glass" onClick={handleExportCSV} className="rounded-2xl h-12 border-white/5">
             <Download size={18} />
          </Button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[32px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <Users size={80} />
           </div>
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Total de Visitantes</p>
           <h3 className="text-4xl font-black text-white leading-none">
              {data.totalVisitors.toLocaleString()}
           </h3>
           <div className="mt-4 flex items-center gap-2 text-green-400">
              <ArrowUpRight size={16} />
              <span className="text-xs font-bold">+12.5% este mês</span>
           </div>
        </Card>

        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[32px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp size={80} />
           </div>
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Recorrência</p>
           <h3 className="text-4xl font-black text-white leading-none">
              {data.recurringVisitors.toLocaleString()}
           </h3>
           <p className="mt-4 text-xs font-bold text-slate-500">
              {((data.recurringVisitors / data.totalVisitors) * 100).toFixed(1)}% retornaram ao museu
           </p>
        </Card>

        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[32px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <MousePointer2 size={80} />
           </div>
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Idade Média</p>
           <h3 className="text-4xl font-black text-white leading-none">
              {data.averageAge} <span className="text-xl text-slate-600">anos</span>
           </h3>
           <p className="mt-4 text-xs font-bold text-slate-500">Perfil jovem/adulto</p>
        </Card>

        <Card className="p-6 bg-gold-400/5 border-gold-400/10 rounded-[32px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 text-gold-400">
              <PieChartIcon size={80} />
           </div>
           <p className="text-gold-400/60 font-black uppercase tracking-widest text-[10px] mb-2">Pico de Acesso</p>
           <h3 className="text-4xl font-black text-white leading-none">
              {data.peakHours.sort((a, b) => b.count - a.count)[0]?.hour}:00
           </h3>
           <p className="mt-4 text-xs font-bold text-gold-400/80">Horário de maior fluxo</p>
        </Card>
      </div>

      {/* main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 p-8 bg-black/20 border-white/5 rounded-[40px] space-y-8">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Fluxo de Visitantes</h3>
                <p className="text-slate-500 text-xs">Acompanhamento diário de tráfego</p>
             </div>
             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-gold-400">
                   <div className="w-2 h-2 rounded-full bg-gold-400"></div> Total
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                   <div className="w-2 h-2 rounded-full bg-slate-600"></div> Recorrentes
                </div>
             </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.visitorsByDay}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#4b5563', fontSize: 10, fontWeight: 800}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#4b5563', fontSize: 10, fontWeight: 800}} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="recurring" stroke="#4b5563" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Source Distribution */}
        <Card className="p-8 bg-black/20 border-white/5 rounded-[40px] space-y-8 flex flex-col">
           <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">Origem de Acesso</h3>
              <p className="text-slate-500 text-xs">Como os visitantes chegam até você</p>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={Object.entries(data.accessBySource).map(([key, value]) => ({ name: key.toUpperCase(), value }))}
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={10}
                       dataKey="value"
                     >
                       {Object.entries(data.accessBySource).map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Global</span>
                 <span className="text-2xl font-black text-white">100%</span>
              </div>
           </div>

           <div className="space-y-3">
              {Object.entries(data.accessBySource).map(([source, count], idx) => (
                <div key={source} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{source}</span>
                   </div>
                   <span className="text-sm font-bold text-white">{count}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Age Distribution */}
         <Card className="p-8 bg-black/20 border-white/5 rounded-[40px] space-y-8">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
               <Users className="text-gold-400" size={20} />
               Perfil por Idade
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.visitorsByAge}>
                     <XAxis 
                       dataKey="range" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#4b5563', fontSize: 10, fontWeight: 800}} 
                     />
                     <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.02)'}}
                        contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}
                     />
                     <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                        {data.visitorsByAge.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 2 ? '#D4AF37' : '#27272a'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Hot Items List */}
         <Card className="p-8 bg-black/20 border-white/5 rounded-[40px] space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                  <Flame className="text-orange-500" size={20} />
                  Top 5 Obras Mais Quentes
               </h3>
               <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Live Heatmap</Badge>
            </div>

            <div className="space-y-6">
               {data.hotWorks.slice(0, 5).map((work, index) => (
                 <div key={work.id} className="group flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-700">0{index + 1}</span>
                          <h4 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">{work.title}</h4>
                       </div>
                       <span className="text-xs font-black text-gold-400">{work.heat}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${work.heat}%` }}
                         transition={{ duration: 1, delay: index * 0.1 }}
                         className={`h-full rounded-full ${work.heat > 80 ? 'bg-orange-500' : 'bg-gold-400'}`}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </AnimateIn>
  );
};
