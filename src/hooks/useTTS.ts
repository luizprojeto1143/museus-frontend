
import { useState, useCallback, useRef, useEffect } from "react";
// Assumes api client is available at ../api/client or similar - adjusting import path based on file location
// src/hooks/useTTS.ts -> ../api/client
import { api } from "../api/client";

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Audio Context for reliable mobile playback
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0);
    const bufferRef = useRef<AudioBuffer | null>(null);

    // Fallback support (always keep native ready)
    const [nativeSupported] = useState(() => "speechSynthesis" in window);

    // Initialize AudioContext
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
        return () => {
            // Cleanup
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const stopAll = useCallback(() => {
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) { /**/ }
            sourceRef.current = null;
        }
        pausedAtRef.current = 0;

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

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                play();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            // Wake up mobile audio engine
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            play();
        }
    }, [nativeSupported]);

    const playBuffer = useCallback((buffer: AudioBuffer, offset: number = 0) => {
        if (!audioContextRef.current) return;

        // Stop previous
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) { /**/ }
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0, offset);

        sourceRef.current = source;
        startTimeRef.current = audioContextRef.current.currentTime - offset;

        source.onended = () => {
            // Only clear state if we naturally ended (not manually stopped/paused)
            // But checking 'isSpeaking' is tricky inside callback.
            // Simplified:
            // setIsSpeaking(false); 
            // We rely on external control for stopping state, or check time?
            // "onended" fires even on stop().
        };

        setIsSpeaking(true);
        setIsPaused(false);
    }, []);

    const speak = useCallback(async (text: string, lang: string = "pt-BR") => {
        stopAll();

        // 1. Resume AudioContext immediately (Unlock Mobile Audio)
        // This is THE crucial step for mobile support.
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        // Try API
        try {
            setIsLoading(true);
            const res = await api.post("/ai/tts", { text, voice: "onyx" }, {
                responseType: 'arraybuffer'
            });

            if (!audioContextRef.current) throw new Error("AudioContext not supported");

            const audioData = await audioContextRef.current.decodeAudioData(res.data);
            bufferRef.current = audioData;
            playBuffer(audioData);
            setIsLoading(false);

            // Hook into onended manually?
            // Since onended fires on stop(), we handle state carefully.
            sourceRef.current!.onended = () => {
                // If context time > duration + start time, it finished naturally
                const ctx = audioContextRef.current;
                if (ctx && ctx.currentTime >= startTimeRef.current + audioData.duration - 0.1) {
                    setIsSpeaking(false);
                    setIsPaused(false);
                }
            };

        } catch (err) {
            console.warn("WebAudio API failed, fallback to native", err);
            speakNative(text, lang);
        } finally {
            // isLoading set to false in success path or failure path
        }

    }, [stopAll, speakNative, playBuffer]);

    const pause = useCallback(() => {
        if (audioContextRef.current && isSpeaking) {
            if (audioContextRef.current.state === 'running') {
                audioContextRef.current.suspend();
                setIsPaused(true);
            }
        }
        else if (nativeSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [isSpeaking, nativeSupported]);

    const resume = useCallback(() => {
        if (audioContextRef.current && isPaused) {
            audioContextRef.current.resume();
            setIsPaused(false);
        }
        else if (nativeSupported && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [isPaused, nativeSupported]);

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
