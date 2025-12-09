import { useState, useCallback } from "react";

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [supported] = useState(() => "speechSynthesis" in window);

    const speak = useCallback((text: string, lang: string = "pt-BR") => {
        if (!supported) return;



        // Cancelar qualquer fala anterior
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {

            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {

            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (e) => {
            console.error("TTS: onerror event", e);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [supported]);

    const cancel = useCallback(() => {
        if (!supported) return;

        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }, [supported]);

    const pause = useCallback(() => {
        if (!supported) return;
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [supported]);

    const resume = useCallback(() => {
        if (!supported) return;
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [supported]);

    return {
        speak,
        cancel,
        pause,
        resume,
        isSpeaking,
        isPaused,
        supported
    };
};
