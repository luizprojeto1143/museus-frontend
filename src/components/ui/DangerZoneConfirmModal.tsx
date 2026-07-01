import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { springs, durations, easings } from '../../lib/motion';

interface DangerZoneConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    expectedText: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}

export const DangerZoneConfirmModal: React.FC<DangerZoneConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Ação Destrutiva',
    message = 'Esta ação não pode ser desfeita. Por favor, digite o texto abaixo para confirmar.',
    expectedText,
    confirmText = 'Confirmar Exclusão',
    cancelText = 'Cancelar',
    loading = false
}) => {
    const [inputValue, setInputValue] = useState('');
    const isMatch = inputValue === expectedText;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
            setTimeout(() => setInputValue(''), 300);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => setInputValue(''), 300);
    };

    const handleConfirm = () => {
        if (isMatch) {
            onConfirm();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'Enter' && isMatch && !loading) handleConfirm();
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
                    aria-labelledby="danger-modal-title"
                >
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        className={cn(
                            "relative z-10 w-[90%] max-w-[450px]",
                            "bg-slate-900 rounded-[24px]",
                            "border border-rose-500/20",
                            "shadow-2xl shadow-rose-900/20 p-8 text-center"
                        )}
                        initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(2px)" }}
                        transition={springs.soft}
                    >
                        <motion.div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-500 bg-rose-500/10 border border-rose-500/20"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ ...springs.bouncy, delay: 0.1 }}
                        >
                            <AlertOctagon size={28} />
                        </motion.div>

                        <motion.h2
                            id="danger-modal-title"
                            className="text-xl font-black text-white mb-3 italic tracking-tight"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            {title}
                        </motion.h2>

                        <motion.p
                            className="text-sm text-slate-400 mb-6 leading-relaxed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {message}
                        </motion.p>

                        <motion.div 
                            className="mb-8 space-y-3"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-center">
                                <span className="font-mono text-white tracking-widest font-bold select-all">
                                    {expectedText}
                                </span>
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Digite exatamente como acima"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white text-center font-mono outline-none focus:border-rose-500/50 transition-colors"
                            />
                        </motion.div>

                        <motion.div
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.button
                                className="flex-1 py-3 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleClose}
                                disabled={loading}
                            >
                                {cancelText}
                            </motion.button>

                            <motion.button
                                className={cn(
                                    "flex-[2] py-3 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2",
                                    "transition-all",
                                    isMatch 
                                        ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500" 
                                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                                )}
                                whileHover={isMatch && !loading ? { scale: 1.02 } : undefined}
                                whileTap={isMatch && !loading ? { scale: 0.98 } : undefined}
                                onClick={handleConfirm}
                                disabled={!isMatch || loading}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        <Trash2 size={14} /> {confirmText}
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
