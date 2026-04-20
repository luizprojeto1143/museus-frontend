import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  /* base */
  "inline-flex items-center gap-1 font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-primary)] text-[var(--fg-inverse)]",
        secondary:
          "bg-[var(--bg-surface-hover)] text-[var(--fg-secondary)] border border-[var(--border-subtle)]",
        outline:
          "border border-[var(--accent-primary)] text-[var(--accent-primary)] bg-transparent",
        success:
          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        warning:
          "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        danger:
          "bg-red-500/15 text-red-400 border border-red-500/20",
        info:
          "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        glass:
          "bg-[var(--glass-bg-light)] text-[var(--fg-main)] border border-[var(--glass-border-light)] backdrop-blur-sm",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5 rounded-md",
        md: "text-xs px-2.5 py-1 rounded-lg",
        lg: "text-sm px-3 py-1.5 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon before text */
  icon?: React.ReactNode;
}

/**
 * Badge — Status tag / label component
 *
 * Uses CVA (class-variance-authority) for variant management.
 * Fully white-label ready via CSS variables.
 *
 * @example
 * <Badge variant="success">Ativo</Badge>
 * <Badge variant="glass" icon={<Star size={12} />}>Premium</Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
