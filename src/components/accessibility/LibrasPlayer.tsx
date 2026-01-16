import React, { useState, useRef, useEffect } from 'react';
import { Hand, Play, Pause, Volume2, VolumeX, Maximize, X, SkipBack, SkipForward } from 'lucide-react';
import { getFullUrl } from '../../utils/url';

interface LibrasPlayerProps {
  videoUrl: string;
  title?: string;
  onClose?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
}

/**
 * Libras Video Player Component
 * Full-featured player for sign language interpretation videos
 */
export const LibrasPlayer: React.FC<LibrasPlayerProps> = ({
  videoUrl,
  title,
  onClose,
  autoPlay = false,
  loop = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true); // Usually Libras videos are silent
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const changeSpeed = () => {
    const video = videoRef.current;
    if (!video) return;

    const speeds = [0.5, 0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newRate = speeds[nextIndex];

    video.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fullVideoUrl = getFullUrl(videoUrl);

  return (
    <div className={`libras-player ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="libras-header">
        <div className="libras-title">
          <Hand size={20} />
          <span>{title || 'Interpretação em Libras'}</span>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Video */}
      <div className="video-container">
        <video
          ref={videoRef}
          src={fullVideoUrl || undefined}
          autoPlay={autoPlay}
          loop={loop}
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />

        {/* Play overlay */}
        {!isPlaying && (
          <div className="play-overlay" onClick={togglePlay}>
            <div className="play-icon">
              <Play size={48} fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="libras-controls">
        {/* Progress bar */}
        <div className="progress-container" onClick={handleSeek}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="controls-row">
          {/* Left controls */}
          <div className="controls-left">
            <button onClick={() => skip(-10)} aria-label="Voltar 10s">
              <SkipBack size={18} />
            </button>
            <button onClick={togglePlay} className="play-btn" aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={() => skip(10)} aria-label="Avançar 10s">
              <SkipForward size={18} />
            </button>
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="controls-right">
            <button onClick={changeSpeed} className="speed-btn" aria-label="Velocidade">
              {playbackRate}x
            </button>
            <button onClick={toggleMute} aria-label={isMuted ? 'Ativar som' : 'Desativar som'}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={toggleFullscreen} aria-label="Tela cheia">
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
                .libras-player {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    overflow: hidden;
                    max-width: 100%;
                }
                
                .libras-player.fullscreen {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    border-radius: 0;
                }
                
                .libras-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    color: white;
                }
                
                .libras-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                }
                
                .close-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    cursor: pointer;
                }
                
                .video-container {
                    position: relative;
                    background: #000;
                    aspect-ratio: 16/9;
                }
                
                .video-container video {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    cursor: pointer;
                }
                
                .play-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.4);
                    cursor: pointer;
                }
                
                .play-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: rgba(139, 92, 246, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding-left: 6px;
                    transition: transform 0.2s;
                }
                
                .play-overlay:hover .play-icon {
                    transform: scale(1.1);
                }
                
                .libras-controls {
                    padding: 12px 16px;
                    background: var(--bg-elevated, #374151);
                }
                
                .progress-container {
                    padding: 8px 0;
                    cursor: pointer;
                }
                
                .progress-bar {
                    height: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #8b5cf6, #6366f1);
                    border-radius: 2px;
                    transition: width 0.1s;
                }
                
                .controls-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .controls-left,
                .controls-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .libras-controls button {
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                
                .libras-controls button:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .play-btn {
                    background: rgba(139, 92, 246, 0.3) !important;
                }
                
                .speed-btn {
                    font-weight: bold;
                    font-size: 0.85rem;
                    min-width: 40px;
                }
                
                .time-display {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-left: 8px;
                }
            `}</style>
    </div>
  );
};

/**
 * Libras Toggle Button Component
 * Floating button to show/hide Libras video
 */
interface LibrasToggleProps {
  videoUrl?: string | null;
  title?: string;
}

export const LibrasToggle: React.FC<LibrasToggleProps> = ({ videoUrl, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoUrl) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        className="libras-toggle-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Ver interpretação em Libras"
      >
        <Hand size={24} />
        <span>Libras</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="libras-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="libras-modal" onClick={e => e.stopPropagation()}>
            <LibrasPlayer
              videoUrl={videoUrl}
              title={title}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}

      <style>{`
                .libras-toggle-btn {
                    position: fixed;
                    bottom: 180px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
                    z-index: 100;
                    transition: transform 0.2s;
                }
                
                .libras-toggle-btn:hover {
                    transform: scale(1.05);
                }
                
                .libras-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 1000;
                }
                
                .libras-modal {
                    width: 100%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow: auto;
                }
            `}</style>
    </>
  );
};

/**
 * Inline Libras Section Component
 * For embedding in pages alongside content
 */
export const LibrasSection: React.FC<{
  videoUrl?: string | null;
  contentTitle?: string;
}> = ({ videoUrl, contentTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!videoUrl) return null;

  return (
    <div className="libras-section">
      <button
        className="libras-expand-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Hand size={20} />
        <span>{isExpanded ? 'Ocultar Libras' : 'Ver em Libras'}</span>
      </button>

      {isExpanded && (
        <div className="libras-section-player">
          <LibrasPlayer
            videoUrl={videoUrl}
            title={contentTitle ? `Libras: ${contentTitle}` : 'Interpretação em Libras'}
          />
        </div>
      )}

      <style>{`
                .libras-section {
                    margin: 16px 0;
                }
                
                .libras-expand-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    color: #8b5cf6;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .libras-expand-btn:hover {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2));
                }
                
                .libras-section-player {
                    margin-top: 12px;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
};
