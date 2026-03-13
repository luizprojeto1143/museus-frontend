import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, X, Zap } from "lucide-react";
import "./AchievementModal.css";

interface AchievementModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievement: {
        title: string;
        description: string;
        icon?: string;
        xpReward?: number;
    } | null;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose, achievement }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 8000); // Auto close after 8s
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="achievement-modal-overlay">
                    <motion.div 
                        className="achievement-modal-card"
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.3 } }}
                    >
                        {/* PARTICLE EFFECTS PLACEHOLDER */}
                        <div className="achievement-burst"></div>

                        <button className="achievement-close" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className="achievement-body">
                            <motion.div 
                                className="achievement-icon-wrapper"
                                initial={{ rotate: -20 }}
                                animate={{ rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                <Award size={64} className="achievement-medal" />
                                <Star className="star-1" size={16} />
                                <Star className="star-2" size={24} />
                            </motion.div>

                            <div className="achievement-text-content">
                                <span className="achievement-badge">Conquista Desbloqueada!</span>
                                <h2 className="achievement-title">{achievement.title}</h2>
                                <p className="achievement-description">{achievement.description}</p>
                            </div>

                            <div className="achievement-reward">
                                <Zap size={16} fill="currentColor" />
                                <span>+{achievement.xpReward || 50} XP</span>
                            </div>

                            <button className="achievement-btn-claim" onClick={onClose}>
                                Fantástico!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
