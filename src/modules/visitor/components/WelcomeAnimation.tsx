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
                        width: "100vw",
                        height: "100vh",
                        background: theme === "light" 
                            ? `linear-gradient(135deg, #ffffff 0%, ${getTranslucentColor(primaryColor, 0.1)} 100%)`
                            : `linear-gradient(135deg, #05050c 0%, ${getTranslucentColor(primaryColor, 0.15)} 100%)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2147483647,
                        padding: "0",
                        textAlign: "center"
                    }}
                >
                    {!showVideo ? (
                        <div style={{ padding: "2rem", position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            {/* Círculos decorativos animados baseados na cor primária */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    position: "absolute",
                                    width: "600px",
                                    height: "600px",
                                    borderRadius: "50%",
                                    background: `radial-gradient(circle, ${getTranslucentColor(primaryColor, theme === 'light' ? 0.2 : 0.4)} 0%, transparent 70%)`,
                                    filter: "blur(80px)",
                                    zIndex: 0
                                }}
                            />

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                style={{ zIndex: 1 }}
                            >
                                <h1 style={{
                                    fontSize: "3rem",
                                    fontWeight: "900",
                                    color: theme === 'light' ? "#0f172a" : "#f8fafc",
                                    marginBottom: "1rem",
                                    background: theme === 'light'
                                        ? `linear-gradient(to right, ${primaryColor}, #0f172a)`
                                        : `linear-gradient(to right, ${primaryColor}, #ffffff)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textTransform: "uppercase",
                                    letterSpacing: "-0.04em",
                                    lineHeight: 1.1
                                }}>
                                    {isFirstTime
                                        ? t("welcome.firstTime", { name })
                                        : t("welcome.returning", { name })}
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                style={{ zIndex: 1 }}
                            >
                                <p style={{
                                    fontSize: "1.2rem",
                                    color: theme === 'light' ? "#475569" : "#94a3b8",
                                    maxWidth: "600px",
                                    lineHeight: 1.6,
                                    fontWeight: "600",
                                    letterSpacing: "0.01em"
                                }}>
                                    {t("welcome.subtitle")}
                                </p>
                            </motion.div>

                            {/* Logo ou Ícone do Tenant */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                    delay: 1.2, 
                                    duration: 0.8,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                style={{ 
                                    marginTop: "4rem", 
                                    width: "140px",
                                    height: "140px",
                                    borderRadius: "32px",
                                    backgroundColor: theme === 'light' ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)",
                                    backdropFilter: "blur(12px)",
                                    border: theme === 'light' ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "24px",
                                    boxShadow: theme === 'light'
                                        ? `0 20px 40px rgba(0,0,0,0.08), 0 0 20px ${getTranslucentColor(primaryColor, 0.1)}`
                                        : `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${getTranslucentColor(primaryColor, 0.2)}`
                                }}
                            >
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                ) : (
                                    <span style={{ fontSize: "4rem" }}>🏛️</span>
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
