import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Headphones, Sparkles, Loader2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import './NarrativeAudioGuide.css';

interface NarrativeAudioGuideProps {
    audioUrl?: string | null;
    title: string;
    artist?: string;
}

export const NarrativeAudioGuide: React.FC<NarrativeAudioGuideProps> = ({ audioUrl, title, artist }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoaded(true);
        };
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const skip = (seconds: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const [generating, setGenerating] = useState(false);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

    const handleGenerateAudio = async () => {
        if (!title && !artist) return;
        setGenerating(true);
        try {
            const textToSpeech = `Esta é a obra ${title}. ${artist ? `Criada por ${artist}.` : ""} ${t('visitor.audioGuide.defaultDescription', 'Aproveite para observar os detalhes e a composição desta peça.')}`;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/tts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ text: textToSpeech })
            });

            if (!response.ok) throw new Error("TTS Failed");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGeneratedAudioUrl(url);
            setIsLoaded(true);
            addToast("Áudio-guia gerado com sucesso!", "success");
        } catch (error) {
            console.error("TTS Error", error);
            addToast(t('visitor.audioGuide.errorTTS', 'Erro ao gerar áudio.'), "error");
        } finally {
            setGenerating(false);
        }
    };

    const effectiveAudioUrl = audioUrl || generatedAudioUrl;

    if (!effectiveAudioUrl) {
        return (
            <section className="narrative-guide-section bg-gradient-to-br from-[#12121e] to-[#0a0a0c] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="narrative-guide-header flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <Headphones size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">{t('visitor.audioGuide.title', 'Acessibilidade')}: Áudio-Guia</h2>
                        <p className="text-slate-500 text-sm">{t('visitor.audioGuide.subtitle', 'Ouça a narração sobre esta obra')}</p>
                    </div>
                </div>

                <div className="narrative-guide-empty text-center py-10 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                    <div className="mb-6 relative mx-auto w-20 h-20">
                        <Volume2 size={48} className="text-white/10 mx-auto" />
                        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
                    </div>
                    <p className="text-slate-400 font-medium px-4">{t('visitor.audioGuide.notAvailable', 'Áudio-guia oficial ainda não disponível.')}</p>

                    <Button
                        onClick={handleGenerateAudio}
                        disabled={generating}
                        className="mt-8 mx-auto w-auto px-10 py-6 text-lg rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 border-none hover:opacity-90 transition-all font-black"
                        leftIcon={generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    >
                        {generating ? t('visitor.audioGuide.generating', 'Gerando...') : t('visitor.audioGuide.generateAI', 'Gerar com IA')}
                    </Button>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-600 mt-4 flex items-center justify-center gap-1.5">
                        <Info size={10} /> {t('visitor.audioGuide.aiDisclaimer', 'Powered by Neural AI Engine')}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="narrative-guide-section bg-gradient-to-br from-[#12121e] to-[#0a0a0c] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <audio ref={audioRef} src={effectiveAudioUrl} preload="metadata" />

            {/* Decorative BG element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>

            <div className="narrative-guide-header flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] rounded-2xl flex items-center justify-center text-white">
                    <Headphones size={28} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white leading-tight">Áudio Descritivo</h2>
                    <p className="text-slate-500 text-sm">Experiência Narrativa Acessível</p>
                </div>
            </div>

            <div className="narrative-guide-player relative z-10">
                <div className="player-body flex flex-col md:flex-row items-center gap-8 mb-10">
                    <div className="player-artwork relative">
                        <div className={`
                            w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden transition-all duration-700
                            ${isPlaying ? 'scale-110 shadow-3xl shadow-blue-500/20' : ''}
                        `}>
                            <Headphones size={48} className={`text-blue-500 transition-all duration-700 ${isPlaying ? 'rotate-[-10deg]' : ''}`} />

                            {/* Animated pulses when playing */}
                            {isPlaying && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 border-2 border-blue-500/30 rounded-3xl animate-ping"></div>
                                    <div className="absolute inset-4 border border-blue-400/20 rounded-2xl animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="player-info flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-white leading-none mb-2">{title}</h3>
                        {artist && <p className="text-blue-500 font-bold text-sm tracking-widest uppercase">{artist}</p>}
                        {generatedAudioUrl && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg mt-3">
                                <Sparkles size={12} className="text-purple-400" />
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Neural AI Engine</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="player-progress flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 w-10 text-right font-mono">{formatTime(currentTime)}</span>
                        <div className="flex-1 relative h-6 flex items-center">
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full appearance-none bg-white/5 h-1.5 rounded-full outline-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                                disabled={!isLoaded}
                            />
                            {/* Visual Progress Layer */}
                            <div
                                className="absolute left-0 bg-blue-500 h-1.5 rounded-full pointer-events-none"
                                style={{ width: `${(currentTime / (duration || 100)) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 w-10 font-mono">{formatTime(duration)}</span>
                    </div>

                    <div className="player-controls flex items-center justify-center gap-10 pt-4">
                        <button
                            onClick={() => skip(-10)}
                            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Voltar 10s"
                        >
                            <SkipBack size={24} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className={`
                                w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-xl active:scale-90
                                ${isPlaying ? 'bg-white text-black' : 'bg-blue-600 text-white shadow-blue-600/30'}
                            `}
                            title={isPlaying ? 'Pausar' : 'Reproduzir'}
                        >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>

                        <button
                            onClick={() => skip(10)}
                            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Avançar 10s"
                        >
                            <SkipForward size={24} />
                        </button>
                    </div>
                </div>

                <p className="text-center mt-10 text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <Headphones size={12} /> Use fones de ouvido para imersão total
                </p>
            </div>
        </section>
    );
};
