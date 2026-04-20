import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { springs } from "../../lib/motion";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Optional label text */
  label?: string;
  /** Optional description below label */
  description?: string;
  /** Size preset */
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { root: "w-8 h-5", thumb: "w-3.5 h-3.5", translate: 12 },
  md: { root: "w-11 h-6", thumb: "w-5 h-5", translate: 20 },
  lg: { root: "w-14 h-7", thumb: "w-6 h-6", translate: 28 },
};

/**
 * Switch — Toggle component built on Radix UI with spring animation.
 *
 * @example
 * <Switch
 *   label="Modo escuro"
 *   description="Alterna entre tema claro e escuro"
 *   checked={isDark}
 *   onCheckedChange={setIsDark}
 * />
 */
export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, description, size = "md", ...props }, ref) => {
  const styles = sizeStyles[size];

  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group", className)}>
      <SwitchPrimitive.Root
        ref={ref}
        className={cn(
          styles.root,
          "relative inline-flex items-center rounded-full shrink-0",
          "transition-colors duration-200",
          "bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]",
          "data-[state=checked]:bg-[var(--accent-primary)] data-[state=checked]:border-[var(--accent-primary)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            className={cn(
              styles.thumb,
              "block rounded-full shadow-md",
              "bg-white",
              "data-[state=checked]:shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            )}
            layout
            transition={springs.stiff}
            style={{ marginLeft: 2 }}
            animate={{
              x: props.checked ? styles.translate : 0,
            }}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-[var(--fg-main)] group-hover:text-[var(--accent-primary)] transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-[var(--fg-secondary)]">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
});

Switch.displayName = "Switch";
