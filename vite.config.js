import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxFactory: "MiniReact.createElement",
    jsxFragment: "MiniReact.Fragment",
  },
  test: {
    environment: "jsdom",
  },
});
