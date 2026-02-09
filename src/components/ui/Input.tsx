import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    className = '',
    containerClassName = '',
    id,
    leftIcon,
    rightIcon,
    ...props
}, ref) => {
    const inputId = id || props.name;

    return (
        <div className={`mb-4 ${containerClassName}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                        w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm
                        placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${leftIcon ? 'pl-10' : 'px-3'}
                        ${rightIcon ? 'pr-10' : 'px-3'}
                        py-2
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";
