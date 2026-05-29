import React, { useState, useEffect } from "react";
import { 
    Zap, Music, Tv, Wind, 
    Mic2, Play, Pause, SkipForward,
    AlertTriangle, MessageSquare, Clock,
    Monitor, Radio, Volume2, Sparkles, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui";
import { toast } from "react-hot-toast";
import { theaterApi } from "../../../api/theater";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TheaterCueMaster: React.FC = () => {
    const { t } = useTranslation();
    const { id: sessionId } = useParams();
    const [activeCue, setActiveCue] = useState<string | null>(null);
    const [status, setStatus] = useState("STANDBY");
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [cues, setCues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCues = async () => {
        if (!sessionId) return;
        try {
            const res = await theaterApi.getCues(sessionId);
            setCues(res.data);
        } catch (err) {
            toast.error(t("theater.cuemaster.load_error", "Erro ao carregar cues"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCues();
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, [sessionId]);

    const triggerCue = (id: string) => {
        setActiveCue(id);
        toast.success(t("theater.cuemaster.cue_triggered", "Cue disparado!"), {
            icon: '⚡',
            style: { borderRadius: '20px', background: '#333', color: '#fff' }
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4">
            {/* ═══ TECHNICAL CONSOLE HEADER ═══════════ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-black/60 p-10 rounded-[48px] border border-red-500/10 shadow-2xl">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-3 h-3 rounded-full ${status === 'GO' ? 'bg-red-500 animate-ping' : 'bg-gold-500'}`} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{t("theater.cuemaster.unit_name", "Technical Control Unit")}</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">{t("theater.cuemaster.title", "Cue Master Pro")}</h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <Activity size={14} className="text-red-500" /> {t("theater.cuemaster.latency", "Latência do Sistema:")} <strong className="text-white">12ms</strong> • {t("theater.cuemaster.nodes", "Nodes Online:")} <strong className="text-white">14/14</strong>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-6xl font-black text-white tracking-tighter font-mono">{time}</p>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2">{t("theater.cuemaster.stage_time", "Local Stage Time")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ═══ MASTER CONTROLS ═════════ */}
                <div className="space-y-6">
                    <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-6">
                        <Button 
                            onClick={() => setStatus(status === "GO" ? "STANDBY" : "GO")}
                            className={`w-full py-12 rounded-[32px] font-black text-2xl italic transition-all ${status === 'GO' ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)] animate-pulse' : 'bg-white/10 text-white hover:bg-red-600'}`}
                        >
                            {status === "GO" ? "STOP / ABORT" : "READY / STANDBY"}
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" className="py-6 rounded-2xl flex flex-col gap-1">
                                <SkipForward size={18} /> <span className="text-[9px] font-black uppercase">Next</span>
                            </Button>
                            <Button variant="secondary" className="py-6 rounded-2xl flex flex-col gap-1">
                                <AlertTriangle size={18} className="text-gold-500" /> <span className="text-[9px] font-black uppercase">Panic</span>
                            </Button>
                        </div>
                    </div>

                    <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-6">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Monitor size={14} /> System Health
                         </h4>
                         <div className="space-y-4">
                            {[
                                { label: "Lighting Desk", val: 98 },
                                { label: "Sound Array", val: 100 },
                                { label: "Stage Automation", val: 85 },
                            ].map(sys => (
                                <div key={sys.label} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-slate-400">{sys.label}</span>
                                        <span className="text-white">{sys.val}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600" style={{ width: `${sys.val}%` }} />
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                {/* ═══ CUE LIST ═════════ */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="premium-glass p-10 rounded-[48px] border-white/5">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-white italic flex items-center gap-3">
                                <Zap className="text-red-500 fill-red-500" /> {t("theater.cuemaster.cue_list", "Cue List:")} {sessionId ? t("theater.cuemaster.active_session", "Sessão Ativa") : t("theater.cuemaster.select_session", "Selecione uma Sessão")}
                            </h3>
                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("theater.cuemaster.console_backstage", "Console Backstage")}</div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-20 text-white font-black italic animate-pulse">{t("theater.cuemaster.syncing", "Sincronizando Backstage...")}</div>
                        ) : cues.length === 0 ? (
                            <div className="text-center p-20 border border-dashed border-white/10 rounded-[32px]">
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t("theater.cuemaster.no_cues", "Nenhum Cue programado para esta sessão.")}</p>
                                <Button variant="secondary" className="mt-4 px-8">{t("theater.cuemaster.program_cue", "Programar Primeiro Cue")}</Button>
                            </div>
                        ) : (
                            <div className="space-y-4 relative">
                                {/* ACTIVE CUE INDICATOR LINE */}
                                <div className="absolute left-[-1.5rem] w-1 h-full bg-white/5 rounded-full" />
                                
                                {cues.map((cue, idx) => (
                                    <motion.div 
                                        key={cue.id}
                                        onClick={() => triggerCue(cue.id)}
                                        className={`
                                            group flex items-center gap-8 p-6 rounded-[32px] border transition-all cursor-pointer
                                            ${activeCue === cue.id 
                                                ? 'bg-red-600 border-red-600 text-white shadow-2xl shadow-red-600/30 scale-[1.02]' 
                                                : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/20'}
                                        `}
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center font-black text-xl font-mono opacity-50">
                                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                        </div>
                                        
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeCue === cue.id ? 'bg-white/20' : 'bg-black/20'}`}>
                                            {cue.type === 'LIGHT' ? <Zap size={20} /> : cue.type === 'SOUND' ? <Volume2 size={20} /> : <SkipForward size={20} />}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className={`text-lg font-black ${activeCue === cue.id ? 'text-white' : 'text-slate-200'}`}>{cue.label}</h4>
                                            <p className={`text-xs ${activeCue === cue.id ? 'text-red-100' : 'text-slate-500'} font-medium`}>{cue.desc}</p>
                                        </div>

                                        <div className="text-right">
                                            <p className={`text-xs font-black font-mono ${activeCue === cue.id ? 'text-white' : 'text-slate-600'}`}>{cue.time}</p>
                                            <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 ${activeCue === cue.id ? 'bg-white/20 text-white' : 'bg-black/20 text-slate-500'}`}>
                                                {cue.type}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="mt-12 flex justify-center">
                            <button className="flex items-center gap-2 text-slate-700 hover:text-red-500 transition-colors font-black text-[10px] uppercase tracking-widest">
                                <Play size={14} fill="currentColor" /> {t("theater.cuemaster.simulate_rehearsal", "Simular Ensaio Completo")}
                            </button>
                        </div>
                    </div>

                    {/* INTERCOM / COMMS */}
                    <div className="premium-glass p-8 rounded-[40px] border-blue-500/20 bg-blue-500/5 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                <Radio size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-black italic">{t("theater.cuemaster.intercom_dir", "Intercom: Direção Táctica")}</h4>
                                <p className="text-xs text-blue-300 font-medium">{t("theater.cuemaster.channel_active", "Canal 1: Ativo (3 participantes)")}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-[10px] font-black">JS</div>
                             <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-[10px] font-black">AM</div>
                             <div className="w-8 h-8 rounded-full bg-red-500 border border-white/10 flex items-center justify-center text-white text-[10px] font-black">DIR</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
