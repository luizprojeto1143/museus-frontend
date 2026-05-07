import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { springs } from '../../lib/motion';

const buttonVariants = cva(
  /* base */
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-bold uppercase tracking-wider",
    "transition-colors cursor-pointer",
    "border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-gold-solid text-white border-white/40 shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:brightness-110 active:scale-95 z-10",
        secondary:
          "bg-[var(--glass-bg-light)] text-white border-[var(--border-default)] backdrop-blur-sm hover:bg-white/10",
        outline:
          "bg-transparent text-accent-primary border-accent-primary hover:bg-accent-primary hover:text-fg-inverse",
        ghost:
          "bg-transparent text-fg-secondary border-transparent hover:bg-[var(--bg-surface-hover)] hover:text-fg-main",
        glass:
          "bg-[var(--glass-bg)] text-[var(--fg-main)] border-[var(--glass-border)] backdrop-blur-[28px] shadow-[var(--shadow-premium)] hover:bg-[var(--bg-surface-hover)]",
        danger:
          "bg-red-600 text-white border-transparent hover:bg-red-700",
      },
      size: {
        sm: "text-[11px] px-3 py-1.5 rounded-xl",
        md: "text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]",
        lg: "text-sm px-7 py-3.5 rounded-[var(--radius-md)]",
        icon: "p-2.5 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Enable hover/tap micro-animations (default true) */
  animated?: boolean;
}

/**
 * Button — Design System component with CVA variants and Framer Motion.
 *
 * White-label ready: uses CSS variables for all accent colors.
 * Backward compatible with the existing `variant` + `size` API.
 *
 * @example
 * <Button variant="primary" size="lg" leftIcon={<Plus />}>Criar</Button>
 * <Button variant="glass" isLoading>Salvando...</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    animated = true,
    onAnimationStart: _onAnimationStart,
    onDragStart: _onDragStart,
    onDrag: _onDrag,
    onDragEnd: _onDragEnd,
    ...props
}, ref) => {
    const isDisabled = disabled || isLoading;
    const classes = cn(buttonVariants({ variant, size }), className);

    // If animated, wrap with motion.button for hover/tap effects
    if (animated && !isDisabled) {
        return (
            <motion.button
                ref={ref}
                className={classes}
                disabled={isDisabled}
                aria-busy={isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springs.stiff}
                {...props}
            >
                {isLoading && <Loader2 className="animate-spin" size={16} aria-hidden="true" />}
                {!isLoading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
            </motion.button>
        );
    }

    return (
        <button
            ref={ref}
            className={classes}
            disabled={isDisabled}
            aria-busy={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={16} aria-hidden="true" />}
            {!isLoading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = "Button";

/** Export variant function for external use (shadcn/ui pattern) */
export { buttonVariants };
