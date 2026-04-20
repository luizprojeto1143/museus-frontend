import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { springs } from "../../lib/motion";

// ─── Dialog Root ────────────────────────────────────────────────

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogRoot: React.FC<DialogProps> = ({ open, onOpenChange, children }) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    {children}
  </DialogPrimitive.Root>
);

// ─── Dialog Trigger ─────────────────────────────────────────────

const DialogTrigger = DialogPrimitive.Trigger;

// ─── Dialog Content ─────────────────────────────────────────────

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  /** Width preset */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Show close button */
  showClose?: boolean;
  title?: string;
  description?: string;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[90vw]",
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      children,
      className,
      size = "md",
      showClose = true,
      title,
      description,
    },
    ref
  ) => {
    return (
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          <DialogPrimitive.Overlay asChild>
            <motion.div
              className="fixed inset-0 z-[var(--z-modal,400)] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </DialogPrimitive.Overlay>

          <DialogPrimitive.Content asChild>
            <motion.div
              ref={ref}
              className={cn(
                "fixed z-[calc(var(--z-modal,400)+1)] top-1/2 left-1/2",
                "w-[calc(100%-2rem)]",
                sizeMap[size],
                "bg-[var(--bg-surface)] border border-[var(--border-default)]",
                "rounded-[var(--radius-lg)] shadow-[var(--shadow-premium)]",
                "p-6 focus:outline-none",
                className
              )}
              initial={{
                opacity: 0,
                scale: 0.92,
                x: "-50%",
                y: "-48%",
                filter: "blur(4px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: "-50%",
                y: "-50%",
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                x: "-50%",
                y: "-48%",
                filter: "blur(2px)",
              }}
              transition={springs.soft}
            >
              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    {title && (
                      <DialogPrimitive.Title className="text-lg font-bold text-[var(--fg-main)]">
                        {title}
                      </DialogPrimitive.Title>
                    )}
                    {description && (
                      <DialogPrimitive.Description className="text-sm text-[var(--fg-secondary)] mt-1">
                        {description}
                      </DialogPrimitive.Description>
                    )}
                  </div>
                  {showClose && (
                    <DialogPrimitive.Close asChild>
                      <button
                        className={cn(
                          "flex-shrink-0 p-1.5 rounded-lg",
                          "text-[var(--fg-secondary)] hover:text-[var(--fg-main)]",
                          "hover:bg-[var(--bg-surface-hover)]",
                          "transition-colors duration-150",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                        )}
                        aria-label="Fechar"
                      >
                        <X size={18} />
                      </button>
                    </DialogPrimitive.Close>
                  )}
                </div>
              )}

              {/* Body */}
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </AnimatePresence>
      </DialogPrimitive.Portal>
    );
  }
);

DialogContent.displayName = "Dialog.Content";

// ─── Composable Export ──────────────────────────────────────────

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Close: DialogPrimitive.Close,
});
