import React, { TextareaHTMLAttributes, forwardRef, useState, useRef, useEffect, useId } from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
    /** Auto-resize to fit content */
    autoResize?: boolean;
    /** Show character count */
    showCount?: boolean;
}

/**
 * Textarea — Modern textarea with auto-resize and character counter.
 *
 * White-label ready via CSS variables.
 *
 * @example
 * <Textarea label="Descrição" autoResize showCount maxLength={500} />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    error,
    className = '',
    containerClassName = '',
    id,
    autoResize = false,
    showCount = false,
    maxLength,
    ...props
}, ref) => {
    const autoId = useId();
    const textareaId = id || props.name || autoId;
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(
        typeof props.value === 'string' ? props.value.length : 0
    );
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Merge refs
    const setRef = (el: HTMLTextAreaElement | null) => {
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    // Auto-resize logic
    useEffect(() => {
        if (!autoResize || !internalRef.current) return;
        const el = internalRef.current;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [props.value, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
        if (autoResize && internalRef.current) {
            internalRef.current.style.height = 'auto';
            internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
        }
        props.onChange?.(e);
    };

    return (
        <div className={cn("mb-4", containerClassName)}>
            {label && (
                <label
                    htmlFor={textareaId}
                    className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5"
                >
                    {label}
                </label>
            )}
            <textarea
                ref={setRef}
                id={textareaId}
                className={cn(
                    "w-full px-3 py-2.5",
                    "bg-[var(--bg-surface)] border rounded-[var(--radius-sm)]",
                    "text-[var(--fg-main)] placeholder-[var(--fg-secondary)]",
                    "focus:outline-none focus:ring-2 focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200 resize-y",
                    autoResize && "resize-none overflow-hidden",
                    error
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[var(--border-default)] focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]",
                    isFocused && !error && "shadow-[0_0_20px_rgba(212,175,55,0.1)]",
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
                onChange={handleChange}
                maxLength={maxLength}
                {...props}
            />

            <div className="flex justify-between items-center mt-1.5">
                {error && (
                    <p className="text-xs font-medium text-red-500" role="alert">
                        {error}
                    </p>
                )}
                {!error && <span />}

                {showCount && (
                    <span
                        className={cn(
                            "text-xs tabular-nums transition-colors",
                            maxLength && charCount >= maxLength * 0.9
                                ? "text-amber-500"
                                : "text-[var(--fg-secondary)]",
                            maxLength && charCount >= maxLength && "text-red-500"
                        )}
                    >
                        {charCount}{maxLength ? `/${maxLength}` : ''}
                    </span>
                )}
            </div>
        </div>
    );
});

Textarea.displayName = "Textarea";
