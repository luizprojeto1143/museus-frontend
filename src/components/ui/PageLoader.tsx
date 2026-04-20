import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springs, fadeIn } from "../../lib/motion";

const loadingMessages = [
  "Carregando...",
  "Preparando interface...",
  "Quase lá...",
  "Organizando dados...",
  "Finalizando...",
];

interface PageLoaderProps {
  /** Optional label below the spinner. Uses rotating messages by default. */
  label?: string;
  /** If true, shows inline (no full-screen overlay) */
  inline?: boolean;
  /** Optional progress value 0-100 */
  progress?: number;
}

/**
 * PageLoader — Smart loading component with Framer Motion.
 *
 * Features:
 * - Rotating loading messages
 * - Optional progress bar
 * - Dual-ring spinner with glow
 * - Fade in/out with AnimatePresence
 *
 * @example
 * <PageLoader />
 * <PageLoader inline label="Buscando obras..." />
 * <PageLoader progress={65} />
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
  label,
  inline = false,
  progress,
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate messages every 2.5s if no fixed label
  useEffect(() => {
    if (label) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [label]);

  const currentMessage = label || loadingMessages[msgIndex];

  return (
    <motion.div
      className={
        inline
          ? "flex flex-col items-center justify-center gap-5 py-12"
          : "flex flex-col items-center justify-center gap-5 min-h-screen w-full bg-[var(--bg-page)]"
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label={currentMessage}
      aria-live="polite"
    >
      {/* Spinner */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--accent-primary, #d4af37)",
            borderRightColor: "var(--accent-primary, #d4af37)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner ring */}
        <motion.div
          className="absolute rounded-full border-2 border-transparent"
          style={{
            inset: "10px",
            borderBottomColor: "var(--accent-secondary, #cd7f32)",
            borderLeftColor: "var(--accent-secondary, #cd7f32)",
            opacity: 0.5,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />

        {/* Center dot with glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            background: "var(--accent-primary, #d4af37)",
            boxShadow: "0 0 12px var(--accent-primary, #d4af37)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 20px rgba(212, 175, 55, 0.15)",
              "0 0 40px rgba(212, 175, 55, 0.3)",
              "0 0 20px rgba(212, 175, 55, 0.15)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Progress bar (optional) */}
      {progress !== undefined && (
        <div className="w-48 h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      )}

      {/* Rotating message */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentMessage}
          className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent-primary)] opacity-50 font-[var(--font-body)]"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.5, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          {currentMessage}
        </motion.span>
      </AnimatePresence>

      {/* Progress percentage */}
      {progress !== undefined && (
        <span className="text-xs tabular-nums text-[var(--fg-secondary)]">
          {Math.round(progress)}%
        </span>
      )}
    </motion.div>
  );
};

export default PageLoader;
