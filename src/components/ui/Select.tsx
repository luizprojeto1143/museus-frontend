import React, { SelectHTMLAttributes, forwardRef, ReactNode, useState, useId } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
    leftIcon?: ReactNode;
}

/**
 * Select — Modern select with animated chevron and focus glow.
 *
 * Uses native `<select>` for maximum accessibility.
 * White-label ready via CSS variables.
 *
 * @example
 * <Select label="Categoria">
 *   <option value="">Selecione...</option>
 *   <option value="art">Arte</option>
 * </Select>
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    label,
    error,
    className = '',
    containerClassName = '',
    id,
    children,
    leftIcon,
    ...props
}, ref) => {
    const autoId = useId();
    const selectId = id || props.name || autoId;
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={cn("mb-4", containerClassName)}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        "w-full px-3 py-2.5 appearance-none",
                        "bg-[var(--bg-surface)] border rounded-[var(--radius-sm)]",
                        "text-[var(--fg-main)] placeholder-[var(--fg-secondary)]",
                        "focus:outline-none focus:ring-2 focus:border-transparent",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-200",
                        error
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-[var(--border-default)] focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]",
                        isFocused && !error && "shadow-[0_0_20px_rgba(212,175,55,0.1)]",
                        leftIcon && "pl-10",
                        "pr-10",
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
                >
                    {children}
                </select>

                {/* Left icon */}
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--fg-secondary)]">
                        {leftIcon}
                    </div>
                )}

                {/* Animated chevron */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <motion.div
                        animate={{ rotate: isFocused ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <ChevronDown
                            size={16}
                            className="text-[var(--fg-secondary)]"
                        />
                    </motion.div>
                </div>
            </div>

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = "Select";
