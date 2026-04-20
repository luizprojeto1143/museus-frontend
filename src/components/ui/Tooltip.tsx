import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/cn";

interface TooltipProps {
  children: React.ReactNode;
  /** Tooltip content */
  content: React.ReactNode;
  /** Side preference */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment */
  align?: "start" | "center" | "end";
  /** Delay before opening (ms) */
  delayDuration?: number;
  /** Additional className for the content */
  className?: string;
}

/**
 * Tooltip — Radix UI primitive + Framer Motion animation.
 *
 * Accessible by default (keyboard, screen reader).
 *
 * @example
 * <Tooltip content="Editar obra">
 *   <button><Edit size={16} /></button>
 * </Tooltip>
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

        <AnimatePresence>
          {open && (
            <TooltipPrimitive.Portal forceMount>
              <TooltipPrimitive.Content
                side={side}
                align={align}
                sideOffset={6}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: side === "top" ? 4 : -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: side === "top" ? 4 : -4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  className={cn(
                    "z-[var(--z-tooltip,600)] px-3 py-1.5 text-xs font-medium rounded-lg",
                    "bg-[var(--bg-surface)] text-[var(--fg-main)]",
                    "border border-[var(--border-default)]",
                    "shadow-lg backdrop-blur-sm",
                    "select-none",
                    className
                  )}
                >
                  {content}
                  <TooltipPrimitive.Arrow
                    className="fill-[var(--bg-surface)]"
                    width={10}
                    height={5}
                  />
                </motion.div>
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          )}
        </AnimatePresence>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

Tooltip.displayName = "Tooltip";
