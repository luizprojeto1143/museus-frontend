
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../api/client";

// Tiny silent MP3 to "unlock" the audio element on mobile interaction
const SILENT_MP3 = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTS1UAAAAOAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAJAAAB3AAZvLm9ub29ub29vb29vb29vb29vb29vb29vb29vb29vb29vb29//OEAAAAAAAAAAAAAAAAAAAAAAAAMGluZgAAAA8AAAAJAAAB3AAZvLm9ub29ub29vb29vb29vb29vb29vb29vb29vb29vb29vb29//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjY1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP//OEAAAAAAAAAAAAAAAAAAAAAAAAP";

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [nativeSupported] = useState(() => "speechSynthesis" in window);

    // Single unified audio element for consistency
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize the audio element once
        const audio = new Audio();
        // Important properties for mobile
        audio.preload = "auto";
        audio.autoplay = false;
        audioRef.current = audio;

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const stopAll = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.loop = false; // Reset loop just in case
        }
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

        // Standard mobile wake-up for native
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                play();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            // Just in case
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            play();
        }
    }, [nativeSupported]);

    const speak = useCallback(async (text: string, lang: string = "pt-BR") => {
        stopAll();

        const audio = audioRef.current;
        if (!audio) return;

        // 1. SILENT UNLOCK & KEEP-ALIVE
        // We set loop=true so the audio channel stays "hot" (active) 
        // while we wait for the network request.
        // Otherwise, if the silent file finishes and the network lags, iOS suspends the session.
        try {
            audio.loop = true;
            audio.src = SILENT_MP3;
            await audio.play();
        } catch (e) {
            console.warn("Silent unlock failed", e);
            // Non-fatal, we try to proceed anyway or fallback
        }

        try {
            setIsLoading(true);

            // 2. Fetch voice from API
            const res = await api.post("/ai/tts", { text, voice: "onyx" }, {
                responseType: 'arraybuffer'
            });

            const blob = new Blob([res.data], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);

            // 3. Swap and Play
            // Crucial: Stop looping, pause, swap, play.

            audio.pause(); // Pause the silent loop
            audio.loop = false; // Disable loop for the speech
            audio.src = url;

            audio.onplay = () => { setIsSpeaking(true); setIsPaused(false); setIsLoading(false); };
            audio.onended = () => { setIsSpeaking(false); setIsPaused(false); };
            audio.onerror = (e) => {
                console.error("Audio playback error", e);
                speakNative(text, lang);
            };

            await audio.play();

        } catch (err) {
            console.warn("API TTS fetch/play failed", err);
            speakNative(text, lang);
        } finally {
            // If we failed and are still looping the silent track, stop it.
            if (audio.loop) {
                audio.pause();
                audio.loop = false;
            }
            if (audio.paused && !isSpeaking) setIsLoading(false);
        }

    }, [stopAll, speakNative, isSpeaking]);

    const pause = useCallback(() => {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPaused(true);
        } else {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, []);

    const resume = useCallback(() => {
        if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
            audioRef.current.play();
            setIsPaused(false);
        } else {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, []);

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
