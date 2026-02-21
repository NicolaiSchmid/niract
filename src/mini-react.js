// ============================================
// Mini React - Your framework goes here!
// ============================================

// --- Phase 1: Virtual DOM ---

const createTextElement = (value) => ({
  type: "TEXT_ELEMENT",
  props: { nodeValue: value, children: [] },
});

const wrapChild = (child) =>
  typeof child === "object" ? child : createTextElement(child);

const isTruthy = (child) =>
  child !== null && child !== undefined && child !== false;

/** Create a virtual DOM element */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.filter(isTruthy).map(wrapChild),
    },
  };
}

// --- Phase 2: Rendering ---

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

/** Apply props to a real DOM element */
const applyProps = (dom, props) => {
  Object.keys(props)
    .filter(isProperty)
    .forEach((name) => {
      if (name === "style" && typeof props[name] === "object") {
        Object.assign(dom.style, props[name]);
      } else {
        dom[name] = props[name];
      }
    });

  Object.keys(props)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, props[name]);
    });
};

/** Create a real DOM node from a VDOM node */
const createDom = (vdom) => {
  if (vdom.type === "TEXT_ELEMENT") {
    return document.createTextNode(vdom.props.nodeValue);
  }

  const dom = document.createElement(vdom.type);
  applyProps(dom, vdom.props);

  vdom.props.children.forEach((child) => {
    dom.appendChild(createDom(child));
  });

  return dom;
};

// --- Hooks state ---

let currentComponent = null;
let hookIndex = 0;

/** Render a VDOM tree into a real DOM container */
function render(vdom, container) {
  // Store previous VDOM for reconciliation
  const oldVdom = container.__vdom;

  // Resolve function components
  const resolved = resolveVdom(vdom);

  if (oldVdom) {
    reconcile(oldVdom, resolved, container, 0);
  } else {
    container.innerHTML = "";
    if (resolved) {
      container.appendChild(createDom(resolved));
    }
  }

  container.__vdom = resolved;

  // Flush effects after render
  flushEffects();
}

/** Resolve function components recursively into plain vdom */
const resolveVdom = (vdom) => {
  if (!vdom) return null;

  if (typeof vdom.type === "function") {
    // Set up hooks context for this component
    const component = vdom.type;
    const componentState = getComponentState(component, vdom);

    currentComponent = componentState;
    hookIndex = 0;

    const result = component(vdom.props);

    currentComponent = null;
    hookIndex = 0;

    return resolveVdom(result);
  }

  // Recursively resolve children
  return {
    ...vdom,
    props: {
      ...vdom.props,
      children: vdom.props.children.map(resolveVdom),
    },
  };
};

// --- Phase 3: Reconciliation ---

/** Remove props from a DOM element */
const removeProps = (dom, props) => {
  Object.keys(props)
    .filter(isProperty)
    .forEach((name) => {
      if (name === "style") return;
      dom[name] = "";
    });

  Object.keys(props)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, props[name]);
    });
};

/** Update props on an existing DOM element */
const updateProps = (dom, oldProps, newProps) => {
  // Remove old props not in new
  Object.keys(oldProps)
    .filter(isProperty)
    .forEach((name) => {
      if (!(name in newProps)) {
        dom[name] = "";
      }
    });

  // Remove old event listeners
  Object.keys(oldProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      if (!(name in newProps) || oldProps[name] !== newProps[name]) {
        dom.removeEventListener(eventType, oldProps[name]);
      }
    });

  // Set new props
  Object.keys(newProps)
    .filter(isProperty)
    .forEach((name) => {
      if (name === "style" && typeof newProps[name] === "object") {
        Object.assign(dom.style, newProps[name]);
      } else {
        dom[name] = newProps[name];
      }
    });

  // Add new event listeners
  Object.keys(newProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      if (!(name in oldProps) || oldProps[name] !== newProps[name]) {
        dom.addEventListener(eventType, newProps[name]);
      }
    });
};

/** Diff old and new VDOM trees and patch the real DOM */
function reconcile(oldVdom, newVdom, parentDom, index) {
  const existingNode = parentDom.childNodes[index];

  // New node added
  if (!oldVdom && newVdom) {
    parentDom.appendChild(createDom(newVdom));
    return;
  }

  // Node removed
  if (oldVdom && !newVdom) {
    parentDom.removeChild(existingNode);
    return;
  }

  // Neither exists
  if (!oldVdom && !newVdom) return;

  // Type changed — replace entirely
  if (oldVdom.type !== newVdom.type) {
    parentDom.replaceChild(createDom(newVdom), existingNode);
    return;
  }

  // Same type — update in place
  if (oldVdom.type === "TEXT_ELEMENT") {
    if (oldVdom.props.nodeValue !== newVdom.props.nodeValue) {
      existingNode.nodeValue = newVdom.props.nodeValue;
    }
    return;
  }

  // Element node — update props and recurse children
  updateProps(existingNode, oldVdom.props, newVdom.props);

  const oldChildren = oldVdom.props.children;
  const newChildren = newVdom.props.children;
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    reconcile(
      oldChildren[i] || null,
      newChildren[i] || null,
      existingNode,
      i,
    );
  }

  // Remove excess DOM children
  while (existingNode.childNodes.length > newChildren.length) {
    existingNode.removeChild(existingNode.lastChild);
  }
}

// --- Phase 4: Hooks ---

const componentStates = new Map();
let pendingEffects = [];

/** Get or create state storage for a component */
const getComponentState = (component, vdom) => {
  // Use the function itself as the key (works for single-instance components)
  if (!componentStates.has(component)) {
    componentStates.set(component, {
      hooks: [],
      component,
      vdom,
      container: null,
    });
  }
  const state = componentStates.get(component);
  state.vdom = vdom;
  return state;
};

/** State hook */
function useState(initialValue) {
  const comp = currentComponent;
  const idx = hookIndex++;

  // Initialize on first render
  if (comp.hooks.length <= idx) {
    comp.hooks.push({ value: initialValue });
  }

  const hook = comp.hooks[idx];

  const setState = (newValue) => {
    const nextValue = typeof newValue === "function"
      ? newValue(hook.value)
      : newValue;

    hook.value = nextValue;

    // Schedule async re-render
    setTimeout(() => {
      // Find container — walk up from any render call
      const container = findContainer(comp);
      if (container) {
        render(createElement(comp.component, comp.vdom.props), container);
      }
    }, 0);
  };

  return [hook.value, setState];
}

/** Find the container a component was last rendered into */
const findContainer = (comp) => {
  // Search all containers that have a __vdom
  // For simplicity, store it when we first render
  return comp.container;
};

// Patch render to track containers
const originalRender = render;

/** Effect hook */
function useEffect(callback, deps) {
  const comp = currentComponent;
  const idx = hookIndex++;

  if (comp.hooks.length <= idx) {
    comp.hooks.push({ deps: undefined, cleanup: undefined });
  }

  const hook = comp.hooks[idx];
  const oldDeps = hook.deps;

  const depsChanged = !oldDeps ||
    !deps ||
    deps.length !== oldDeps.length ||
    deps.some((d, i) => d !== oldDeps[i]);

  if (depsChanged) {
    hook.deps = deps;
    pendingEffects.push({ callback, hook });
  }
}

/** Flush pending effects (called after render) */
const flushEffects = () => {
  const effects = [...pendingEffects];
  pendingEffects = [];

  // Run effects asynchronously (like React)
  setTimeout(() => {
    effects.forEach(({ callback, hook }) => {
      // Run cleanup from previous effect
      if (hook.cleanup) {
        hook.cleanup();
      }
      const cleanup = callback();
      hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
    });
  }, 0);
};

// Override render to track component containers
const _render = render;
render = function (vdom, container) {
  // Track container for function components
  if (typeof vdom.type === "function") {
    const component = vdom.type;
    const compState = getComponentState(component, vdom);
    compState.container = container;
  }
  return _render(vdom, container);
};

// --- Phase 5: Signals (Solid-style) ---

let currentSubscriber = null;

/** Create a reactive signal */
function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  const getter = () => {
    // Auto-track: if an effect is running, subscribe it
    if (currentSubscriber) {
      subscribers.add(currentSubscriber);
    }
    return value;
  };

  const setter = (nextValue) => {
    value = typeof nextValue === "function" ? nextValue(value) : nextValue;
    // Notify all subscribers
    [...subscribers].forEach((fn) => fn());
  };

  return [getter, setter];
}

/** Create a reactive effect that auto-tracks signal dependencies */
function createEffect(fn) {
  const execute = () => {
    // Clean up old subscriptions by re-tracking each run
    currentSubscriber = execute;
    fn();
    currentSubscriber = null;
  };

  execute();
}

/** Create a memoized derived value */
function createMemo(fn) {
  let value;
  let dirty = true;

  // Use an effect to mark as dirty when deps change
  createEffect(() => {
    value = fn();
    dirty = false;
  });

  return () => {
    // Value is always fresh because the effect runs synchronously
    return value;
  };
}

// --- Phase 7: Additional Hooks ---

function useRef(initialValue) {
  const comp = currentComponent;
  const idx = hookIndex++;

  if (comp.hooks.length <= idx) {
    comp.hooks.push({ current: initialValue });
  }

  return comp.hooks[idx];
}

function useMemo(factory, deps) {
  const comp = currentComponent;
  const idx = hookIndex++;

  if (comp.hooks.length <= idx) {
    comp.hooks.push({ value: factory(), deps });
    return comp.hooks[idx].value;
  }

  const hook = comp.hooks[idx];
  const depsChanged = !hook.deps ||
    deps.some((d, i) => d !== hook.deps[i]);

  if (depsChanged) {
    hook.value = factory();
    hook.deps = deps;
  }

  return hook.value;
}

function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
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
