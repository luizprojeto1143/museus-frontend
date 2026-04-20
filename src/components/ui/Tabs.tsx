import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

// ─── Tabs Root ──────────────────────────────────────────────────

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  className?: string;
}

const TabsRoot: React.FC<TabsProps> = ({ className, children, ...props }) => (
  <TabsPrimitive.Root className={cn("w-full", className)} {...props}>
    {children}
  </TabsPrimitive.Root>
);

// ─── Tabs List (with animated indicator) ────────────────────────

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  className?: string;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative flex gap-1 p-1 rounded-[var(--radius-md)]",
        "bg-[var(--bg-surface)] border border-[var(--border-subtle)]",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  )
);

TabsList.displayName = "Tabs.List";

// ─── Tabs Trigger ───────────────────────────────────────────────

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  className?: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative z-10 flex-1 px-4 py-2 text-sm font-semibold rounded-[var(--radius-sm)]",
        "text-[var(--fg-secondary)] transition-colors duration-200",
        "hover:text-[var(--fg-main)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]",
        "data-[state=active]:text-[var(--fg-inverse)]",
        className
      )}
      {...props}
    >
      {/* Animated active background */}
      <TabsPrimitive.Trigger asChild {...props}>
        <span className="relative z-10">{children}</span>
      </TabsPrimitive.Trigger>
    </TabsPrimitive.Trigger>
  )
);

TabsTrigger.displayName = "Tabs.Trigger";

// ─── Animated Tab Trigger (simpler) ─────────────────────────────

interface AnimatedTabTriggerProps {
  value: string;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const AnimatedTabTrigger: React.FC<AnimatedTabTriggerProps> = ({
  value,
  isActive,
  children,
  className,
}) => (
  <TabsPrimitive.Trigger
    value={value}
    className={cn(
      "relative z-10 flex-1 px-4 py-2 text-sm font-semibold rounded-[var(--radius-sm)]",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
      isActive
        ? "text-[var(--fg-inverse)]"
        : "text-[var(--fg-secondary)] hover:text-[var(--fg-main)]",
      className
    )}
  >
    {isActive && (
      <motion.div
        layoutId="active-tab-indicator"
        className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]"
        style={{ zIndex: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}
    <span className="relative z-10">{children}</span>
  </TabsPrimitive.Trigger>
);

AnimatedTabTrigger.displayName = "Tabs.AnimatedTrigger";

// ─── Tabs Content ───────────────────────────────────────────────

interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  className?: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, children, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-4 focus-visible:outline-none",
        "data-[state=active]:animate-[cv-slide-up_0.3s_ease-out]",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  )
);

TabsContent.displayName = "Tabs.Content";

// ─── Composable Export ──────────────────────────────────────────

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  AnimatedTrigger: AnimatedTabTrigger,
  Content: TabsContent,
});
