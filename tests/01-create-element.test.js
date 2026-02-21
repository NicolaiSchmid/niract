import { describe, it, expect } from "vitest";
import { createElement } from "../src/niract.ts";

describe("Phase 1: createElement", () => {
  it("creates a vdom node for a simple element", () => {
    const vdom = createElement("div", null);
    expect(vdom).toEqual({
      type: "div",
      props: { children: [] },
    });
  });

  it("passes props through", () => {
    const vdom = createElement("div", { id: "app", className: "container" });
    expect(vdom.type).toBe("div");
    expect(vdom.props.id).toBe("app");
    expect(vdom.props.className).toBe("container");
  });

  it("wraps string children as TEXT_ELEMENT nodes", () => {
    const vdom = createElement("p", null, "hello");
    expect(vdom.props.children).toHaveLength(1);
    expect(vdom.props.children[0]).toEqual({
      type: "TEXT",
      props: { nodeValue: "hello", children: [] },
    });
  });

  it("wraps number children as TEXT_ELEMENT nodes", () => {
    const vdom = createElement("span", null, 42);
    expect(vdom.props.children[0]).toEqual({
      type: "TEXT",
      props: { nodeValue: 42, children: [] },
    });
  });

  it("keeps element children as-is", () => {
    const child = createElement("span", null, "inner");
    const parent = createElement("div", null, child);
    expect(parent.props.children[0]).toBe(child);
    expect(parent.props.children[0].type).toBe("span");
  });

  it("handles multiple mixed children", () => {
    const vdom = createElement(
      "div",
      null,
      "text",
      createElement("span", null),
      123
    );
    expect(vdom.props.children).toHaveLength(3);
    expect(vdom.props.children[0].type).toBe("TEXT");
    expect(vdom.props.children[1].type).toBe("span");
    expect(vdom.props.children[2].type).toBe("TEXT");
  });

  it("filters out falsy children (null, undefined, false)", () => {
    const vdom = createElement("div", null, "hello", null, undefined, false);
    // Only "hello" should survive
    expect(vdom.props.children).toHaveLength(1);
  });

  it("handles function components (type is a function)", () => {
    function MyComponent(props) {
      return createElement("div", null, props.name);
    }
    const vdom = createElement(MyComponent, { name: "Nico" });
    expect(typeof vdom.type).toBe("function");
    expect(vdom.props.name).toBe("Nico");
  });
});
