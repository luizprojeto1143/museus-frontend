import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    label,
    error,
    className = '',
    containerClassName = '',
    id,
    children,
    ...props
}, ref) => {
    const selectId = id || props.name;

    return (
        <div className={`mb-4 ${containerClassName}`}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    id={selectId}
                    className={`
                        w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm
                        placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed appearance-none
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <ChevronDown size={16} />
                </div>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});
