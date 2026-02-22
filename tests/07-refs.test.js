import { describe, it, expect, beforeEach } from "vitest";
import { createElement, render, useRef } from "../src/niract.ts";

describe("Phase 7: Refs - useRef", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("returns an object with a current property set to initial value", () => {
    let capturedRef;
    function App() {
      capturedRef = useRef(42);
      return createElement("div", null, "hello");
    }

    render(createElement(App, null), container);
    expect(capturedRef).toEqual({ current: 42 });
  });

  it("returns the same ref object across re-renders", () => {
    let refs = [];
    let triggerRender;

    function App() {
      const ref = useRef(0);
      refs.push(ref);
      const [, setState] = [0, (v) => { triggerRender = v; }];
      return createElement("div", null, "hello");
    }

    render(createElement(App, null), container);
    const firstRef = refs[0];

    // Re-render
    render(createElement(App, null), container);

    expect(refs.length).toBe(2);
    expect(refs[1]).toBe(firstRef);
  });

  it("persists mutable value without triggering re-render", () => {
    let capturedRef;
    function App() {
      capturedRef = useRef(0);
      return createElement("div", null, String(capturedRef.current));
    }

    render(createElement(App, null), container);
    expect(capturedRef.current).toBe(0);

    // Mutating .current should not cause a re-render
    capturedRef.current = 99;
    expect(capturedRef.current).toBe(99);
    // DOM should NOT have updated (no re-render triggered)
    expect(container.innerHTML).toBe("<div>0</div>");
  });

  it("defaults to undefined when no initial value is provided", () => {
    let capturedRef;
    function App() {
      capturedRef = useRef();
      return createElement("div", null, "hello");
    }

    render(createElement(App, null), container);
    expect(capturedRef).toEqual({ current: undefined });
  });

  it("can be used to hold a DOM reference via ref prop", () => {
    let myRef;
    function App() {
      myRef = useRef(null);
      return createElement("div", { ref: myRef }, "hello");
    }

    render(createElement(App, null), container);
    expect(myRef.current).toBe(container.firstChild);
    expect(myRef.current.textContent).toBe("hello");
  });
});
