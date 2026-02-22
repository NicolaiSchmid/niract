import { describe, it, expect, beforeEach } from "vitest";
import { createElement, render } from "../src/niract.ts";

describe("Phase 6: Keyed Reconciliation", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("reuses DOM nodes matched by key when order is preserved", () => {
    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "b" }, "B")
      ),
      container
    );

    const firstA = container.firstChild.childNodes[0];
    const firstB = container.firstChild.childNodes[1];

    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "b" }, "B")
      ),
      container
    );

    expect(container.firstChild.childNodes[0]).toBe(firstA);
    expect(container.firstChild.childNodes[1]).toBe(firstB);
  });

  it("reorders DOM nodes when keyed children swap positions", () => {
    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "b" }, "B")
      ),
      container
    );

    const originalA = container.firstChild.childNodes[0];
    const originalB = container.firstChild.childNodes[1];

    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "b" }, "B"),
        createElement("li", { key: "a" }, "A")
      ),
      container
    );

    // The original DOM nodes should be reused, just reordered
    expect(container.firstChild.childNodes[0]).toBe(originalB);
    expect(container.firstChild.childNodes[1]).toBe(originalA);
  });

  it("removes a keyed child from the middle", () => {
    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "b" }, "B"),
        createElement("li", { key: "c" }, "C")
      ),
      container
    );

    const originalA = container.firstChild.childNodes[0];
    const originalC = container.firstChild.childNodes[2];

    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "c" }, "C")
      ),
      container
    );

    expect(container.firstChild.children.length).toBe(2);
    expect(container.firstChild.childNodes[0]).toBe(originalA);
    expect(container.firstChild.childNodes[1]).toBe(originalC);
  });

  it("inserts a keyed child in the middle", () => {
    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "c" }, "C")
      ),
      container
    );

    const originalA = container.firstChild.childNodes[0];
    const originalC = container.firstChild.childNodes[1];

    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "b" }, "B"),
        createElement("li", { key: "c" }, "C")
      ),
      container
    );

    expect(container.firstChild.children.length).toBe(3);
    expect(container.firstChild.childNodes[0]).toBe(originalA);
    expect(container.firstChild.childNodes[1].textContent).toBe("B");
    expect(container.firstChild.childNodes[2]).toBe(originalC);
  });

  it("updates props on a reordered keyed node", () => {
    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a", className: "old" }, "A"),
        createElement("li", { key: "b" }, "B")
      ),
      container
    );

    const originalA = container.firstChild.childNodes[0];

    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "b" }, "B"),
        createElement("li", { key: "a", className: "new" }, "A")
      ),
      container
    );

    // Same DOM node, moved and updated
    expect(container.firstChild.childNodes[1]).toBe(originalA);
    expect(originalA.className).toBe("new");
  });

  it("falls back to index-based reconciliation when no keys are present", () => {
    render(
      createElement(
        "ul",
        null,
        createElement("li", null, "A"),
        createElement("li", null, "B")
      ),
      container
    );

    const first = container.firstChild.childNodes[0];

    render(
      createElement(
        "ul",
        null,
        createElement("li", null, "X"),
        createElement("li", null, "B")
      ),
      container
    );

    // Without keys, index 0 is reconciled in-place (same DOM node, updated text)
    expect(container.firstChild.childNodes[0]).toBe(first);
    expect(container.firstChild.childNodes[0].textContent).toBe("X");
  });

  it("handles replacing all keyed children at once", () => {
    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "a" }, "A"),
        createElement("li", { key: "b" }, "B")
      ),
      container
    );

    render(
      createElement(
        "ul",
        null,
        createElement("li", { key: "c" }, "C"),
        createElement("li", { key: "d" }, "D")
      ),
      container
    );

    expect(container.firstChild.children.length).toBe(2);
    expect(container.firstChild.childNodes[0].textContent).toBe("C");
    expect(container.firstChild.childNodes[1].textContent).toBe("D");
  });
});
