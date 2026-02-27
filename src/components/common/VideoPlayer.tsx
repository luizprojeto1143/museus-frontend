import React from 'react';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
    url?: string | null;
    title?: string;
    poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, poster }) => {
    if (!url) return null;

    // Helper to extract YouTube video ID and check if it is a YouTube URL
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
        return (
            <div className="video-section">
                <div className="video-header">
                    <div className="video-icon">
                        <PlayCircle size={28} />
                    </div>
                    <div>
                        <h2>{title || 'Vídeo Explicativo'}</h2>
                        <p>Assista ao conteúdo em vídeo</p>
                    </div>
                </div>
                <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '1rem' }}>
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={title || "YouTube video player"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    ></iframe>
                </div>
            </div>
        );
    }

    // Fallback to standard HTML5 video player for direct links
    return (
        <div className="video-section">
            <div className="video-header">
                <div className="video-icon">
                    <PlayCircle size={28} />
                </div>
                <div>
                    <h2>{title || 'Vídeo Explicativo'}</h2>
                    <p>Assista ao conteúdo em vídeo</p>
                </div>
            </div>
            <div className="video-container">
                <video
                    controls
                    preload="metadata"
                    poster={poster}
                    className="video-player"
                    style={{ width: '100%', borderRadius: '1rem' }}
                >
                    <source src={url} type="video/mp4" />
                    Seu navegador não suporta vídeos.
                </video>
            </div>
        </div>
    );
};
