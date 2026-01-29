import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Headphones } from 'lucide-react';
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

    if (!audioUrl) {
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
                    <p>{t('visitor.audioGuide.notAvailable', 'Áudio-guia ainda não disponível para esta obra.')}</p>
                    <span>{t('visitor.audioGuide.comingSoon', 'Em breve teremos uma narração especial para você.')}</span>
                </div>
            </section>
        );
    }

    return (
        <section className="narrative-guide-section">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

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
        </section>
    );
};
