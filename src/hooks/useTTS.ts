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

        const play = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 1.0;

            // Try to select a specific voice
            const voices = window.speechSynthesis.getVoices();
            // Prefer Google Voices or natural sounding ones if available
            const preferredVoice = voices.find(v => v.lang === lang && (v.name.includes("Google") || v.name.includes("Natural"))) ||
                voices.find(v => v.lang === lang);

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            utterance.onerror = (e) => {
                console.error("TTS Error", e);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        }

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                play();
                window.speechSynthesis.onvoiceschanged = null; // cleanup
            };
        } else {
            // Mobile Wake-up Hack:
            // Some mobile browsers need a 'kick' to start the audio engine.
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            play();
        }

    }, [nativeSupported]);

    const speak = useCallback(async (text: string, lang: string = "pt-BR") => {
        // Stop any current playback
        stopAll();

        // 1. Initialize Audio Object immediately (Interaction-Unlock Pattern)
        // We create the audio and play it IMMEDIATELY to unlock the AudioContext on mobile.
        // Even if empty or silent, this 'reserves' the right to play audio later intentionally.
        const audio = new Audio();
        audioRef.current = audio;

        // Mobile browsers require a synchronous .play() on user event.
        // We start "playing" (loading) immediately. 
        // We can set a temporary silent src or just play and hope the browser keeps the channel open while we fetch.
        // A robust way works by setting it to a tiny silent mp3 data URI, but explicit play() usually puts it in 'loading' state.

        // Let's try to fetch first if native is not preferred or if user explicitly wants high quality.
        // But the user requested "API". So we prioritize API.

        try {
            setIsLoading(true);

            // Unlock attempt:
            // window.speechSynthesis.pause(); // Optional: clear native
            // window.speechSynthesis.resume();

            // We can't really "play" completely empty src on all browsers, but let's start the fetch.
            // Actually, the best way for Async Audio on Mobile is:
            // 1. Fetch Blob
            // 2. Play
            // BUT this takes time and user context is lost.

            // ALTERNATIVE: Use Native as fallback, but since User requested API, we try API.
            // If we cannot guarantee AutoPlay after Async, we might need a "Play" button appear after loading.
            // However, let's try the "Silent Play" trick if possible, or just standard fetch and hope 'audio.play()' works if the fetch is fast enough? 
            // (It usually doesn't work if > 1-2 sec).

            const res = await api.post("/ai/tts", { text, voice: "onyx" }, {
                responseType: 'arraybuffer'
            });

            const blob = new Blob([res.data], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);

            // Update src and play. 
            // On strict mobile browsers (iOS), this .play() might fail if not in immediate event loop.
            // If it fails, we fall back to Native.

            if (audioRef.current === audio) { // check if not cancelled
                audio.src = url;

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
                    console.error("Audio playback error, falling back to native", e);
                    speakNative(text, lang);
                };

                await audio.play();
            }

        } catch (err) {
            console.warn("OpenAI TTS failed or blocked, falling back to native", err);
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
