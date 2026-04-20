import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { cn } from "../../lib/cn";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** How strongly the button follows the cursor (0-1). Default 0.3 */
  strength?: number;
  /** Children follow cursor with separate, weaker strength */
  innerStrength?: number;
  /** Additional class */
  className?: string;
}

/**
 * MagneticButton — Premium button that magnetically follows the cursor.
 *
 * Uses GSAP for smooth, performant mouse-tracking animation.
 * The button subtly moves toward the cursor on hover,
 * and springs back with an elastic ease on mouse leave.
 *
 * @example
 * <MagneticButton strength={0.4} className="btn btn-primary">
 *   Explorar Acervo
 * </MagneticButton>
 */
export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, strength = 0.3, innerStrength, className, ...props }, forwardedRef) => {
    const localRef = useRef<HTMLButtonElement>(null);
    const innerRef = useRef<HTMLSpanElement>(null);
    const buttonRef = (forwardedRef as React.RefObject<HTMLButtonElement>) || localRef;

    const onMouseMove = useCallback(
      (e: MouseEvent) => {
        const btn = (buttonRef as React.RefObject<HTMLButtonElement>).current;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;

        gsap.to(btn, {
          x: dx,
          y: dy,
          duration: 0.4,
          ease: "power3.out",
        });

        // Inner content moves with weaker strength for parallax
        if (innerRef.current) {
          const iStrength = innerStrength ?? strength * 0.5;
          gsap.to(innerRef.current, {
            x: (e.clientX - cx) * iStrength,
            y: (e.clientY - cy) * iStrength,
            duration: 0.4,
            ease: "power3.out",
          });
        }
      },
      [buttonRef, strength, innerStrength]
    );

    const onMouseLeave = useCallback(() => {
      const btn = (buttonRef as React.RefObject<HTMLButtonElement>).current;
      if (!btn) return;

      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
      });

      if (innerRef.current) {
        gsap.to(innerRef.current, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.4)",
        });
      }
    }, [buttonRef]);

    useEffect(() => {
      const btn = (buttonRef as React.RefObject<HTMLButtonElement>).current;
      if (!btn) return;

      btn.addEventListener("mousemove", onMouseMove);
      btn.addEventListener("mouseleave", onMouseLeave);

      return () => {
        btn.removeEventListener("mousemove", onMouseMove);
        btn.removeEventListener("mouseleave", onMouseLeave);
        gsap.set(btn, { x: 0, y: 0 });
      };
    }, [buttonRef, onMouseMove, onMouseLeave]);

    return (
      <button
        ref={buttonRef as React.RefObject<HTMLButtonElement>}
        className={cn("relative inline-flex items-center justify-center", className)}
        {...props}
      >
        <span ref={innerRef} className="inline-flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
