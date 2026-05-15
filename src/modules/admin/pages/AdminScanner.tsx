import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../../api/client';
import { 
  ShieldCheck, 
  XCircle, 
  AlertTriangle, 
  QrCode, 
  Ticket, 
  User, 
  RefreshCw, 
  Smartphone,
  Camera,
  Maximize2,
  Scan,
  Keyboard,
  History,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../../components/ui';
import { useAuth } from '../../auth/AuthContext';

type ScanResult = {
    valid: boolean;
    message: string;
    details?: {
        guestName: string;
        eventName: string;
        ticketType: string;
    };
};

export const AdminScanner: React.FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = useAuth();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
    const [cameras, setCameras] = useState<any[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");
    
    const html5QrCode = useRef<Html5Qrcode | null>(null);

    if (!hasPermission("manage_scanner")) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <XCircle size={40} className="text-red-500 opacity-60" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Acesso Restrito</h2>
                <p className="text-zinc-500 max-w-sm">Você não possui a flag de permissão <strong className="text-red-400">manage_scanner</strong> necessária para operar o validador.</p>
            </div>
        );
    }

    const startScanner = async (cameraId: string) => {
        if (!html5QrCode.current) return;
        
        try {
            await html5QrCode.current.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    handleValidation(decodedText);
                },
                () => {} // Quiet failure
            );
        } catch (err) {
            console.error("Error starting scanner", err);
        }
    };

    const stopScanner = async () => {
        if (html5QrCode.current && html5QrCode.current.isScanning) {
            try {
                await html5QrCode.current.stop();
            } catch (err) {
                console.error("Error stopping scanner", err);
            }
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                setCameras(devices);
                if (devices.length > 0) {
                    setSelectedCamera(devices[0].id);
                }
                
                html5QrCode.current = new Html5Qrcode("reader");
            } catch (err) {
                console.error("Failed to get cameras", err);
            }
        };

        init();

        return () => {
            stopScanner();
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'camera' && isScanning && selectedCamera && html5QrCode.current) {
            startScanner(selectedCamera);
        } else {
            stopScanner();
        }
    }, [activeTab, isScanning, selectedCamera]);

    const handleValidation = async (code: string) => {
        if (loading) return;

        setIsScanning(false);
        setLoading(true);
        await stopScanner();

        try {
            const res = await api.post(`/registrations/${code}/check-in`);
            setScanResult(res.data);
            
            // Success Haptic Feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(100);
            }
        } catch (error: any) {
            setScanResult({
                valid: false,
                message: error.response?.data?.message || "Erro de conexão ao validar ingresso."
            });
            
            // Error Haptic Feedback
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setManualCode("");
        setIsScanning(true);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[85vh] flex flex-col">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scanline {
                    0% { top: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .scan-line {
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(to right, transparent, #d4af37, transparent);
                    box-shadow: 0 0 15px #d4af37;
                    z-index: 10;
                    animation: scanline 3s linear infinite;
                }
                #reader video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 1rem;
                }
            `}} />

            <header className="mb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-400/10 rounded-2xl border border-gold-400/20 mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                    <QrCode className="text-gold" size={32} />
                </div>
                <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                    Validador de <span className="text-gold">Ingressos</span>
                </h1>
                <p className="text-zinc-500 max-w-md mx-auto">
                    Terminal de portaria inteligente para validação em tempo real de acessos.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: History/Stats (Optional decoration) */}
                <div className="hidden lg:block lg:col-span-3 space-y-4">
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                            <History size={14} className="text-gold" /> Recentes
                        </h3>
                        <div className="space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex items-center gap-3 opacity-40">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-white truncate">Pedro Alvares...</p>
                                        <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">Há {i*5} min</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gold-500/5 backdrop-blur-xl border border-gold-500/10 rounded-3xl p-6">
                        <p className="text-[10px] font-black text-gold-400 uppercase tracking-widest mb-1">Check-ins Hoje</p>
                        <p className="text-3xl font-black text-white">124</p>
                    </div>
                </div>

                {/* Center: Main Scanner */}
                <div className="lg:col-span-9">
                    <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        
                        {/* Tabs */}
                        <div className="flex p-2 bg-black/40 border-b border-white/5">
                            <button 
                                onClick={() => setActiveTab('camera')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'camera' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <Camera size={16} /> Câmera
                            </button>
                            <button 
                                onClick={() => setActiveTab('manual')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <Keyboard size={16} /> Manual
                            </button>
                        </div>

                        <div className="p-8">
                            {isScanning ? (
                                <>
                                    {activeTab === 'camera' ? (
                                        <div className="space-y-6">
                                            <div className="relative aspect-square md:aspect-video w-full bg-black rounded-3xl overflow-hidden border border-white/10 group">
                                                <div id="reader" className="w-full h-full"></div>
                                                
                                                {/* Overlay Scanned Box */}
                                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                    <div className="w-[250px] h-[250px] border-2 border-gold/40 rounded-3xl flex items-center justify-center relative">
                                                        <div className="scan-line"></div>
                                                        
                                                        {/* Corners */}
                                                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-gold rounded-tl-xl"></div>
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-gold rounded-tr-xl"></div>
                                                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-gold rounded-bl-xl"></div>
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-gold rounded-br-xl"></div>
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Scanner Ativo</span>
                                                </div>
                                            </div>

                                            {cameras.length > 1 && (
                                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                    <RefreshCw size={18} className="text-gold" />
                                                    <select 
                                                        value={selectedCamera}
                                                        onChange={(e) => setSelectedCamera(e.target.value)}
                                                        className="flex-1 bg-transparent text-white text-sm font-bold outline-none cursor-pointer"
                                                    >
                                                        {cameras.map(cam => (
                                                            <option key={cam.id} value={cam.id} className="bg-zinc-900">{cam.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-8 py-12">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                    <Maximize2 size={24} className="text-zinc-500" />
                                                </div>
                                                <h3 className="text-white font-black text-lg">Entrada Manual</h3>
                                                <p className="text-zinc-500 text-sm">Insira o código impresso abaixo do QR Code</p>
                                            </div>

                                            <div className="max-w-sm mx-auto">
                                                <div className="relative group">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/50 to-bronze/50 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                                                    <input
                                                        type="text"
                                                        value={manualCode}
                                                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                                        placeholder="EX: TKT-123XYZ"
                                                        className="relative w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-2xl font-black text-center text-white placeholder:text-white/10 tracking-[0.2em] outline-none focus:border-gold transition-all"
                                                        autoFocus
                                                    />
                                                </div>
                                                
                                                <Button
                                                    variant="primary"
                                                    disabled={!manualCode || loading}
                                                    onClick={() => handleValidation(manualCode)}
                                                    className="w-full mt-6 py-6 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-gold/10"
                                                >
                                                    Validar Ingresso
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Result View */
                                <div className="animate-in fade-in zoom-in duration-500">
                                    {loading ? (
                                        <div className="py-20 flex flex-col items-center gap-6">
                                            <div className="relative w-20 h-20">
                                                <div className="absolute inset-0 border-4 border-gold/20 rounded-full"></div>
                                                <div className="absolute inset-0 border-4 border-t-gold rounded-full animate-spin"></div>
                                            </div>
                                            <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">Sincronizando com a nuvem...</p>
                                        </div>
                                    ) : scanResult ? (
                                        <div className={`rounded-[2rem] p-8 border-2 ${scanResult.valid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                            
                                            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                                                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl shrink-0 ${scanResult.valid ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                                                    {scanResult.valid ? <ShieldCheck size={48} /> : <XCircle size={48} />}
                                                </div>
                                                
                                                <div className="text-center md:text-left">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block ${scanResult.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {scanResult.valid ? "Sucesso" : "Falha na Validação"}
                                                    </span>
                                                    <h2 className="text-3xl font-black text-white leading-tight">{scanResult.message}</h2>
                                                </div>
                                            </div>

                                            {scanResult.details && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                                        <User className="text-gold mb-3" size={20} />
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Visitante</p>
                                                        <p className="text-xl font-black text-white">{scanResult.details.guestName}</p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                                        <Ticket className="text-gold mb-3" size={20} />
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Atração</p>
                                                        <p className="text-lg font-black text-white truncate">{scanResult.details.eventName}</p>
                                                        <p className="text-xs text-zinc-500">{scanResult.details.ticketType}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                onClick={resetScanner}
                                                className={`w-full py-6 rounded-2xl text-base font-black uppercase tracking-widest transition-all ${scanResult.valid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                                                leftIcon={<Scan size={20} />}
                                            >
                                                Próximo Visitante
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                <Smartphone size={20} className="text-zinc-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Otimizado para Mobile</p>
                                <p className="text-[10px] text-zinc-500">Acesse via smartphone para usar a câmera traseira.</p>
                            </div>
                        </div>
                        
                        <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1 h-1 bg-gold rounded-full"></div>
                            Sistema de Portaria Culturaviva
                            <div className="w-1 h-1 bg-gold rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
