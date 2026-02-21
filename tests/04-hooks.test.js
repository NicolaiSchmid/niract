import { describe, it, expect, beforeEach, vi } from "vitest";
import Niract, { createElement, render, useState, useEffect } from "../src/niract.ts";

describe("Phase 4: Hooks - useState", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("returns initial state value on first render", () => {
    let capturedState;
    function App() {
      const [count] = useState(0);
      capturedState = count;
      return createElement("div", null, String(count));
    }
    render(createElement(App, null), container);
    expect(capturedState).toBe(0);
    expect(container.textContent).toBe("0");
  });

  it("setState triggers a re-render with new value", async () => {
    let setCount;
    function Counter() {
      const [count, _setCount] = useState(0);
      setCount = _setCount;
      return createElement("div", null, String(count));
    }
    render(createElement(Counter, null), container);
    expect(container.textContent).toBe("0");

    setCount(1);
    // Give microtask queue a tick for async re-render
    await new Promise((r) => setTimeout(r, 10));
    expect(container.textContent).toBe("1");
  });

  it("supports functional updates: setState(prev => prev + 1)", async () => {
    let setCount;
    function Counter() {
      const [count, _setCount] = useState(0);
      setCount = _setCount;
      return createElement("div", null, String(count));
    }
    render(createElement(Counter, null), container);

    setCount((prev) => prev + 1);
    await new Promise((r) => setTimeout(r, 10));
    expect(container.textContent).toBe("1");

    setCount((prev) => prev + 1);
    await new Promise((r) => setTimeout(r, 10));
    expect(container.textContent).toBe("2");
  });

  it("multiple useState calls maintain independent state", async () => {
    let setName, setAge;
    function Profile() {
      const [name, _setName] = useState("Nico");
      const [age, _setAge] = useState(30);
      setName = _setName;
      setAge = _setAge;
      return createElement("div", null, `${name} is ${age}`);
    }
    render(createElement(Profile, null), container);
    expect(container.textContent).toBe("Nico is 30");

    setAge(31);
    await new Promise((r) => setTimeout(r, 10));
    expect(container.textContent).toBe("Nico is 31");

    setName("Max");
    await new Promise((r) => setTimeout(r, 10));
    expect(container.textContent).toBe("Max is 31");
  });
});

describe("Phase 4: Hooks - useEffect", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("runs effect after initial render", async () => {
    const effectFn = vi.fn();
    function App() {
      useEffect(effectFn, []);
      return createElement("div", null, "hello");
    }
    render(createElement(App, null), container);
    await new Promise((r) => setTimeout(r, 10));
    expect(effectFn).toHaveBeenCalledTimes(1);
  });

  it("runs cleanup when component re-renders with changed deps", async () => {
    const cleanup = vi.fn();
    let setValue;

    function App() {
      const [value, _setValue] = useState(0);
      setValue = _setValue;
      useEffect(() => {
        return cleanup;
      }, [value]);
      return createElement("div", null, String(value));
    }

    render(createElement(App, null), container);
    await new Promise((r) => setTimeout(r, 10));
    expect(cleanup).not.toHaveBeenCalled();

    setValue(1);
    await new Promise((r) => setTimeout(r, 10));
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("does NOT re-run effect when deps haven't changed", async () => {
    const effectFn = vi.fn();
    let setUnrelated;

    function App() {
      const [unrelated, _setUnrelated] = useState(0);
      setUnrelated = _setUnrelated;
      useEffect(effectFn, []);  // empty deps = only run once
      return createElement("div", null, String(unrelated));
    }

    render(createElement(App, null), container);
    await new Promise((r) => setTimeout(r, 10));
    expect(effectFn).toHaveBeenCalledTimes(1);

    setUnrelated(1);
    await new Promise((r) => setTimeout(r, 10));
    // Should still be 1 — deps didn't change
    expect(effectFn).toHaveBeenCalledTimes(1);
  });
});
