
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
        // ALERT DEBUG: Remove after testing
        alert(`[DEBUG] Clicked Speak. Text len: ${text.length}`);

        stopAll();

        const audio = audioRef.current;
        if (!audio) {
            alert("[DEBUG] Error: No audio element found");
            return;
        }

        // 1. SILENT UNLOCK (Crucial for Mobile)
        try {
            audio.src = SILENT_MP3;
            await audio.play();
            // alert("[DEBUG] Silent unlock success");
        } catch (e) {
            alert(`[DEBUG] Silent unlock failed: ${e}`);
        }

        try {
            setIsLoading(true);

            // 2. Fetch
            alert("[DEBUG] Fetching API...");
            const res = await api.post("/ai/tts", { text, voice: "onyx" }, {
                responseType: 'arraybuffer'
            });
            alert(`[DEBUG] API Success. Bytes: ${res.data.byteLength}`);

            const blob = new Blob([res.data], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);

            // 3. Swap the source
            audio.src = url;

            // Setup events
            audio.onplay = () => { setIsSpeaking(true); setIsPaused(false); setIsLoading(false); };
            audio.onended = () => { setIsSpeaking(false); setIsPaused(false); };
            audio.onerror = (e) => {
                alert("[DEBUG] Audio playback error event");
                console.error("Audio playback error", e);
                speakNative(text, lang);
            };

            // 4. Play the real content
            await audio.play();
            alert("[DEBUG] Calling play() on real audio");

        } catch (err: any) {
            alert(`[DEBUG] API Failed: ${err.message || err}`);
            console.warn("API TTS fetch/play failed", err);
            speakNative(text, lang);
        } finally {
            // Only clear loading if we aren't speaking (error case handled above)
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
