import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface AudioTrack {
    title: string;
    url: string;
    artist?: string;
    coverUrl?: string; // For album art
}

interface AudioContextType {
    isPlaying: boolean;
    currentTrack: AudioTrack | null;
    progress: number; // 0 to 100
    duration: number;
    currentTime: number;
    isMinimized: boolean;
    playTrack: (track: AudioTrack) => void;
    togglePlay: () => void;
    closePlayer: () => void;
    setMinimized: (minimized: boolean) => void;
    seek: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration) {
                setDuration(audio.duration);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(100);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleTimeUpdate);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleTimeUpdate);
        };
    }, []);

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            // Only load if different url to avoid reset on re-render if that happens (though state protects it)
            if (audioRef.current.src !== currentTrack.url) {
                audioRef.current.src = currentTrack.url;
                audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Auto-play blocked", e));
            }
        }
    }, [currentTrack]);

    const playTrack = (track: AudioTrack) => {
        if (currentTrack?.url === track.url) {
            togglePlay();
            return;
        }
        setCurrentTrack(track);
        setIsMinimized(false);
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const closePlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTrack(null);
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }

    return (
        <AudioContext.Provider value={{
            isPlaying,
            currentTrack,
            progress,
            duration,
            currentTime,
            isMinimized,
            playTrack,
            togglePlay,
            closePlayer,
            setMinimized: setIsMinimized,
            seek
        }}>
            {children}
            <audio ref={audioRef} style={{ display: 'none' }} />
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudio must be used within an AudioProvider");
    }
    return context;
};
