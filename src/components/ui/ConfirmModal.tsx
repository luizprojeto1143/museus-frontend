import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { springs, durations, easings } from '../../lib/motion';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

const variantConfig = {
    danger: {
        icon: <Trash2 size={28} />,
        bgClass: "bg-red-500",
        btnClass: "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800",
    },
    warning: {
        icon: <AlertTriangle size={28} />,
        bgClass: "bg-amber-500",
        btnClass: "bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800",
    },
    info: {
        icon: <Check size={28} />,
        bgClass: "bg-blue-500",
        btnClass: "bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800",
    },
};

/**
 * Confirmation Modal Component
 * Used for destructive actions like delete, cancel, etc.
 *
 * Modernized with Framer Motion AnimatePresence for smooth entry/exit,
 * animated backdrop blur, and micro-interactions on buttons.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Ação',
    message = 'Tem certeza que deseja continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false
}) => {
    const config = variantConfig[variant];

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: durations.fast }}
                    onClick={handleBackdropClick}
                    onKeyDown={handleKeyDown}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-modal-title"
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <motion.div
                        className={cn(
                            "relative z-10 w-[90%] max-w-[400px]",
                            "bg-[var(--bg-surface)] rounded-[var(--radius-lg)]",
                            "border border-[var(--border-default)]",
                            "shadow-[var(--shadow-premium)] p-8 text-center"
                        )}
                        initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(2px)" }}
                        transition={springs.soft}
                    >
                        {/* Animated Icon */}
                        <motion.div
                            className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-white",
                                config.bgClass
                            )}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ ...springs.bouncy, delay: 0.1 }}
                        >
                            {config.icon}
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            id="confirm-modal-title"
                            className="text-lg font-bold text-[var(--fg-main)] mb-2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: durations.base, ease: easings.premium }}
                        >
                            {title}
                        </motion.h2>

                        {/* Message */}
                        <motion.p
                            className="text-sm text-[var(--fg-secondary)] mb-6 leading-relaxed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: durations.base, ease: easings.premium }}
                        >
                            {message}
                        </motion.p>

                        {/* Action buttons */}
                        <motion.div
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: durations.base, ease: easings.premium }}
                        >
                            <motion.button
                                className={cn(
                                    "flex-1 py-3 px-5 rounded-[var(--radius-md)] font-semibold text-sm",
                                    "bg-[var(--bg-surface-hover)] text-[var(--fg-main)]",
                                    "border border-[var(--border-subtle)]",
                                    "transition-colors hover:bg-[var(--border-default)]"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                disabled={loading}
                                aria-label={cancelText}
                            >
                                {cancelText}
                            </motion.button>

                            <motion.button
                                className={cn(
                                    "flex-1 py-3 px-5 rounded-[var(--radius-md)] font-semibold text-sm text-white",
                                    "border border-transparent",
                                    "transition-all",
                                    "disabled:opacity-60 disabled:cursor-not-allowed",
                                    config.btnClass
                                )}
                                whileHover={!loading ? { scale: 1.02 } : undefined}
                                whileTap={!loading ? { scale: 0.98 } : undefined}
                                onClick={onConfirm}
                                disabled={loading}
                                aria-label={confirmText}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mx-auto" size={18} />
                                ) : (
                                    confirmText
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
