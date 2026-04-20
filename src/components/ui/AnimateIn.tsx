import React from "react";
import { motion, useInView } from "framer-motion";
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
} from "../../lib/motion";

type AnimateVariant =
  | "fadeIn"
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "scaleIn";

const variantMap = {
  fadeIn,
  fadeUp: fadeInUp,
  fadeDown: fadeInDown,
  fadeLeft: fadeInLeft,
  fadeRight: fadeInRight,
  scaleIn,
};

interface AnimateInProps {
  children: React.ReactNode;
  /** Animation variant. Default: "fadeUp" */
  variant?: AnimateVariant;
  /** Extra delay in seconds */
  delay?: number;
  /** Trigger only once when in view */
  once?: boolean;
  /** Viewport margin for triggering */
  margin?: string;
  /** Optional className */
  className?: string;
  /** Optional style */
  style?: React.CSSProperties;
  /** HTML tag to render. Default: "div" */
  as?: keyof typeof motion;
}

/**
 * AnimateIn — Scroll-reveal wrapper component.
 *
 * Wraps children with Framer Motion's `whileInView` for
 * automatic entrance animation when scrolled into viewport.
 *
 * @example
 * <AnimateIn variant="fadeUp" delay={0.2}>
 *   <Card>Content</Card>
 * </AnimateIn>
 */
export const AnimateIn: React.FC<AnimateInProps> = ({
  children,
  variant = "fadeUp",
  delay = 0,
  once = true,
  margin = "-60px",
  className,
  style,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: margin as `${number}px` });

  const selectedVariant = variantMap[variant];

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={selectedVariant}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

AnimateIn.displayName = "AnimateIn";
