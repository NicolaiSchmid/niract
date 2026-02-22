import { describe, it, expect, beforeEach } from "vitest";
import { createElement, render, createContext, useContext } from "../src/niract.ts";

describe("Phase 8: Context", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("createContext returns an object with Provider and a default value", () => {
    const MyContext = createContext("default");
    expect(MyContext).toBeDefined();
    expect(MyContext.Provider).toBeDefined();
    expect(typeof MyContext.Provider).toBe("function");
  });

  it("useContext returns the default value when no Provider is above", () => {
    const ThemeContext = createContext("light");

    let capturedTheme;
    function App() {
      capturedTheme = useContext(ThemeContext);
      return createElement("div", null, capturedTheme);
    }

    render(createElement(App, null), container);
    expect(capturedTheme).toBe("light");
    expect(container.innerHTML).toBe("<div>light</div>");
  });

  it("useContext reads value from the nearest Provider", () => {
    const ThemeContext = createContext("light");

    let capturedTheme;
    function Child() {
      capturedTheme = useContext(ThemeContext);
      return createElement("span", null, capturedTheme);
    }

    function App() {
      return createElement(
        ThemeContext.Provider,
        { value: "dark" },
        createElement(Child, null)
      );
    }

    render(createElement(App, null), container);
    expect(capturedTheme).toBe("dark");
  });

  it("nested Providers override outer values", () => {
    const ThemeContext = createContext("light");

    let outerTheme, innerTheme;

    function OuterChild() {
      outerTheme = useContext(ThemeContext);
      return createElement("span", null, outerTheme);
    }

    function InnerChild() {
      innerTheme = useContext(ThemeContext);
      return createElement("span", null, innerTheme);
    }

    function App() {
      return createElement(
        ThemeContext.Provider,
        { value: "dark" },
        createElement(OuterChild, null),
        createElement(
          ThemeContext.Provider,
          { value: "blue" },
          createElement(InnerChild, null)
        )
      );
    }

    render(createElement(App, null), container);
    expect(outerTheme).toBe("dark");
    expect(innerTheme).toBe("blue");
  });

  it("multiple contexts work independently", () => {
    const ThemeContext = createContext("light");
    const LangContext = createContext("en");

    let capturedTheme, capturedLang;

    function Child() {
      capturedTheme = useContext(ThemeContext);
      capturedLang = useContext(LangContext);
      return createElement("div", null, `${capturedTheme}-${capturedLang}`);
    }

    function App() {
      return createElement(
        ThemeContext.Provider,
        { value: "dark" },
        createElement(
          LangContext.Provider,
          { value: "de" },
          createElement(Child, null)
        )
      );
    }

    render(createElement(App, null), container);
    expect(capturedTheme).toBe("dark");
    expect(capturedLang).toBe("de");
  });

  it("updates consumers when Provider value changes on re-render", () => {
    const ThemeContext = createContext("light");

    let capturedTheme;

    function Child() {
      capturedTheme = useContext(ThemeContext);
      return createElement("span", null, capturedTheme);
    }

    function App(props) {
      return createElement(
        ThemeContext.Provider,
        { value: props.theme },
        createElement(Child, null)
      );
    }

    render(createElement(App, { theme: "dark" }), container);
    expect(capturedTheme).toBe("dark");

    render(createElement(App, { theme: "light" }), container);
    expect(capturedTheme).toBe("light");
  });
});
