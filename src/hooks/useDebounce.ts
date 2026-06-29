import { useState, useEffect, useRef } from "react";

/**
 * useDebounce — delays updating a value until after `delay` ms of inactivity.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 300);
 *   useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback — returns a debounced version of the given function.
 * The function will only be called after `delay` ms have elapsed since the last call.
 *
 * Usage:
 *   const handleSearch = useDebouncedCallback((q: string) => fetch(q), 400);
 *   <input onChange={e => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => any>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always use the latest callback without recreating the debounced fn
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return (...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}

/**
 * useRateLimit — prevents a function from being called more than `maxCalls`
 * times within `windowMs` milliseconds. Returns { call, isLimited, resetIn }.
 *
 * Usage (form submission protection):
 *   const { call: safeSubmit, isLimited } = useRateLimit(handleSubmit, { maxCalls: 3, windowMs: 10000 });
 */
export function useRateLimit<T extends (...args: unknown[]) => any>(
  fn: T,
  options: { maxCalls?: number; windowMs?: number } = {}
): {
  call: (...args: Parameters<T>) => void;
  isLimited: boolean;
  callCount: number;
} {
  const { maxCalls = 5, windowMs = 10000 } = options;
  const [callCount, setCallCount] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => { fnRef.current = fn; }, [fn]);

  const call = (...args: Parameters<T>) => {
    if (isLimited) return;

    // Check if this call would hit the limit
    const nextCount = callCount + 1;

    if (nextCount >= maxCalls) {
      // This call executes, then limit activates
      setIsLimited(true);
      setCallCount(nextCount);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsLimited(false);
        setCallCount(0);
      }, windowMs);
    } else {
      setCallCount(nextCount);
    }

    fnRef.current(...args);
  };

  return { call, isLimited, callCount };
}
