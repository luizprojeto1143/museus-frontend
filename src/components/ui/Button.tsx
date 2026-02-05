import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    ...props
}, ref) => {

    // Mapeamento para as classes globais definidas em src/styles.css
    const variantClass = `btn-${variant}`;
    const sizeClass = size === 'md' ? '' : `btn-${size}`; // md é o padrão na classe .btn

    return (
        <button
            ref={ref}
            className={`btn ${variantClass} ${sizeClass} ${className}`}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={16} aria-hidden="true" />}
            {!isLoading && leftIcon && <span className="mr-2" aria-hidden="true">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2" aria-hidden="true">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = "Button";
