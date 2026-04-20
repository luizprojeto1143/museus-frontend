/**
 * Framer Motion — Presets & Variants
 * Cultura Viva Design System
 *
 * Central library of reusable animation configurations.
 * Import these presets instead of defining animations inline.
 *
 * Usage:
 *   import { fadeInUp, staggerContainer, microInteractions } from '@/lib/motion';
 *   <motion.div variants={fadeInUp} initial="hidden" animate="visible" />
 */
import type { Variants, Transition, MotionProps } from "framer-motion";

// ─── Spring Presets ─────────────────────────────────────────────

export const springs = {
  /** Soft spring — gentle, elegant (cards, panels) */
  soft: { type: "spring", stiffness: 120, damping: 20, mass: 1 } as const,
  /** Bouncy spring — playful, attention-grabbing (notifications, badges) */
  bouncy: { type: "spring", stiffness: 300, damping: 15, mass: 0.8 } as const,
  /** Stiff spring — snappy, responsive (buttons, toggles) */
  stiff: { type: "spring", stiffness: 400, damping: 30, mass: 0.5 } as const,
  /** Smooth spring — fluid, premium feel (page transitions) */
  smooth: { type: "spring", stiffness: 80, damping: 20, mass: 1.2 } as const,
  /** Quick snap — ultra-responsive (micro-interactions) */
  snap: { type: "spring", stiffness: 500, damping: 35, mass: 0.3 } as const,
} satisfies Record<string, Transition>;

// ─── Duration Presets ───────────────────────────────────────────

export const durations = {
  fast: 0.15,
  base: 0.3,
  medium: 0.5,
  slow: 0.7,
  pageTransition: 0.6,
} as const;

// ─── Easing Curves ──────────────────────────────────────────────

export const easings = {
  /** Apple-style premium ease */
  premium: [0.23, 1, 0.32, 1] as [number, number, number, number],
  /** Ease out with slight overshoot */
  smooth: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Ease in-out for symmetrical motion */
  inOut: [0.45, 0, 0.55, 1] as [number, number, number, number],
  /** Decelerate — entering elements */
  decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
  /** Accelerate — exiting elements */
  accelerate: [0.4, 0, 1, 1] as [number, number, number, number],
};

// ─── Entrance Variants ─────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.base, ease: easings.premium },
  },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.medium, ease: easings.premium },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: durations.fast, ease: easings.accelerate },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.medium, ease: easings.premium },
  },
  exit: { opacity: 0, y: 12, transition: { duration: durations.fast } },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.medium, ease: easings.premium },
  },
  exit: { opacity: 0, x: 32, transition: { duration: durations.fast } },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.medium, ease: easings.premium },
  },
  exit: { opacity: 0, x: -32, transition: { duration: durations.fast } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.soft,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: durations.fast },
  },
};

export const slideUp: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { ...springs.smooth, duration: durations.pageTransition },
  },
  exit: {
    y: "100%",
    transition: { duration: durations.base, ease: easings.accelerate },
  },
};

// ─── Container Variants (Stagger Children) ─────────────────────

export const staggerContainer = (
  staggerDelay = 0.08,
  delayChildren = 0.1
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings.premium },
  },
};

// ─── Page Transition Variants ───────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: durations.pageTransition,
      ease: easings.premium,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: {
      duration: durations.base,
      ease: easings.accelerate,
    },
  },
};

// ─── Micro-Interactions ─────────────────────────────────────────

/**
 * Apply to any interactive element:
 *   <motion.button {...microInteractions.button}>Click</motion.button>
 */
export const microInteractions = {
  /** Button — scale + subtle shadow shift */
  button: {
    whileHover: { scale: 1.03, transition: springs.stiff },
    whileTap: { scale: 0.97, transition: springs.snap },
  } satisfies MotionProps,

  /** Card — lift + glow */
  card: {
    whileHover: {
      y: -4,
      transition: springs.soft,
    },
  } satisfies MotionProps,

  /** Icon — rotate hint */
  icon: {
    whileHover: { rotate: 8, scale: 1.1, transition: springs.bouncy },
    whileTap: { scale: 0.9 },
  } satisfies MotionProps,

  /** Link — subtle lift */
  link: {
    whileHover: { x: 4, transition: springs.stiff },
  } satisfies MotionProps,
};

// ─── Scroll Reveal Props ────────────────────────────────────────

/**
 * Common props for scroll-reveal elements.
 * Usage: <motion.div {...scrollReveal}>
 */
export const scrollReveal: MotionProps = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-60px" },
};

/**
 * Scroll reveal with custom variants.
 * Usage: <motion.section variants={fadeInUp} {...scrollRevealProps(0.2)}>
 */
export const scrollRevealProps = (delay = 0): MotionProps => ({
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-60px" },
  transition: { delay },
});

// ─── Layout Animation Helpers ───────────────────────────────────

/** Props for smooth layout animations (reorder, resize) */
export const layoutSmooth: MotionProps = {
  layout: true,
  transition: springs.soft,
};

/** Props for layout with fade-in combination */
export const layoutFadeIn: MotionProps = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: springs.soft,
};

// ─── Skeleton / Loading Variants ────────────────────────────────

export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
};

export const pulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "reverse" as const,
      duration: 1,
      ease: "easeInOut",
    },
  },
};
