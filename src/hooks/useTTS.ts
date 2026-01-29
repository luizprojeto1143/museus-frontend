import { useState, useCallback, useEffect } from "react";

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [supported] = useState(() => "speechSynthesis" in window);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (supported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [supported]);

    const speak = useCallback((text: string, lang: string = "pt-BR") => {
        if (!supported) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        setIsLoading(true);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to find a good voice for the language
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.lang.startsWith(lang.split('-')[0]) &&
            (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))
        ) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
            setIsLoading(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setIsLoading(false);
        };

        // Handle voice loading on mobile (voices may not be ready immediately)
        const startSpeech = () => {
            // iOS Safari fix: pause/resume to wake up the speech engine
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        };

        if (voices.length === 0) {
            // Voices not loaded yet, wait for them
            window.speechSynthesis.onvoiceschanged = () => {
                // Re-select voice now that voices are loaded
                const loadedVoices = window.speechSynthesis.getVoices();
                const voice = loadedVoices.find(v =>
                    v.lang.startsWith(lang.split('-')[0])
                );
                if (voice) utterance.voice = voice;
                startSpeech();
                window.speechSynthesis.onvoiceschanged = null;
            };
            // Trigger voice loading
            window.speechSynthesis.getVoices();
        } else {
            startSpeech();
        }
    }, [supported]);

    const pause = useCallback(() => {
        if (supported && isSpeaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [supported, isSpeaking]);

    const resume = useCallback(() => {
        if (supported && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [supported, isPaused]);

    const cancel = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
            setIsLoading(false);
        }
    }, [supported]);

    return {
        speak,
        cancel,
        pause,
        resume,
        isSpeaking,
        isPaused,
        isLoading,
        supported
    };
};
