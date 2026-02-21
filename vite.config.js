import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxFactory: "Niract.createElement",
    jsxFragment: "Niract.Fragment",
  },
  test: {
    environment: "jsdom",
  },
});
