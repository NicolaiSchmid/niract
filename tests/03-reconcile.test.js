import { describe, it, expect, beforeEach } from "vitest";
import { createElement, render } from "../src/mini-react.js";

describe("Phase 3: Reconciliation", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("updates text content without replacing the DOM node", () => {
    render(createElement("p", null, "before"), container);
    const firstNode = container.firstChild;

    render(createElement("p", null, "after"), container);
    const secondNode = container.firstChild;

    // Same DOM node should be reused
    expect(secondNode).toBe(firstNode);
    expect(container.innerHTML).toBe("<p>after</p>");
  });

  it("updates attributes on the same node", () => {
    render(createElement("div", { className: "old" }), container);
    const node = container.firstChild;

    render(createElement("div", { className: "new" }), container);

    expect(container.firstChild).toBe(node);
    expect(node.className).toBe("new");
  });

  it("removes old attributes that are gone", () => {
    render(createElement("div", { className: "old", id: "x" }), container);
    render(createElement("div", { className: "new" }), container);

    const node = container.firstChild;
    expect(node.className).toBe("new");
    expect(node.id).toBe("");
  });

  it("replaces node when type changes", () => {
    render(createElement("div", null, "hello"), container);
    const firstNode = container.firstChild;

    render(createElement("span", null, "hello"), container);
    const secondNode = container.firstChild;

    // Different type = different DOM node
    expect(secondNode).not.toBe(firstNode);
    expect(secondNode.tagName).toBe("SPAN");
  });

  it("adds new children", () => {
    render(createElement("div", null, createElement("p", null, "a")), container);

    render(
      createElement(
        "div",
        null,
        createElement("p", null, "a"),
        createElement("p", null, "b")
      ),
      container
    );

    expect(container.firstChild.children.length).toBe(2);
  });

  it("removes extra children", () => {
    render(
      createElement(
        "div",
        null,
        createElement("p", null, "a"),
        createElement("p", null, "b")
      ),
      container
    );

    render(createElement("div", null, createElement("p", null, "a")), container);

    expect(container.firstChild.children.length).toBe(1);
  });

  it("swaps event listeners on re-render", () => {
    let value = "";
    render(
      createElement("button", { onClick: () => { value = "first"; } }, "btn"),
      container
    );

    render(
      createElement("button", { onClick: () => { value = "second"; } }, "btn"),
      container
    );

    container.firstChild.click();
    expect(value).toBe("second");
  });
});
