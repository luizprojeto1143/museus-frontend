import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface WelcomeAnimationProps {
    name: string;
    email: string;
    onComplete: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ name, email, onComplete }) => {
    const { t } = useTranslation();
    const [show, setShow] = useState(true);
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
        // Timer para fechar
        const timer = setTimeout(() => {
            setShow(false);
        }, 3500); // 3.5 segundos de exibição

        return () => clearTimeout(timer);
    }, []);

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
                        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2147483647,
                        padding: "2rem",
                        textAlign: "center"
                    }}
                >
                    {/* Círculos decorativos animados */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: "absolute",
                            width: "300px",
                            height: "300px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)",
                            filter: "blur(40px)",
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
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            color: "#f8fafc",
                            marginBottom: "1rem",
                            background: "linear-gradient(to right, #38bdf8, #818cf8)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            {isFirstTime
                                ? t("welcome.firstTime", { name })
                                : t("welcome.returning", { name })}
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        style={{ zIndex: 1 }}
                    >
                        <p style={{
                            fontSize: "1.2rem",
                            color: "#94a3b8",
                            maxWidth: "600px",
                            lineHeight: 1.6
                        }}>
                            {t("welcome.subtitle")}
                        </p>
                    </motion.div>

                    {/* Ícone ou Logo animado */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        style={{ marginTop: "3rem", fontSize: "3rem" }}
                    >
                        🏛️
                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};
