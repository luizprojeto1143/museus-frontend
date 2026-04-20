import React from "react";
import { motion, type MotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { microInteractions, springs } from "../../lib/motion";

// ─── Card Root ──────────────────────────────────────────────────

const cardVariants = cva(
  /* base */
  "relative overflow-hidden transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)]",
        glass:
          "bg-[var(--glass-bg)] backdrop-blur-[28px] border border-[var(--glass-border)] shadow-[var(--shadow-premium)]",
        elevated:
          "bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg",
        interactive:
          "bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] cursor-pointer",
        ghost:
          "bg-transparent border border-transparent",
      },
      radius: {
        md: "rounded-[var(--radius-md)]",
        lg: "rounded-[var(--radius-lg)]",
        xl: "rounded-[var(--radius-xl)]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "lg",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Enable hover animation */
  animated?: boolean;
  /** Glow effect on hover (uses accent color) */
  glow?: boolean;
}

const CardRoot: React.FC<CardProps> = ({
  className,
  variant,
  radius,
  padding,
  animated = false,
  glow = false,
  children,
  style,
  ...props
}) => {
  const baseClass = cn(cardVariants({ variant, radius, padding }), className);

  // Glass sheen overlay
  const sheenOverlay =
    variant === "glass" ? (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05), transparent 60%)",
        }}
        aria-hidden="true"
      />
    ) : null;

  if (animated || variant === "interactive") {
    return (
      <motion.div
        className={baseClass}
        style={{
          ...style,
          ...(glow
            ? { transition: "box-shadow 0.4s ease" }
            : {}),
        }}
        {...(microInteractions.card as MotionProps)}
        whileHover={{
          ...microInteractions.card.whileHover,
          ...(glow
            ? {
                boxShadow:
                  "0 0 40px color-mix(in srgb, var(--accent-primary) 25%, transparent)",
              }
            : {}),
        }}
        {...(props as MotionProps)}
      >
        {sheenOverlay}
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass} style={style} {...props}>
      {sheenOverlay}
      {children}
    </div>
  );
};

CardRoot.displayName = "Card";

// ─── Card.Header ────────────────────────────────────────────────

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

CardHeader.displayName = "Card.Header";

// ─── Card.Content ───────────────────────────────────────────────

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("py-4", className)} {...props}>
    {children}
  </div>
);

CardContent.displayName = "Card.Content";

// ─── Card.Footer ────────────────────────────────────────────────

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

CardFooter.displayName = "Card.Footer";

// ─── Composable Export ──────────────────────────────────────────

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});
