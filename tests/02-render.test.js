import { describe, it, expect, beforeEach } from "vitest";
import { createElement, render } from "../src/mini-react.js";

describe("Phase 2: render", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("renders a simple text element", () => {
    const vdom = createElement("p", null, "hello world");
    render(vdom, container);
    expect(container.innerHTML).toBe("<p>hello world</p>");
  });

  it("renders nested elements", () => {
    const vdom = createElement(
      "div",
      null,
      createElement("h1", null, "title"),
      createElement("p", null, "body")
    );
    render(vdom, container);
    expect(container.querySelector("h1").textContent).toBe("title");
    expect(container.querySelector("p").textContent).toBe("body");
  });

  it("sets element attributes", () => {
    const vdom = createElement("div", { id: "main", className: "box" });
    render(vdom, container);
    const el = container.firstChild;
    expect(el.id).toBe("main");
    expect(el.className).toBe("box");
  });

  it("sets style as an object", () => {
    const vdom = createElement("div", {
      style: { color: "red", fontSize: "14px" },
    });
    render(vdom, container);
    const el = container.firstChild;
    expect(el.style.color).toBe("red");
    expect(el.style.fontSize).toBe("14px");
  });

  it("attaches event listeners (onClick)", () => {
    let clicked = false;
    const vdom = createElement("button", {
      onClick: () => { clicked = true; },
    }, "click me");
    render(vdom, container);
    container.firstChild.click();
    expect(clicked).toBe(true);
  });

  it("renders function components", () => {
    function Greeting(props) {
      return createElement("h2", null, `Hello, ${props.name}!`);
    }
    const vdom = createElement(Greeting, { name: "Nico" });
    render(vdom, container);
    expect(container.innerHTML).toBe("<h2>Hello, Nico!</h2>");
  });

  it("clears the container before rendering", () => {
    container.innerHTML = "<p>old stuff</p>";
    const vdom = createElement("p", null, "new stuff");
    render(vdom, container);
    expect(container.childNodes.length).toBe(1);
    expect(container.innerHTML).toBe("<p>new stuff</p>");
  });
});
