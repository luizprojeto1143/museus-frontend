import { useState, useCallback, useRef, useEffect } from "react";
// Assumes api client is available at ../api/client or similar - adjusting import path based on file location
// src/hooks/useTTS.ts -> ../api/client
import { api } from "../api/client";

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // For native SpeechSynthesis fallback
    const [nativeSupported] = useState(() => "speechSynthesis" in window);

    // For Audio API
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const stopAll = useCallback(() => {
        // Stop Audio API
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Stop Native
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

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [nativeSupported]);

    const speak = useCallback(async (text: string, lang: string = "pt-BR") => {
        // Stop any current playback
        stopAll();

        // 1. Try Backend OpenAI TTS first
        try {
            setIsLoading(true);

            // Get tenantId from local storage or context if possible, but here we might not have it easily directly in hook without context.
            // Works/Public endpoints usually infer tenant or we pass it. 
            // The /ai/tts endpoint only needs openai key on backend.

            const res = await api.post("/ai/tts", { text, voice: "onyx" }, {
                responseType: 'arraybuffer'
            });

            const blob = new Blob([res.data], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);

            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onplay = () => {
                setIsSpeaking(true);
                setIsPaused(false);
                setIsLoading(false);
            };

            audio.onended = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            audio.onerror = (e) => {
                console.error("Audio playback error", e);
                setIsSpeaking(false);
                setIsLoading(false);
                // Fallback to native if audio fails?
                speakNative(text, lang);
            };

            await audio.play();

        } catch (err) {
            console.warn("OpenAI TTS failed, falling back to native", err);
            speakNative(text, lang);
        } finally {
            if (!audioRef.current) setIsLoading(false);
        }

    }, [stopAll, speakNative]);

    const cancel = useCallback(() => {
        stopAll();
    }, [stopAll]);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPaused(true);
        } else if (nativeSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [nativeSupported]);

    const resume = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPaused(false);
        } else if (nativeSupported && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [nativeSupported]);

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
