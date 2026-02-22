// ============================================
// Mini React - Your framework goes here!
// ============================================

import { text } from "stream/consumers";

// --- Phase 1: Virtual DOM ---

type ElementType = "div" | "span" | "p" | "TEXT";

type TextElement = {
  type: "TEXT";
  props: { nodeValue: string | number; children: [] };
};

type DomElement = {
  type: Exclude<ElementType, "TEXT"> | Function;
  props: Record<string, any> & { children: Element[] };
};

type Element = TextElement | DomElement;

type Child = Element | string | number | null | undefined | false;

function createElement(
  type: ElementType | Function,
  props: Record<string, any> | null,
  ...children: Child[]
): Element {
  const processedChildren = children
    .filter((child) => child !== null && child !== undefined && child !== false)
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

const eventName = (key: string) => key.slice(2).toLowerCase();

/** Apply a single prop to a DOM element */
function applyProp(el: HTMLElement, key: string, value: any): void {
  if (key === "children") return;
  if (key === "style") return Object.assign(el.style, value);
  if (key === "ref") value.current = el;
  if (key.startsWith("on")) return el.addEventListener(eventName(key), value);
  el[key] = value;
}

function removeProp(el: HTMLElement, key: string): void {
  if (key === "children") return;
  if (key === "style") return (el.style = {});
  el[key] = "";
}

/** Render a VDOM tree into a real DOM container */
function renderTree(vdom: Element, container: HTMLElement): Node {
  if (vdom.type === "TEXT") {
    const el = document.createTextNode(String(vdom.props.nodeValue));
    container.appendChild(el);
    return el;
  }

  if (typeof vdom.type === "function") {
    const v = vdom.type(vdom.props);
    return renderTree(v, container);
  }

  const el = document.createElement(vdom.type);
  Object.keys(vdom.props).forEach((key) => applyProp(el, key, vdom.props[key]));
  container.appendChild(el);

  vdom.props.children.map((child) => renderTree(child, el));
  return el;
}

let rootContainer: HTMLElement | null = null;
let rootVdom: Element | null = null;

function render(vdom: Element, container: HTMLElement): void {
  rootContainer = container;
  rootVdom = vdom;
  hookIndex = 0;

  const oldVdom = container._oldvdom;

  if (oldVdom) {
    reconcileRender(oldVdom, vdom, container, 0);
  } else {
    hooks = [];
    hookIndex = 0;
    container.innerHTML = "";
    renderTree(vdom, container);
  }

  container._oldvdom = vdom;
}

// --- Phase 3: Reconciliation ---

/** Diff old and new VDOM trees and patch the real DOM */
function reconcileRender(
  oldVdom: Element,
  newVdom: Element,
  container: HTMLElement,
  index: number = 0,
): void {
  const domNode = container.childNodes[index];

  if (
    typeof oldVdom.type === "function" &&
    typeof newVdom.type === "function"
  ) {
    const oldRendered = container._oldvdom;
    const newRendered = newVdom.type(newVdom.props);

    reconcileRender(oldRendered, newRendered, container, index);
    return;
  }

  if (oldVdom.type !== newVdom.type) {
    const newNode = renderTree(newVdom, container);
    container.removeChild(domNode);

    container.appendChild(newNode);
    return;
  }

  if (newVdom.type === "TEXT") {
    domNode.nodeValue = newVdom.props.nodeValue;
    return;
  }

  for (const prop in oldVdom.props) {
    if (prop === "children") continue;

    if (!newVdom.props[prop]) {
      if (prop.startsWith("on"))
        domNode.removeEventListener(eventName(prop), oldVdom.props[prop]);
      removeProp(domNode, prop);
    }
  }

  for (const prop in newVdom.props) {
    if (prop === "children") continue;

    if (!oldVdom[prop]) {
      applyProp(domNode, prop, newVdom.props[prop]);
    }
  }

  const oldChildren = oldVdom.props.children;
  const newChildren = newVdom.props.children;

  for (let i = 0; i < Math.max(oldChildren.length, newChildren.length); i++) {
    if (!oldChildren[i]) return renderTree(newChildren[i], domNode);
    if (!newChildren[i]) return domNode.removeChild(domNode.childNodes[i]);

    reconcileRender(oldChildren[i], newChildren[i], domNode, i);
  }
}

// --- Phase 4: Hooks ---

type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (action: SetStateAction<T>) => void;

let hookIndex = 0;
let hooks = [];

/** State hook */
function useState<T>(initialValue: T | (() => T)): [T, Dispatch<T>] {
  const currentIndex = hookIndex;
  const currentValue = hooks[currentIndex];

  if (currentValue == null) hooks[currentIndex] = initialValue;

  const rValue = [
    hooks[currentIndex],
    (newValue) => {
      if (typeof newValue === "function") {
        hooks[currentIndex] = newValue(hooks[currentIndex]);
      } else {
        hooks[currentIndex] = newValue;
      }

      if (!rootVdom || !rootContainer) return;
      render(rootVdom, rootContainer);
    },
  ];
  hookIndex++;

  return rValue;
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

// --- Phase 7: Refs ---

function useRef<T = undefined>(initialValue?: T): { current: T | undefined } {
  const currentIndex = hookIndex;
  const currentValue = hooks[currentIndex];

  const r = currentValue ?? { current: initialValue };

  if (currentValue == null) {
    hooks[currentIndex] = r;
  }

  hookIndex++;

  return r;
  // TODO: implement
}

// --- Phase 8: Context ---

/** Create a context with a default value */
function createContext(defaultValue?) {
  // TODO: implement
}

/** Read the nearest Provider value for a context */
function useContext(context) {
  // TODO: implement
}

// --- Additional Hooks ---

function useMemo(factory, deps) {
  // TODO: implement
}

function useCallback(callback, deps) {
  // TODO: implement
}

// --- Exports ---

const Niract = {
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
  // Context
  createContext,
  useContext,
  // Fragment placeholder
  Fragment: "FRAGMENT",
};

export default Niract;
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
  createContext,
  useContext,
};
