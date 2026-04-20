import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

// ─── Accordion Root ─────────────────────────────────────────────

type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  className?: string;
};

const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Root
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  )
);

AccordionRoot.displayName = "Accordion";

// ─── Accordion Item ─────────────────────────────────────────────

interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  className?: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border-subtle)]",
        "bg-[var(--bg-surface)] overflow-hidden",
        "transition-colors hover:border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  )
);

AccordionItem.displayName = "Accordion.Item";

// ─── Accordion Trigger ──────────────────────────────────────────

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  className?: string;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between px-4 py-3",
          "text-sm font-semibold text-[var(--fg-main)]",
          "hover:bg-[var(--bg-surface-hover)] transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-primary)]",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          size={16}
          className="text-[var(--fg-secondary)] transition-transform duration-300 ease-[var(--easing-premium)]"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);

AccordionTrigger.displayName = "Accordion.Trigger";

// ─── Accordion Content (animated height) ────────────────────────

interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  className?: string;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm text-[var(--fg-secondary)]",
        "data-[state=open]:animate-[cv-slide-down_0.3s_ease-out]",
        "data-[state=closed]:animate-[cv-slide-up-reverse_0.2s_ease-in]",
        className
      )}
      {...props}
    >
      <div className="px-4 pb-4 pt-1">{children}</div>
    </AccordionPrimitive.Content>
  )
);

AccordionContent.displayName = "Accordion.Content";

// ─── Composable Export ──────────────────────────────────────────

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
