import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import fs from "node:fs";

const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM;
const webStubRoot = fileURLToPath(
  new URL("./src/lib/tauri-stubs/", import.meta.url),
);
const coreStub = resolve(webStubRoot, "core.js");
const windowStub = resolve(webStubRoot, "window.js");
const hasStubs = fs.existsSync(coreStub) && fs.existsSync(windowStub);

export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  base: "./",
  resolve: {
    conditions: mode === "test" ? ["browser"] : undefined,
    alias: isTauriBuild
      ? undefined
      : hasStubs
        ? {
            "@tauri-apps/api/core": coreStub,
            "@tauri-apps/api/window": windowStub,
          }
        : undefined,
  },
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
  },
}));

if (!isTauriBuild && !hasStubs) {
  console.warn(
    "Tauri web stubs not found in src/lib/tauri-stubs/. Web build will import real @tauri-apps/api if available.",
  );
}
