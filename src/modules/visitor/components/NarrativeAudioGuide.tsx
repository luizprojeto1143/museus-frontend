import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Headphones, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './NarrativeAudioGuide.css';

interface NarrativeAudioGuideProps {
    audioUrl?: string | null;
    title: string;
    artist?: string;
}

export const NarrativeAudioGuide: React.FC<NarrativeAudioGuideProps> = ({ audioUrl, title, artist }) => {
    const { t } = useTranslation();
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
            // Fetch descriptive text from somewhere provided via props usually, 
            // but here we might need to rely on title/artist or fetch details.
            // Assuming the parent component passes a description prop would be better.
            // For now, let's use what we have or generic text.
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
        } catch (error) {
            console.error("TTS Error", error);
            alert(t('visitor.audioGuide.errorTTS', 'Erro ao gerar áudio.'));
        } finally {
            setGenerating(false);
        }
    };

    const effectiveAudioUrl = audioUrl || generatedAudioUrl;

    if (!effectiveAudioUrl) {
        return (
            <section className="narrative-guide-section">
                <div className="narrative-guide-header">
                    <div className="narrative-guide-icon">
                        <Headphones size={28} />
                    </div>
                    <div>
                        <h2>{t('visitor.audioGuide.title', 'Áudio-Guia')}</h2>
                        <p>{t('visitor.audioGuide.subtitle', 'Ouça a narração sobre esta obra')}</p>
                    </div>
                </div>

                <div className="narrative-guide-empty">
                    <Volume2 size={48} />
                    <p>{t('visitor.audioGuide.notAvailable', 'Áudio-guia oficial ainda não disponível.')}</p>

                    <button
                        onClick={handleGenerateAudio}
                        disabled={generating}
                        className="btn-generate-audio"
                        style={{
                            marginTop: "1rem",
                            padding: "0.8rem 1.5rem",
                            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                            border: "none",
                            borderRadius: "8px",
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}
                    >
                        {generating ? (
                            <>
                                <span className="spinner-small"></span>
                                {t('visitor.audioGuide.generating', 'Gerando Narrativa...')}
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                {t('visitor.audioGuide.generateAI', 'Gerar Narração com IA')}
                            </>
                        )}
                    </button>
                    <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.7 }}>
                        {t('visitor.audioGuide.aiDisclaimer', 'Narrativa gerada por inteligência artificial.')}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="narrative-guide-section">
            <audio ref={audioRef} src={effectiveAudioUrl} preload="metadata" />

            <div className="narrative-guide-header">
                <div className="narrative-guide-icon">
                    <Headphones size={28} />
                </div>
                <div>
                    <h2>{t('visitor.audioGuide.title', 'Áudio-Guia')}</h2>
                    <p>{t('visitor.audioGuide.subtitle', 'Ouça a narração sobre esta obra')}</p>
                </div>
            </div>

            <div className="narrative-guide-player">
                <div className="player-artwork">
                    <div className={`artwork-pulse ${isPlaying ? 'playing' : ''}`}>
                        <Headphones size={40} />
                    </div>
                </div>

                <div className="player-info">
                    <h3 className="player-title">{title}</h3>
                    {artist && <p className="player-artist">{artist}</p>}
                    {generatedAudioUrl && (
                        <span className="badge-ai">
                            <Sparkles size={10} /> AI Generated
                        </span>
                    )}
                </div>

                <div className="player-progress">
                    <span className="time-current">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="progress-bar"
                        disabled={!isLoaded}
                    />
                    <span className="time-total">{formatTime(duration)}</span>
                </div>

                <div className="player-controls">
                    <button onClick={() => skip(-10)} className="control-btn secondary" title="Voltar 10s">
                        <SkipBack size={20} />
                    </button>

                    <button onClick={togglePlay} className="control-btn primary" title={isPlaying ? 'Pausar' : 'Reproduzir'}>
                        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </button>

                    <button onClick={() => skip(10)} className="control-btn secondary" title="Avançar 10s">
                        <SkipForward size={20} />
                    </button>
                </div>

                <p className="player-tip">
                    🎧 {t('visitor.audioGuide.tip', 'Use fones de ouvido para uma experiência imersiva')}
                </p>
            </div>

            <style>{`
                .btn-generate-audio:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .spinner-small {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                }
                .badge-ai {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 6px;
                    background: rgba(139, 92, 246, 0.2);
                    color: #a78bfa;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    margin-top: 4px;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
};
