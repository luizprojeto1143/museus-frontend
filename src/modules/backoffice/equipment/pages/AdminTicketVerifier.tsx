import { useTranslation } from "react-i18next";
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { UserCheck, AlertTriangle, QrCode, Calendar, Users, Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../../../api/client';
import { AxiosError } from 'axios';
import { Card, Button, Input, AnimateIn, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

type ScanResult = {
    guestName?: string;
    code: string;
    eventTitle?: string;
    ticketType?: string;
    checkedInAt?: string;
};

type EventSummary = {
    id: string;
    title: string;
    date: string;
    registrationsCount: number;
    checkedInCount: number;
};

export const AdminTicketVerifier: React.FC = () => {
    const { t } = useTranslation();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [recentEvents, setRecentEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, checkedIn: 0 });

    const { tenantId } = useAuth();

    useEffect(() => {
        const loadEvents = async () => {
            if (!tenantId) return;
            try {
                const res = await api.get(`/events?hasRegistrations=true&limit=5&tenantId=${tenantId}`);
                setRecentEvents(res.data.events || res.data.data || res.data || []);
            } catch {
                // Silently fail
            }
        };
        loadEvents();
    }, [tenantId]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get('/registrations/stats/today');
                setStats(res.data);
            } catch {
                // Use defaults
            }
        };
        loadStats();
    }, [scanResult]);

    const handleCheckIn = useCallback(async (code: string) => {
        if (!code.trim()) return;

        setError(null);
        setScanResult(null);
        setLoading(true);

        try {
            const res = await api.post('/registrations/checkin', { code: code.trim() });
            setScanResult({
                ...res.data.registration,
                eventTitle: res.data.event?.title
            });
            setManualCode('');
        } catch (err) {
            const axiosErr = err as AxiosError<{ error?: string }>;
            setError(axiosErr.response?.data?.error || "Ingresso não encontrado ou já utilizado");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "ticket-reader",
            {
                fps: 10,
                qrbox: { width: 280, height: 280 },
                aspectRatio: 1
            },
            false
        );

        scanner.render(
            (decodedText) => {
                handleCheckIn(decodedText);
            },
            () => {
                // Scan error - ignore
            }
        );

        return () => {
            scanner.clear().catch(() => { });
        };
    }, [handleCheckIn]);

    const resetScanner = () => {
        setScanResult(null);
        setError(null);
    };

    // Estilos globais para forçar o scanner a se adaptar
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            #ticket-reader {
                border: none !important;
                border-radius: 1rem;
                overflow: hidden;
            }
            #ticket-reader video {
                border-radius: 1rem;
                object-fit: cover;
                width: 100% !important;
            }
            #ticket-reader__scan_region {
                background: #000;
            }
            #ticket-reader__dashboard {
                background: transparent !important;
                padding: 1rem 0;
            }
            #ticket-reader button {
                background: rgba(99, 102, 241, 0.2);
                color: #818cf8;
                border: 1px solid rgba(99, 102, 241, 0.4);
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            #ticket-reader button:hover {
                background: rgba(99, 102, 241, 0.4);
            }
            #ticket-reader a {
                color: #818cf8 !important;
            }
            #ticket-reader select {
                background: #1e293b;
                color: white;
                border: 1px solid #334155;
                padding: 0.5rem;
                border-radius: 0.5rem;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <AnimateIn variant="fadeRight">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <QrCode className="text-indigo-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-1">
                                Verificador de Ingressos
                            </h1>
                            <p className="text-slate-400 font-medium">
                                Escaneie o QR Code do ingresso para fazer check-in
                            </p>
                        </div>
                    </div>
                </AnimateIn>

                <AnimateIn variant="fadeLeft" delay={0.1}>
                    <Card className="px-6 py-4 flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl shadow-xl">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Users className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-black bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                {stats.checkedIn}
                            </div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Check-ins Hoje
                            </div>
                        </div>
                    </Card>
                </AnimateIn>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Scanner Main Area */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimateIn variant="fadeUp" delay={0.2}>
                    <Card className="max-w-2xl mx-auto backdrop-blur-md bg-black/40 border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                            {/* Decorative gradients */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            
                            <div className="p-8">
                                <AnimatePresence mode="wait">
                                    {!scanResult && !error ? (
                                        <motion.div
                                            key="scanner"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-6"
                                        >
                                            <div className="rounded-2xl overflow-hidden border-2 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] bg-black/50 p-2">
                                                <div id="ticket-reader" className="w-full h-full" />
                                            </div>
                                            
                                            <div className="pt-6 border-t border-slate-800/50">
                                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <Search size={16} className="text-indigo-400" />
                                                    {t("admin.ticketverifier.entradaManual", "Entrada Manual")}
                                                </h3>
                                                <div className="flex gap-3">
                                                    <Input
                                                        value={manualCode}
                                                        onChange={(e) => setManualCode(e.target.value)}
                                                        placeholder={t("admin.ticketverifier.digiteOCdigoDoIngresso", "Digite o código do ingresso (Ex: TKT-123)")}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleCheckIn(manualCode);
                                                        }}
                                                        className="flex-1 bg-slate-950/50 border-slate-800 focus:border-indigo-500 h-14 text-lg"
                                                    />
                                                    <Button
                                                        onClick={() => handleCheckIn(manualCode)}
                                                        disabled={loading || !manualCode.trim()}
                                                        isLoading={loading}
                                                        className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                                    >
                                                        {loading ? 'Verificando...' : 'Verificar'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : scanResult ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                                <CheckCircle2 size={48} className="text-emerald-400" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-2">Check-in Confirmado!</h2>
                                            <p className="text-emerald-400 font-medium mb-8">Ingresso validado com sucesso</p>
                                            
                                            <div className="bg-slate-950/50 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto mb-8 border border-slate-800/50">
                                                <div>
                                                    <span className="text-slate-500 text-sm block mb-1">Participante</span>
                                                    <strong className="text-white text-lg">{scanResult.guestName || "Visitante"}</strong>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-slate-500 text-sm block mb-1">Código</span>
                                                        <Badge variant="outline" className="text-indigo-400 border-indigo-400/20 font-mono">
                                                            {scanResult.code}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 text-sm block mb-1">Horário</span>
                                                        <strong className="text-white">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                                                    </div>
                                                </div>
                                                {scanResult.eventTitle && (
                                                    <div>
                                                        <span className="text-slate-500 text-sm block mb-1">Evento</span>
                                                        <strong className="text-slate-300">{scanResult.eventTitle}</strong>
                                                    </div>
                                                )}
                                                {scanResult.ticketType && (
                                                    <div>
                                                        <span className="text-slate-500 text-sm block mb-1">Tipo de Ingresso</span>
                                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">{scanResult.ticketType}</Badge>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <Button
                                                onClick={resetScanner}
                                                className="h-14 px-12 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-lg"
                                                rightIcon={<ChevronRight size={20} />}
                                            >
                                                Próximo Ingresso
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                                                <AlertTriangle size={48} className="text-red-400" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-4">Erro na Verificação</h2>
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 max-w-md mx-auto mb-8 font-medium">
                                                {error}
                                            </div>
                                            
                                            <Button
                                                onClick={resetScanner}
                                                className="h-14 px-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                                            >
                                                Tentar Novamente
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>
                    </AnimateIn>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <AnimateIn variant="fadeLeft" delay={0.3}>
                        <Card className="p-6 border-slate-800/50 bg-slate-900/50 backdrop-blur-xl rounded-3xl h-full min-h-[400px]">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                <Calendar size={20} className="text-indigo-400" />
                                Eventos Recentes
                            </h3>
                            
                            {recentEvents.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-3">
                                        <Calendar size={20} className="text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-medium">Nenhum evento com inscrições</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentEvents.map((event, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + i * 0.1 }}
                                            key={event.id} 
                                            className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 hover:border-indigo-500/30 transition-colors"
                                        >
                                            <h4 className="font-bold text-slate-200 mb-1 leading-tight line-clamp-2">
                                                {event.title}
                                            </h4>
                                            <div className="text-sm text-slate-500 mb-3">
                                                {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-slate-950 flex items-center justify-center">
                                                        <Users size={12} className="text-indigo-400" />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-emerald-400 font-bold">{event.checkedInCount || 0}</span>
                                                    <span className="text-slate-500 text-sm"> / {event.registrationsCount || 0}</span>
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${Math.min(100, ((event.checkedInCount || 0) / Math.max(1, event.registrationsCount || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </AnimateIn>
                </div>
            </div>
        </div>
    );
};
