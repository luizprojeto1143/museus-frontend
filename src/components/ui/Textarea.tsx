import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    error,
    className = '',
    containerClassName = '',
    id,
    ...props
}, ref) => {
    const textareaId = id || props.name;

    return (
        <div className={`mb-4 ${containerClassName}`}>
            {label && (
                <label
                    htmlFor={textareaId}
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                className={`
                    w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm
                    placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = "Textarea";
