import { useEffect, useRef, useCallback } from "react";

/**
 * useFocusTrap — traps keyboard focus within a container element.
 * Essential for accessible modals, drawers, and dialogs.
 *
 * Usage:
 *   const trapRef = useFocusTrap(isOpen);
 *   <div ref={trapRef} role="dialog" aria-modal="true">...</div>
 */
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getFocusable = useCallback((container: HTMLElement): HTMLElement[] => {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute("disabled") && el.tabIndex !== -1);
  }, []);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = getFocusable(container);
    if (focusable.length === 0) return;

    // Save previously focused element to restore later
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus first element
    focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const currentFocusable = getFocusable(container);
      if (currentFocusable.length === 0) return;

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      const isFirst = document.activeElement === first;
      const isLast = document.activeElement === last;

      if (e.shiftKey && isFirst) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && isLast) {
        e.preventDefault();
        first.focus();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        previouslyFocused?.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleEscape);
      previouslyFocused?.focus();
    };
  }, [active, getFocusable]);

  return containerRef;
}

/**
 * useAriaAnnounce — announces messages to screen readers via aria-live region.
 * Use for dynamic updates that aren't visually obvious (e.g., "3 resultados encontrados").
 *
 * Usage:
 *   const announce = useAriaAnnounce();
 *   announce("Filtros aplicados. 12 obras encontradas.");
 */
export function useAriaAnnounce() {
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const region = document.createElement("div");
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    region.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    document.body.appendChild(region);
    regionRef.current = region;
    return () => { document.body.removeChild(region); };
  }, []);

  return useCallback((message: string) => {
    if (!regionRef.current) return;
    regionRef.current.textContent = "";
    // Force re-read by toggling
    requestAnimationFrame(() => {
      if (regionRef.current) regionRef.current.textContent = message;
    });
  }, []);
}
