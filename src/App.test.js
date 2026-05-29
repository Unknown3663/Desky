import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/svelte";

vi.hoisted(() => {
  if (typeof window !== "undefined") delete window.__TAURI__;
});

vi.mock("./lib/settings-store.svelte.js", () => ({
  settings: {
    showClock: false,
    showStats: false,
    showWeather: false,
    showTasks: false,
    showPomodoro: false,
    locationMode: "auto",
    latitude: null,
    longitude: null,
    currentTheme: "default",
    font: "Geist Mono",
    customCSS: "",
  },
  saveSettings: vi.fn(),
}));

import App from "./App.svelte";

describe("App", () => {
  it("renders in a non-Tauri environment without touching Tauri-only APIs", () => {
    const { getByRole } = render(App);
    expect(getByRole("button", { name: "settings" })).toBeDefined();
  });
});
