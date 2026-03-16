import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface WelcomeAnimationProps {
    name: string;
    email: string;
    videoUrl?: string;
    logoUrl?: string;
    primaryColor?: string;
    theme?: "light" | "dark";
    onComplete: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ 
    name, 
    email, 
    videoUrl, 
    logoUrl,
    primaryColor = "#d4af37",
    theme = "dark",
    onComplete 
}) => {
    const { t } = useTranslation();
    const [show, setShow] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const [isFirstTime] = useState(() => {
        const storageKey = `welcome_seen_${email}`;
        const hasSeen = localStorage.getItem(storageKey);
        if (!hasSeen) {
            localStorage.setItem(storageKey, "true");
            return true;
        }
        return false;
    });

    useEffect(() => {
        // Se tiver vídeo, mostra o vídeo após a animação de texto
        // Se não tiver, fecha após o timer
        const timer = setTimeout(() => {
            if (videoUrl) {
                setShowVideo(true);
            } else {
                setShow(false);
            }
        }, 3500); // 3.5 segundos de exibição do texto

        return () => clearTimeout(timer);
    }, [videoUrl]);

    const handleVideoEnd = () => {
        setShow(false);
    };

    // Helper to get translucent version of primary color
    const getTranslucentColor = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return (
        <AnimatePresence onExitComplete={onComplete}>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: theme === "light" ? "#ffffff" : "#05050c",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2147483647,
                        padding: "1rem",
                        textAlign: "center",
                        overflow: "hidden"
                    }}
                >
                    {/* Camada de gradiente sutil sobre o fundo sólido */}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: theme === 'light' 
                            ? `linear-gradient(135deg, #ffffff 0%, ${getTranslucentColor(primaryColor, 0.05)} 100%)`
                            : `linear-gradient(135deg, rgba(5,5,12,0) 0%, ${getTranslucentColor(primaryColor, 0.1)} 100%)`,
                        pointerEvents: "none"
                    }} />

                    {!showVideo ? (
                        <div style={{ position: "relative", width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                            {/* Círculos decorativos menores */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.2, 0.4, 0.2],
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    position: "absolute",
                                    width: "300px",
                                    height: "300px",
                                    borderRadius: "50%",
                                    background: `radial-gradient(circle, ${getTranslucentColor(primaryColor, theme === 'light' ? 0.15 : 0.3)} 0%, transparent 70%)`,
                                    filter: "blur(50px)",
                                    zIndex: -1
                                }}
                            />

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <h1 style={{
                                    fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
                                    fontWeight: "900",
                                    color: theme === 'light' ? "#0f172a" : "#f8fafc",
                                    marginBottom: "1rem",
                                    background: theme === 'light'
                                        ? `linear-gradient(to right, ${primaryColor}, #1e293b)`
                                        : `linear-gradient(to right, ${primaryColor}, #ffffff)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textTransform: "uppercase",
                                    letterSpacing: "-0.02em",
                                    lineHeight: "1.2"
                                }}>
                                    {isFirstTime
                                        ? t("welcome.firstTime", { name })
                                        : t("welcome.returning", { name })}
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <p style={{
                                    fontSize: "min(1rem, 4vw)",
                                    color: theme === 'light' ? "#64748b" : "#94a3b8",
                                    maxWidth: "80%",
                                    lineHeight: 1.5,
                                    margin: "0 auto"
                                }}>
                                    {t("welcome.subtitle")}
                                </p>
                            </motion.div>

                            {/* Logo com carregamento rápido e garantido */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                style={{ 
                                    marginTop: "2.5rem", 
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "24px",
                                    backgroundColor: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "15px",
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                    border: `2px solid ${getTranslucentColor(primaryColor, 0.2)}`
                                }}
                            >
                                {logoUrl ? (
                                    <img 
                                        src={logoUrl} 
                                        alt="Logo" 
                                        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size: 3rem">🏛️</span>';
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: "3rem" }}>🏛️</span>
                                )}
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-black w-full h-full flex items-center justify-center relative"
                        >
                            <button
                                onClick={handleVideoEnd}
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    right: "20px",
                                    zIndex: 50,
                                    background: "rgba(255, 255, 255, 0.2)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "20px",
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    backdropFilter: "blur(4px)"
                                }}
                            >
                                Pular / Fechar
                            </button>

                            <video
                                src={videoUrl}
                                autoPlay
                                controls
                                onEnded={handleVideoEnd}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                                }}
                            />
                        </motion.div>
                    )}

                </motion.div>
            )}
        </AnimatePresence>
    );
};
