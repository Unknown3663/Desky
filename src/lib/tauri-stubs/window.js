// Minimal web stub for @tauri-apps/api/window
export function getCurrentWindow() {
  return {
    minimize: async () => {},
    toggleMaximize: async () => {},
    close: async () => {},
  };
}

export default { getCurrentWindow };
export function getCurrentWindow() {
  return {
    minimize() {},
    toggleMaximize() {},
    close() {},
  };
}
