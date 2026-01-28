import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, X, RotateCcw } from 'lucide-react';
import './GlobalAudioPlayer.css';

export const GlobalAudioPlayer: React.FC = () => {
    const {
        currentTrack,
        isPlaying,
        progress,
        togglePlay,
        closePlayer,
        isMinimized,
        setMinimized,
        duration,
        currentTime,
        seek
    } = useAudio();

    if (!currentTrack) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (isMinimized) {
        return (
            <div className="audio-player-fab" onClick={() => setMinimized(false)}>
                <div className={`audio-player-fab-icon ${isPlaying ? 'playing' : ''}`}>
                    🎵
                </div>
            </div>
        );
    }

    return (
        <div className="audio-player-expanded">
            <div className="audio-player-main">
                {/* Cover */}
                <div className="audio-player-cover">
                    {currentTrack.coverUrl ? (
                        <img src={currentTrack.coverUrl} alt="Cover" />
                    ) : (
                        <span className="audio-player-cover-placeholder">🎧</span>
                    )}
                </div>

                {/* Info */}
                <div className="audio-player-info" onClick={() => setMinimized(true)}>
                    <div className="audio-player-title">{currentTrack.title}</div>
                    <div className="audio-player-time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* Controls */}
                <div className="audio-player-controls">
                    <button
                        onClick={() => seek(currentTime - 10)}
                        className="audio-player-btn"
                        aria-label="Voltar 10 segundos"
                        title="Voltar 10 segundos"
                    >
                        <RotateCcw size={18} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className="audio-player-play-btn"
                        aria-label={isPlaying ? "Pausar" : "Tocar"}
                        title={isPlaying ? "Pausar" : "Tocar"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); closePlayer(); }}
                        className="audio-player-btn"
                        aria-label="Fechar player"
                        title="Fechar player"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div
                className="audio-player-progress-container"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = x / rect.width;
                    seek(pct * duration);
                }}
            >
                <div
                    className="audio-player-progress-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
