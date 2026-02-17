import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, description, ...props }, ref) => {
        return (
            <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        ref={ref}
                        className="peer sr-only"
                        {...props}
                    />
                    <div className={`
                        w-5 h-5 rounded border border-[var(--fg-muted)] peer-checked:bg-[var(--accent-gold)] peer-checked:border-[var(--accent-gold)]
                        transition-all duration-200 flex items-center justify-center
                        group-hover:border-[var(--accent-gold)] bg-[var(--bg-surface)]
                    `}>
                        <Check size={14} className="text-black opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                    </div>
                </div>
                {(label || description) && (
                    <div className="flex flex-col">
                        {label && (
                            <span className="text-sm font-medium text-[var(--fg-main)] group-hover:text-[var(--accent-gold)] transition-colors">
                                {label}
                            </span>
                        )}
                        {description && (
                            <span className="text-xs text-[var(--fg-muted)]">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";
