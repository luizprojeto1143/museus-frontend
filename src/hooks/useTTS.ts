
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../api/client";

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Platform detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Audio Context (Mobile Only)
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const bufferRef = useRef<AudioBuffer | null>(null);
    const startTimeRef = useRef<number>(0);

    // HTML5 Audio (Desktop Only)
    const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

    // Native fallback
    const [nativeSupported] = useState(() => "speechSynthesis" in window);

    // Initialize AudioContext ONLY on Mobile
    useEffect(() => {
        if (isMobile) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (htmlAudioRef.current) {
                htmlAudioRef.current.pause();
                htmlAudioRef.current = null;
            }
            window.speechSynthesis.cancel();
        };
    }, [isMobile]);

    const stopAll = useCallback(() => {
        // Mobile clean
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) { /**/ }
            sourceRef.current = null;
        }

        // Desktop clean
        if (htmlAudioRef.current) {
            htmlAudioRef.current.pause();
            htmlAudioRef.current = null;
        }

        // Native clean
        if (nativeSupported) {
            window.speechSynthesis.cancel();
        }

        setIsSpeaking(false);
        setIsPaused(false);
        setIsLoading(false);
    }, [nativeSupported]);

    const speakNative = useCallback((text: string, lang: string) => {
        if (!nativeSupported) return;
        window.speechSynthesis.cancel();
        setIsLoading(false);

        const play = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang === lang && (v.name.includes("Google") || v.name.includes("Natural"))) || voices.find(v => v.lang === lang);
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
            utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
            utterance.onerror = () => { setIsSpeaking(false); };
            window.speechSynthesis.speak(utterance);
        }

        // Simple Mobile check for native hack
        if (isMobile && window.speechSynthesis.getVoices().length > 0) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        }

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                play();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            play();
        }
    }, [nativeSupported, isMobile]);

    const playMobileWebAudio = useCallback(async (data: ArrayBuffer) => {
        if (!audioContextRef.current) return;

        // Ensure context is running
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const audioData = await audioContextRef.current.decodeAudioData(data);
        bufferRef.current = audioData;

        // Stop previous
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) { /**/ }
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioData;
        source.connect(audioContextRef.current.destination);
        source.start(0);

        sourceRef.current = source;
        startTimeRef.current = audioContextRef.current.currentTime;

        // Manual end detection
        const duration = audioData.duration;
        const checkEnd = setInterval(() => {
            if (audioContextRef.current && audioContextRef.current.currentTime >= startTimeRef.current + duration - 0.2) {
                setIsSpeaking(false);
                clearInterval(checkEnd);
            }
        }, 500);

        setIsSpeaking(true);
        setIsPaused(false);
    }, []);

    const playDesktopAudio = useCallback((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        htmlAudioRef.current = audio;

        audio.onplay = () => { setIsSpeaking(true); setIsPaused(false); setIsLoading(false); };
        audio.onended = () => { setIsSpeaking(false); setIsPaused(false); };
        audio.onerror = () => {
            console.error("Desktop Audio Error");
            setIsSpeaking(false);
        };

        audio.play().catch(e => {
            console.error("Desktop Autoplay Blocked?", e);
            setIsSpeaking(false);
        });
    }, []);

    const speak = useCallback(async (text: string, lang: string = "pt-BR") => {
        stopAll();

        // 1. Mobile Unlock Pre-Fetch
        if (isMobile && audioContextRef.current && audioContextRef.current.state === 'suspended') {
            try { await audioContextRef.current.resume(); } catch (e) { console.error("Resume failed", e); }
        }

        try {
            setIsLoading(true);
            const res = await api.post("/ai/tts", { text, voice: "onyx" }, {
                responseType: 'arraybuffer'
            });

            if (isMobile) {
                await playMobileWebAudio(res.data);
            } else {
                const blob = new Blob([res.data], { type: "audio/mpeg" });
                playDesktopAudio(blob);
            }
            setIsLoading(false);

        } catch (err) {
            console.warn("API TTS failed, fallback to native", err);
            speakNative(text, lang);
        }

    }, [stopAll, speakNative, isMobile, playMobileWebAudio, playDesktopAudio]);

    const pause = useCallback(() => {
        if (isMobile && audioContextRef.current?.state === 'running') {
            audioContextRef.current.suspend();
            setIsPaused(true);
        } else if (!isMobile && htmlAudioRef.current) {
            htmlAudioRef.current.pause();
            setIsPaused(true);
        } else {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [isMobile]);

    const resume = useCallback(() => {
        if (isMobile && audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
            setIsPaused(false);
        } else if (!isMobile && htmlAudioRef.current) {
            htmlAudioRef.current.play();
            setIsPaused(false);
        } else {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [isMobile]);

    const cancel = useCallback(() => {
        stopAll();
    }, [stopAll]);

    return {
        speak,
        cancel,
        pause,
        resume,
        isSpeaking,
        isPaused,
        isLoading,
        supported: true
    };
};
