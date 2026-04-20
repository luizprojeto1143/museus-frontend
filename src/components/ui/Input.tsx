import React, { InputHTMLAttributes, forwardRef, ReactNode, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    containerClassName?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    /** Show a floating label that animates on focus */
    floatingLabel?: boolean;
    /** Show success state */
    success?: boolean;
}

/**
 * Input — Modern input with animated floating label, glow focus ring,
 * error shake animation, and success checkmark.
 *
 * White-label ready: uses CSS variables for all colors.
 *
 * @example
 * <Input label="Nome" placeholder="Digite seu nome" />
 * <Input label="Email" error="Email inválido" leftIcon={<Mail />} />
 * <Input label="Buscar" floatingLabel placeholder=" " />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    className = '',
    containerClassName = '',
    id,
    leftIcon,
    rightIcon,
    floatingLabel = false,
    success = false,
    ...props
}, ref) => {
    const autoId = useId();
    const inputId = id || props.name || autoId;
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';

    const showFloating = floatingLabel && label;
    const isFloated = isFocused || hasValue || !!props.placeholder?.trim();

    return (
        <div className={cn("mb-4", containerClassName)}>
            {/* Standard label (non-floating) */}
            {label && !floatingLabel && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Left icon */}
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--fg-secondary)]">
                        {leftIcon}
                    </div>
                )}

                {/* Input */}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "w-full bg-[var(--bg-surface)] border rounded-[var(--radius-sm)]",
                        "text-[var(--fg-main)] placeholder-[var(--fg-secondary)]",
                        "focus:outline-none focus:ring-2 focus:border-transparent",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-200",
                        // Focus ring color
                        error
                            ? "border-red-500 focus:ring-red-500/30"
                            : success
                                ? "border-emerald-500 focus:ring-emerald-500/30"
                                : "border-[var(--border-default)] focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]",
                        // Glow effect on focus
                        isFocused && !error && !success && "shadow-[0_0_20px_rgba(212,175,55,0.1)]",
                        // Padding
                        leftIcon ? 'pl-10' : 'px-3',
                        rightIcon || error || success ? 'pr-10' : 'px-3',
                        showFloating ? 'pt-5 pb-1.5' : 'py-2.5',
                        className
                    )}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />

                {/* Floating label */}
                {showFloating && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "absolute left-3 transition-all duration-200 pointer-events-none",
                            leftIcon && "left-10",
                            isFloated
                                ? "top-1.5 text-[10px] font-semibold text-[var(--accent-primary)]"
                                : "top-1/2 -translate-y-1/2 text-sm text-[var(--fg-secondary)]"
                        )}
                    >
                        {label}
                    </label>
                )}

                {/* Right icon / Status icons */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        {error ? (
                            <motion.div
                                key="error-icon"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-red-500"
                            >
                                <AlertCircle size={16} />
                            </motion.div>
                        ) : success ? (
                            <motion.div
                                key="success-icon"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-emerald-500"
                            >
                                <CheckCircle2 size={16} />
                            </motion.div>
                        ) : rightIcon ? (
                            <span className="text-[var(--fg-secondary)]">{rightIcon}</span>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            {/* Error message with shake animation */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1.5 text-xs font-medium text-red-500"
                        role="alert"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Helper text */}
            {helperText && !error && (
                <p className="mt-1.5 text-xs text-[var(--fg-secondary)]">
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = "Input";
