// ============================================
// Mini React - Your framework goes here!
// ============================================

import { text } from "stream/consumers";

// --- Phase 1: Virtual DOM ---

type ElementType = "div" | "span" | "p" | "TEXT";

type Element = {
  type: ElementType | Function;
  props: Record<string, any> & { nodeValue?: string; children: Element[] };
};

type Child = Element | string | number | null | undefined | false;

function createElement(
  type: ElementType | Function,
  props: Record<string, any> | null,
  ...children: Child[]
): Element {
  const processedChildren = children
    .filter((child) => !!child)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return {
          type: "TEXT",
          props: { nodeValue: child, children: [] },
        };

      return child;
    });

  return {
    type,
    props: { ...(props ?? {}), children: processedChildren },
  };
}

// --- Phase 2: Rendering ---

/** Render a VDOM tree into a real DOM container */
function render(vdom: Element, container: HTMLElement): void {
  // TODO: implement
}

// --- Phase 3: Reconciliation ---

/** Diff old and new VDOM trees and patch the real DOM */
function reconcile(oldVdom, newVdom, parentDom, index) {
  // TODO: implement
}

// --- Phase 4: Hooks ---

/** State hook */
function useState(initialValue) {
  // TODO: implement
}

/** Effect hook */
function useEffect(callback, deps) {
  // TODO: implement
}

// --- Phase 5: Signals (Solid-style) ---

/** Create a reactive signal */
function createSignal(initialValue) {
  // TODO: implement
}

/** Create a derived/computed value */
function createEffect(fn) {
  // TODO: implement
}

/** Create a memoized derived value */
function createMemo(fn) {
  // TODO: implement
}

// --- Phase 7: Additional Hooks ---

function useRef(initialValue) {
  // TODO: implement
}

function useMemo(factory, deps) {
  // TODO: implement
}

function useCallback(callback, deps) {
  // TODO: implement
}

// --- Exports ---

const MiniReact = {
  createElement,
  render,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  // Signals
  createSignal,
  createEffect,
  createMemo,
  // Fragment placeholder
  Fragment: "FRAGMENT",
};

export default MiniReact;
export {
  createElement,
  render,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createSignal,
  createEffect,
  createMemo,
};
