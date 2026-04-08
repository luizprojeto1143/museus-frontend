/**
 * Tests: useDebounce hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useDebouncedCallback, useRateLimit } from "../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("delays updating until after delay", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });
    expect(result.current).toBe("initial"); // not yet

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("updated"); // now updated
  });

  it("resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "abcd" });

    expect(result.current).toBe("a"); // timer reset each time

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("abcd"); // only final value
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("delays calling callback", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => { result.current("test"); });
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("test");
  });

  it("only calls with last argument when called rapidly", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("first");
      result.current("second");
      result.current("third");
    });

    act(() => vi.advanceTimersByTime(300));
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("third");
  });
});

describe("useRateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows calls under the limit", () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useRateLimit(fn, { maxCalls: 3, windowMs: 1000 })
    );

    act(() => { result.current.call(); result.current.call(); });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.current.isLimited).toBe(false);
  });

  it("blocks calls when rate limit is hit", async () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useRateLimit(fn, { maxCalls: 3, windowMs: 5000 })
    );

    // 3 calls — all succeed, 3rd triggers limit
    act(() => { result.current.call(); });
    act(() => { result.current.call(); });
    act(() => { result.current.call(); }); // hits limit

    expect(fn).toHaveBeenCalledTimes(3);
    expect(result.current.isLimited).toBe(true);

    // 4th call — blocked
    act(() => { result.current.call(); });
    expect(fn).toHaveBeenCalledTimes(3); // still 3
  });

  it("resets after window expires", () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useRateLimit(fn, { maxCalls: 2, windowMs: 1000 })
    );

    act(() => { result.current.call(); }); // call 1
    act(() => { result.current.call(); }); // call 2 — hits limit

    expect(result.current.isLimited).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.isLimited).toBe(false);

    act(() => { result.current.call(); });
    expect(fn).toHaveBeenCalledTimes(3); // resumed
  });
});
