import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { 
    Accessibility, 
    Upload, 
    CheckCircle, 
    Clock, 
    Video, 
    FileAudio, 
    AlertCircle, 
    X,
    Target,
    Activity,
    Globe,
    Zap,
    ShieldCheck,
    BarChart3,
    ArrowUpRight,
    Search,
    ChevronRight,
    Layers,
    Play,
    Heart,
    Eye,
    Ear,
    Languages,
    FileCheck,
    CloudUpload,
    Scan,
    Info
} from "lucide-react";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface AccessRequest {
    id: string;
    type: string;
    status: string;
    notes: string;
    workId: string;
    work: { title: string; id: string; imageUrl?: string; audioUrl?: string; description?: string };
    tenant: { name: string; slug: string };
    createdAt: string;
}

export const MasterAccessibilityRequests: React.FC = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
    const [librasFile, setLibrasFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/accessibility/master");
            setRequests(res.data);
        } catch (error) {
            toast.error("Erro na sincronização de conformidade LBI.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleFulfill = async () => {
        if (!selectedRequest) return;
        const needsLibras = selectedRequest.type === "LIBRAS" || selectedRequest.type === "BOTH";
        const needsAudio = selectedRequest.type === "AUDIO_DESC" || selectedRequest.type === "BOTH";

        if (needsLibras && !librasFile) return toast.error("Tradução em Libras obrigatória.");
        if (needsAudio && !audioFile) return toast.error("Audiodescrição obrigatória.");

        try {
            setUploading(true);
            setProgress(5);
            let uploadedLibrasUrl = "";
            let uploadedAudioUrl = "";

            if (librasFile) {
                const formData = new FormData();
                formData.append("file", librasFile);
                const res = await api.post("/upload/video", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (pEvent) => {
                        const p = pEvent.total ? Math.round((pEvent.loaded * 100) / pEvent.total) : 0;
                        setProgress(needsAudio ? Math.round(p / 2) : p);
                    }
                });
                uploadedLibrasUrl = res.data.url;
            }

            if (audioFile) {
                const formData = new FormData();
                formData.append("file", audioFile);
                const res = await api.post("/upload/audio", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (pEvent) => {
                        const p = pEvent.total ? Math.round((pEvent.loaded * 100) / pEvent.total) : 0;
                        setProgress(needsLibras ? 50 + Math.round(p / 2) : p);
                    }
                });
                uploadedAudioUrl = res.data.url;
            }

            setProgress(95);
            await api.post(`/accessibility/${selectedRequest.id}/fulfill`, {
                librasUrl: uploadedLibrasUrl,
                audioUrl: uploadedAudioUrl,
                masterNotes: "Asset auditado e homologado via Master Hub Elite."
            });

            setProgress(100);
            toast.success("Recurso de acessibilidade implantado!");
            setSelectedRequest(null);
            setLibrasFile(null);
            setAudioFile(null);
            setProgress(0);
            loadRequests();
        } catch (error) {
            toast.error("Falha no processamento da conformidade.");
        } finally {
            setUploading(false);
        }
    };

    const pendingRequests = useMemo(() => requests.filter(r => r.status === "PENDING"), [requests]);
    const completedRequests = useMemo(() => requests.filter(r => r.status === "COMPLETED"), [requests]);

    if (loading && requests.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Escaneando Pendências LBI...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                            Accessibility Compliance & LBI Registry
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Hub de <span className="text-blue-600">Inclusão</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Gerenciamento centralizado de conformidade legal e processamento de ativos acessíveis para a rede global.
                    </p>
                </div>
                
                <div className="flex gap-6">
                    <Card className="p-8 bg-blue-600/5 border-blue-500/10 rounded-[40px] flex items-center gap-8 group shadow-2xl relative overflow-hidden">
                        <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Accessibility size={32} />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest italic leading-none">Em Aberto</p>
                            <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                                <AnimatedCounter value={pendingRequests.length} />
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                    </Card>
                </div>
            </div>

            {/* Matrix & Stats Header */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-3 p-8 bg-white/[0.02] border-white/5 rounded-[40px] flex items-center gap-8 shadow-2xl relative overflow-hidden">
                    <div className="relative group flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por museu, obra ou tipo de acessibilidade solicitado..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 font-medium"
                        />
                    </div>
                </Card>
                <Card className="p-8 bg-emerald-500/5 border-emerald-500/10 rounded-[40px] flex flex-col justify-center gap-2 group relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Concluídos</p>
                        <CheckCircle size={24} className="text-emerald-500/30 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                        <AnimatedCounter value={completedRequests.length} />
                    </p>
                </Card>
            </div>

            {/* Compliance Matrix Table */}
            <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[48px] overflow-hidden shadow-2xl border-t-2 border-t-blue-500/20">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter italic uppercase">Fila de Atendimento Prioritário</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Audit Log: LBI Governance Level Required</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Origem / Node</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Obra & Contexto</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocolo LBI</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Registro Temporário</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ações Master</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {pendingRequests.map((req, idx) => (
                                    <motion.tr 
                                        key={req.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-white/[0.02] transition-colors cursor-default"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-blue-400 font-black text-xs group-hover:border-blue-500/30 transition-all shadow-xl">
                                                    {req.tenant.name.substring(0,2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-sm tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{req.tenant.name}</span>
                                                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic leading-none mt-1">/{req.tenant.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-sm italic group-hover:text-blue-200 transition-colors">{req.work.title}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Scan size={10} className="text-slate-600" />
                                                    <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">ID: {req.work.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border-none flex items-center gap-2 ${
                                                    req.type === 'LIBRAS' ? 'bg-blue-600/10 text-blue-400' : 
                                                    req.type === 'AUDIO_DESC' ? 'bg-amber-600/10 text-amber-500' : 'bg-indigo-600/10 text-indigo-400'
                                                }`}>
                                                    {req.type === 'LIBRAS' ? <Languages size={10} /> : req.type === 'AUDIO_DESC' ? <Ear size={10} /> : <Eye size={10} />}
                                                    {req.type === 'BOTH' ? 'Multimodal' : req.type}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 font-black text-[11px] tracking-tight flex items-center gap-2 uppercase">
                                                    <Clock size={12} className="text-slate-600" />
                                                    {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest ml-5">Sincronizado</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <Button
                                                onClick={() => {
                                                    setSelectedRequest(req);
                                                    setLibrasFile(null);
                                                    setAudioFile(null);
                                                    setProgress(0);
                                                }}
                                                className="h-12 px-8 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
                                            >
                                                <Upload size={16} className="mr-3" /> Processar
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {pendingRequests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30 gap-6">
                                            <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5">
                                                <ShieldCheck size={48} className="text-emerald-500" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">Conformidade total detectada na rede global</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Impact Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-10 bg-blue-600/[0.02] border-blue-500/10 rounded-[48px] flex items-center gap-8 group relative overflow-hidden shadow-2xl">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-[24px] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform border border-blue-500/20">
                        <Heart size={40} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none">Legado Social</h4>
                        <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed italic">Atendimento a normas de inclusão universal atinge recorde histórico no ecossistema MSV.</p>
                    </div>
                    <div className="absolute top-[-50%] right-[-10%] w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
                </Card>
                <Card className="p-10 bg-amber-500/[0.02] border-amber-500/10 rounded-[48px] flex items-center gap-8 group relative overflow-hidden shadow-2xl">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-[24px] flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform border border-amber-500/20">
                        <BarChart3 size={40} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none">Métrica LBI</h4>
                        <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed italic">84% de todo o acervo global já conta com recursos de acessibilidade homologados.</p>
                    </div>
                    <div className="absolute top-[-50%] right-[-10%] w-60 h-60 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
                </Card>
            </div>

            {/* FULFILL MODAL - Elite Lab UI */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0b1120] border border-white/10 w-full max-w-6xl rounded-[56px] shadow-[0_0_80px_rgba(37,99,235,0.15)] overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-12 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative">
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xl">
                                        <FileCheck size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Processar Conformidade</h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="glass" className="bg-blue-600/10 text-blue-400 border-none text-[9px] font-black uppercase tracking-widest">{selectedRequest.tenant.name}</Badge>
                                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">• {selectedRequest.work.title}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedRequest(null)} className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-white/5 group">
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                                {/* Left: Analysis Context */}
                                <div className="flex-1 p-12 border-r border-white/5 overflow-y-auto custom-scrollbar space-y-10 bg-[#0f172a]/40">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] italic">
                                        <Info size={16} /> Protocolo de Análise Técnica
                                    </div>

                                    {selectedRequest.work.imageUrl && (
                                        <div className="relative group rounded-[40px] overflow-hidden border-2 border-white/5 shadow-2xl">
                                            <img 
                                                src={selectedRequest.work.imageUrl} 
                                                alt={selectedRequest.work.title}
                                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-1000"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic leading-none mb-1">Obra em Análise</p>
                                                <p className="text-sm font-black text-white italic truncate">{selectedRequest.work.title}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] space-y-3 shadow-xl">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
                                                <Scan size={14} className="text-blue-500/50" /> Descrição Técnica
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
                                                "{selectedRequest.work.description || "Referência textual não fornecida pelo node de origem."}"
                                            </p>
                                        </Card>

                                        <Card className="p-8 bg-blue-600/5 border-blue-500/10 rounded-[32px] space-y-3 shadow-xl">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
                                                <Activity size={14} /> Notas do Solicitante
                                            </div>
                                            <p className="text-sm text-blue-300 font-black italic leading-relaxed">
                                                "{selectedRequest.notes || "Protocolo aberto sem observações específicas."}"
                                            </p>
                                        </Card>
                                    </div>
                                </div>

                                {/* Right: Deployment Center */}
                                <div className="flex-1 p-12 overflow-y-auto custom-scrollbar flex flex-col space-y-10">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-none px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl italic">
                                            Target: {selectedRequest.type === 'BOTH' ? 'Interpretação + Áudio' : selectedRequest.type}
                                        </Badge>
                                    </div>

                                    <div className="space-y-10">
                                        {(selectedRequest.type === "LIBRAS" || selectedRequest.type === "BOTH") && (
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6 italic">Interpretador de Libras (Protocolo MP4)</label>
                                                <label className={`block border-2 border-dashed rounded-[40px] p-12 text-center cursor-pointer transition-all duration-500 group ${librasFile ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 hover:border-blue-500/40 hover:bg-white/[0.07]'}`}>
                                                    <input type="file" accept="video/*" className="hidden" onChange={e => setLibrasFile(e.target.files?.[0] || null)} />
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${librasFile ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-600 group-hover:scale-110'}`}>
                                                            {librasFile ? <CheckCircle size={32} /> : <Video size={32} />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-black uppercase tracking-widest text-white">
                                                                {librasFile ? librasFile.name : 'Selecionar Mídia de Libras'}
                                                            </p>
                                                            {!librasFile && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Arraste ou clique para upload</p>}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                        {(selectedRequest.type === "AUDIO_DESC" || selectedRequest.type === "BOTH") && (
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6 italic">Audiodescrição Narrativa (Protocolo MP3)</label>
                                                <label className={`block border-2 border-dashed rounded-[40px] p-12 text-center cursor-pointer transition-all duration-500 group ${audioFile ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 hover:border-amber-500/40 hover:bg-white/[0.07]'}`}>
                                                    <input type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${audioFile ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-600 group-hover:scale-110'}`}>
                                                            {audioFile ? <CheckCircle size={32} /> : <FileAudio size={32} />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-black uppercase tracking-widest text-white">
                                                                {audioFile ? audioFile.name : 'Selecionar Áudio Guia'}
                                                            </p>
                                                            {!audioFile && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Arraste ou clique para upload</p>}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {uploading && (
                                        <div className="space-y-6 pt-10 border-t border-white/5">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] italic animate-pulse">Sincronizando com Cloud Node...</span>
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">Criptografia de ponta-a-ponta ativa</span>
                                                </div>
                                                <span className="text-3xl font-black text-white italic tracking-tighter leading-none">{progress}%</span>
                                            </div>
                                            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                                                <motion.div 
                                                    className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-12 flex gap-6 mt-auto">
                                        <Button 
                                            variant="glass" 
                                            disabled={uploading} 
                                            onClick={() => setSelectedRequest(null)} 
                                            className="h-20 flex-1 rounded-[24px] border-white/5 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all shadow-xl"
                                        >
                                            Cancelar Operação
                                        </Button>
                                        <Button 
                                            onClick={handleFulfill}
                                            disabled={uploading || (selectedRequest.type === "BOTH" && (!librasFile || !audioFile)) || (selectedRequest.type === "LIBRAS" && !librasFile) || (selectedRequest.type === "AUDIO_DESC" && !audioFile)}
                                            className="h-20 flex-[1.5] rounded-[24px] bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                                        >
                                            {uploading ? (
                                                <>
                                                    <RefreshCw size={20} className="animate-spin" /> Transmitindo...
                                                </>
                                            ) : (
                                                <>
                                                    Validar & Implantar <CloudUpload size={20} className="group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
