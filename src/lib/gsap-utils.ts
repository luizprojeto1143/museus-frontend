/**
 * GSAP Utilities — Cultura Viva Design System
 *
 * Advanced animation helpers powered by GSAP + ScrollTrigger.
 * These complement Framer Motion for cases where GSAP shines:
 * - ScrollTrigger parallax
 * - Text reveal (char-by-char)
 * - Magnetic cursor effects
 * - Counter animations
 *
 * Usage:
 *   import { useGSAP, textReveal, counterUp } from '@/lib/gsap-utils';
 */
import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ─── Plugin Registration ────────────────────────────────────────

let _registered = false;

export function registerGSAPPlugins() {
  if (_registered) return;
  gsap.registerPlugin(ScrollTrigger);
  _registered = true;
}

// ─── useGSAP Hook ───────────────────────────────────────────────

/**
 * Safe GSAP hook with automatic cleanup.
 * Creates a GSAP context scoped to a container ref.
 *
 * @example
 * const containerRef = useGSAP((self) => {
 *   gsap.from(".title", { opacity: 0, y: 30 });
 * }, []);
 */
export function useGSAP(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = []
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGSAPPlugins();

    const ctx = gsap.context(() => {
      callback(ctx!);
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

// ─── Text Reveal Animation ──────────────────────────────────────

/**
 * Split text into chars and animate them in sequentially.
 * Call this from inside a useGSAP callback.
 *
 * @param selector - CSS selector or element
 * @param options  - Duration, stagger delay, etc.
 */
export function textReveal(
  selector: string | Element,
  options: {
    duration?: number;
    stagger?: number;
    y?: number;
    delay?: number;
    ease?: string;
  } = {}
) {
  const {
    duration = 0.6,
    stagger = 0.03,
    y = 20,
    delay = 0,
    ease = "power3.out",
  } = options;

  const el =
    typeof selector === "string"
      ? document.querySelector(selector)
      : selector;

  if (!el || !el.textContent) return;

  const text = el.textContent;
  el.textContent = "";
  el.setAttribute("aria-label", text);

  const chars = text.split("").map((char) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    span.style.opacity = "0";
    span.setAttribute("aria-hidden", "true");
    el.appendChild(span);
    return span;
  });

  gsap.fromTo(
    chars,
    { opacity: 0, y, rotateX: -40 },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration,
      stagger,
      delay,
      ease,
    }
  );
}

// ─── Parallax Background ────────────────────────────────────────

/**
 * Apply a parallax scrolling effect to an element.
 *
 * @param el    - The element to parallax
 * @param speed - Multiplier (0.5 = half speed, 2 = double speed)
 */
export function parallaxBg(
  el: string | Element,
  speed = 0.5,
  options: {
    start?: string;
    end?: string;
  } = {}
) {
  const { start = "top bottom", end = "bottom top" } = options;

  gsap.to(el, {
    y: () => (1 - speed) * 200,
    ease: "none",
    scrollTrigger: {
      trigger: el as gsap.DOMTarget,
      start,
      end,
      scrub: true,
    },
  });
}

// ─── Counter Up Animation ───────────────────────────────────────

/**
 * Animate a number from 0 to target value.
 * Perfect for dashboard statistics.
 *
 * @param el     - Element to update textContent
 * @param target - Target number
 * @param options - Duration, formatting, etc.
 */
export function counterUp(
  el: Element,
  target: number,
  options: {
    duration?: number;
    delay?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    useScrollTrigger?: boolean;
  } = {}
) {
  const {
    duration = 2,
    delay = 0,
    prefix = "",
    suffix = "",
    decimals = 0,
    useScrollTrigger = true,
  } = options;

  const counter = { value: 0 };

  const config: gsap.TweenVars = {
    value: target,
    duration,
    delay,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = `${prefix}${counter.value.toFixed(decimals)}${suffix}`;
    },
  };

  if (useScrollTrigger) {
    config.scrollTrigger = {
      trigger: el as gsap.DOMTarget,
      start: "top 85%",
      toggleActions: "play none none none",
    };
  }

  gsap.to(counter, config);
}

// ─── Magnetic Button Effect ─────────────────────────────────────

/**
 * Create a magnetic cursor attraction effect.
 * The element subtly follows the cursor when hovered.
 *
 * Returns a cleanup function.
 *
 * @param el     - The button/element
 * @param strength - How strongly it follows (default 0.3)
 */
export function magneticEffect(
  el: HTMLElement,
  strength = 0.3
): () => void {
  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;

    gsap.to(el, {
      x: dx,
      y: dy,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);

  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", onLeave);
    gsap.set(el, { x: 0, y: 0 });
  };
}

// ─── useMagnetic Hook ───────────────────────────────────────────

/**
 * React hook for the magnetic effect.
 *
 * @example
 * const ref = useMagnetic<HTMLButtonElement>(0.3);
 * <button ref={ref}>Hover me</button>
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cleanup = magneticEffect(ref.current, strength);
    return cleanup;
  }, [strength]);

  return ref;
}

// ─── Smooth Scroll To ───────────────────────────────────────────

/**
 * Smoothly scroll to an element using GSAP.
 */
export function smoothScrollTo(
  target: string | Element,
  options: { duration?: number; offset?: number } = {}
) {
  const { duration = 1, offset = 0 } = options;
  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  gsap.to(window, {
    scrollTo: { y: el, offsetY: offset },
    duration,
    ease: "power3.inOut",
  });
}

// ─── Stagger Reveal (scroll-triggered) ──────────────────────────

/**
 * Reveal a group of children with staggered scroll-triggered animation.
 *
 * @param container - Parent selector
 * @param children  - Children selector (relative to container)
 */
export function staggerReveal(
  container: string | Element,
  children: string,
  options: {
    y?: number;
    stagger?: number;
    duration?: number;
    start?: string;
  } = {}
) {
  const {
    y = 30,
    stagger = 0.1,
    duration = 0.6,
    start = "top 80%",
  } = options;

  const el =
    typeof container === "string"
      ? document.querySelector(container)
      : container;
  if (!el) return;

  gsap.from(el.querySelectorAll(children), {
    opacity: 0,
    y,
    stagger,
    duration,
    ease: "power3.out",
    scrollTrigger: {
      trigger: el as gsap.DOMTarget,
      start,
      toggleActions: "play none none none",
    },
  });
}
