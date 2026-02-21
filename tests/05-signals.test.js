import { describe, it, expect, vi } from "vitest";
import { createSignal, createEffect, createMemo } from "../src/niract.ts";

describe("Phase 5: Signals - createSignal", () => {
  it("returns a getter and setter", () => {
    const [count, setCount] = createSignal(0);
    expect(typeof count).toBe("function");
    expect(typeof setCount).toBe("function");
  });

  it("getter returns the current value", () => {
    const [count] = createSignal(42);
    expect(count()).toBe(42);
  });

  it("setter updates the value", () => {
    const [count, setCount] = createSignal(0);
    setCount(5);
    expect(count()).toBe(5);
  });

  it("setter supports functional updates", () => {
    const [count, setCount] = createSignal(10);
    setCount((prev) => prev + 5);
    expect(count()).toBe(15);
  });
});

describe("Phase 5: Signals - createEffect", () => {
  it("runs the effect immediately", () => {
    const fn = vi.fn();
    createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("re-runs when a read signal changes", () => {
    const [count, setCount] = createSignal(0);
    const fn = vi.fn(() => count()); // reading count() subscribes

    createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    setCount(1);
    expect(fn).toHaveBeenCalledTimes(2);

    setCount(2);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does NOT re-run for signals it doesn't read", () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal(0);
    const fn = vi.fn(() => a()); // only reads a

    createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    setB(1); // b changed, but effect doesn't read b
    expect(fn).toHaveBeenCalledTimes(1);

    setA(1); // a changed, effect should re-run
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("tracks dynamic dependencies (conditional reads)", () => {
    const [toggle, setToggle] = createSignal(true);
    const [a, setA] = createSignal("A");
    const [b, setB] = createSignal("B");

    let result;
    createEffect(() => {
      result = toggle() ? a() : b();
    });

    expect(result).toBe("A");

    setA("A2");
    expect(result).toBe("A2");

    // Switch branch — now effect reads b, not a
    setToggle(false);
    expect(result).toBe("B");

    // a changes shouldn't trigger anymore
    setA("A3");
    expect(result).toBe("B"); // still B

    setB("B2");
    expect(result).toBe("B2");
  });
});

describe("Phase 5: Signals - createMemo", () => {
  it("returns a getter that computes a derived value", () => {
    const [count] = createSignal(5);
    const doubled = createMemo(() => count() * 2);
    expect(doubled()).toBe(10);
  });

  it("updates when dependency signal changes", () => {
    const [count, setCount] = createSignal(3);
    const doubled = createMemo(() => count() * 2);

    expect(doubled()).toBe(6);
    setCount(10);
    expect(doubled()).toBe(20);
  });

  it("only recomputes when dependencies actually change", () => {
    const [count, setCount] = createSignal(0);
    const computeFn = vi.fn(() => count() * 2);
    const doubled = createMemo(computeFn);

    doubled(); // initial compute
    doubled(); // should be cached
    expect(computeFn).toHaveBeenCalledTimes(1);

    setCount(1);
    doubled(); // should recompute
    expect(computeFn).toHaveBeenCalledTimes(2);

    doubled(); // cached again
    expect(computeFn).toHaveBeenCalledTimes(2);
  });
});
