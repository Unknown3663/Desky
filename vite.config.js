import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  base: "./",
  resolve:
    mode === "test"
      ? {
          conditions: ["browser"],
        }
      : undefined,
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
  },
}));
