import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { registerGSAPPlugins } from "../../lib/gsap-utils";
import { cn } from "../../lib/cn";

interface AnimatedCounterProps {
  /** Target number to count to */
  value: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before starting */
  delay?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Text prefix (e.g. "R$") */
  prefix?: string;
  /** Text suffix (e.g. "%", "k") */
  suffix?: string;
  /** Use ScrollTrigger to start on view */
  scrollTriggered?: boolean;
  /** Additional className */
  className?: string;
  /** Style */
  style?: React.CSSProperties;
}

/**
 * AnimatedCounter — Animated number that counts up from 0.
 *
 * Powered by GSAP for smooth, performant counting.
 * Perfect for dashboards, statistics, and KPI cards.
 *
 * @example
 * <AnimatedCounter value={12847} suffix="+" className="stat-value" />
 * <AnimatedCounter value={98.5} decimals={1} suffix="%" />
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  scrollTriggered = true,
  className,
  style,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    registerGSAPPlugins();

    if (!ref.current || hasAnimated.current) return;

    const el = ref.current;
    const counter = { value: 0 };

    const formatValue = (val: number) => {
      const formatted = val.toFixed(decimals);
      // Add thousands separator for pt-BR
      const [intPart, decPart] = formatted.split(".");
      const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return `${prefix}${decPart ? `${withSep},${decPart}` : withSep}${suffix}`;
    };

    el.textContent = formatValue(0);

    const tweenConfig: gsap.TweenVars = {
      value,
      duration,
      delay,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = formatValue(counter.value);
      },
      onComplete: () => {
        hasAnimated.current = true;
      },
    };

    if (scrollTriggered) {
      tweenConfig.scrollTrigger = {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      };
    }

    const tween = gsap.to(counter, tweenConfig);

    return () => {
      tween.kill();
    };
  }, [value, duration, delay, decimals, prefix, suffix, scrollTriggered]);

  // Reset animation when value changes
  useEffect(() => {
    hasAnimated.current = false;
  }, [value]);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      style={style}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {`${prefix}0${suffix}`}
    </span>
  );
};

AnimatedCounter.displayName = "AnimatedCounter";
