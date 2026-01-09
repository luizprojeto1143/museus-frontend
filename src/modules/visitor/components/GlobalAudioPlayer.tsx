import React from 'react';
import { useAudio } from '../context/AudioContext';

/* 
  Global Audio UI Component
  - Persistent floating bar
  - Supports minimized/expanded state
*/

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
            <div
                style={{
                    position: 'fixed',
                    bottom: '80px', // Above bottom nav
                    right: '1rem',
                    background: 'var(--bg-card)',
                    borderRadius: '50rem',
                    padding: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                }}
                onClick={() => setMinimized(false)}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isPlaying ? 'pulse 2s infinite' : 'none'
                }}>
                    <span style={{ fontSize: '1rem' }}>🎵</span>
                </div>
                <style>{`
                    @keyframes pulse {
                        0% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0); }
                        100% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '70px',
            left: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '0.75rem',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            zIndex: 2000,
            border: '1px solid rgba(0,0,0,0.05)',
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Cover / Icon */}
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '0.5rem',
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                }}>
                    {currentTrack.coverUrl ? (
                        <img src={currentTrack.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '1.5rem' }}>🎧</span>
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setMinimized(true)}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentTrack.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        onClick={() => seek(currentTime - 10)}
                        className="btn-icon"
                        style={{ padding: '0.5rem', fontSize: '1rem', background: 'transparent', color: '#666' }}
                        aria-label="Voltar 10 segundos"
                        title="Voltar 10 segundos"
                    >
                        ↺
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                        }}
                        aria-label={isPlaying ? "Pausar" : "Tocar"}
                        title={isPlaying ? "Pausar" : "Tocar"}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); closePlayer(); }}
                        className="btn-icon"
                        style={{ padding: '0.5rem', fontSize: '1rem', background: 'transparent', color: '#666' }}
                        aria-label="Fechar player"
                        title="Fechar player"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div
                style={{
                    width: '100%',
                    height: '4px',
                    background: '#e5e7eb',
                    marginTop: '0.75rem',
                    borderRadius: '2px',
                    position: 'relative',
                    cursor: 'pointer'
                }}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = x / rect.width;
                    seek(pct * duration);
                }}
            >
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: '2px',
                    transition: 'width 0.1s linear'
                }} />
            </div>
        </div>
    );
};
