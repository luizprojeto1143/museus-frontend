
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../api/client";

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false); // NEW: Audio is ready to play
    const [nativeSupported] = useState(() => "speechSynthesis" in window);

    // Single unified audio element for consistency
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const preparedUrlRef = useRef<string | null>(null);

    useEffect(() => {
        // Initialize the audio element once
        const audio = new Audio();
        audio.preload = "auto";
        audioRef.current = audio;

        // Setup event handlers
        audio.onplay = () => { setIsSpeaking(true); setIsPaused(false); };
        audio.onended = () => { setIsSpeaking(false); setIsPaused(false); setIsReady(false); };
        audio.onerror = () => { setIsSpeaking(false); setIsReady(false); };

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
            if (preparedUrlRef.current) {
                URL.revokeObjectURL(preparedUrlRef.current);
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
        // Note: We keep isReady = true if audio was prepared
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
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            play();
        }
    }, [nativeSupported]);

    // STEP 1: Prepare the audio (fetch from API)
    const prepare = useCallback(async (text: string) => {
        stopAll();
        setIsReady(false);

        try {
            setIsLoading(true);

            const res = await api.post("/ai/tts", { text, voice: "onyx" }, {
                responseType: 'arraybuffer'
            });

            const blob = new Blob([res.data], { type: "audio/mpeg" });

            // Revoke old URL if exists
            if (preparedUrlRef.current) {
                URL.revokeObjectURL(preparedUrlRef.current);
            }

            const url = URL.createObjectURL(blob);
            preparedUrlRef.current = url;

            // Set the audio source (but don't play yet!)
            if (audioRef.current) {
                audioRef.current.src = url;
            }

            setIsReady(true);
            setIsLoading(false);

            return true; // Success
        } catch (err) {
            console.warn("API TTS fetch failed", err);
            setIsLoading(false);
            return false; // Failed
        }
    }, [stopAll]);

    // STEP 2: Play the prepared audio (must be called from user gesture!)
    const playPrepared = useCallback(() => {
        if (!audioRef.current || !isReady) return;

        audioRef.current.play().catch(err => {
            console.error("Playback failed", err);
        });
    }, [isReady]);

    // Legacy combined function - prepares and immediately attempts play
    // Works on desktop, may fail on strict mobile
    const speak = useCallback(async (text: string, lang: string = "pt-BR") => {
        const prepared = await prepare(text);
        if (prepared) {
            playPrepared();
        } else {
            // Fallback to native if API failed
            speakNative(text, lang);
        }
    }, [prepare, playPrepared, speakNative]);

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
        setIsReady(false);
        if (preparedUrlRef.current) {
            URL.revokeObjectURL(preparedUrlRef.current);
            preparedUrlRef.current = null;
        }
    }, [stopAll]);

    return {
        // New two-step API (recommended for mobile)
        prepare,        // Step 1: Load audio from API
        playPrepared,   // Step 2: Play loaded audio (call on user click!)
        isReady,        // True when audio is ready to play

        // Legacy one-step API (works on desktop)
        speak,

        // Common controls
        cancel,
        pause,
        resume,
        isSpeaking,
        isPaused,
        isLoading,
        supported: true
    };
};
