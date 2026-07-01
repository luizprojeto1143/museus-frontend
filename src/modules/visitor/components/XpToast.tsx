import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star, Zap } from "lucide-react";
import "./XpToast.css";

interface UnlockedAchievement {
  id: string;
  title: string;
  iconUrl?: string | null;
}

interface XpToastProps {
  xpGained: number;
  stampCreated?: boolean;
  achievements?: UnlockedAchievement[];
  onClose: () => void;
  /** Auto-close after ms (default 3000) */
  autoClose?: number;
}

export const XpToast: React.FC<XpToastProps> = ({
  xpGained,
  stampCreated = false,
  achievements = [],
  onClose,
  autoClose = 3200
}) => {
  useEffect(() => {
    if (autoClose > 0) {
      const t = setTimeout(onClose, autoClose);
      return () => clearTimeout(t);
    }
  }, [autoClose, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="xp-toast"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* XP Badge */}
        {xpGained > 0 && (
          <motion.div
            className="xp-toast-xp"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
          >
            <Zap size={18} className="xp-toast-zap" />
            <span className="xp-toast-amount">+{xpGained} XP</span>
          </motion.div>
        )}

        {/* Stamp badge */}
        {stampCreated && (
          <motion.div
            className="xp-toast-stamp"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Star size={14} />
            <span>Carimbo adicionado ao seu passaporte!</span>
          </motion.div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            className="xp-toast-achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {achievements.map((a) => (
              <div key={a.id} className="xp-toast-achievement-item">
                <CheckCircle2 size={13} />
                <span>Conquista: <strong>{a.title}</strong></span>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
