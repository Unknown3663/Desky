const defaultCustomColors = {
  bg1: "#141414",
  bg2: "#1d1d1d",
  bg3: "#262626",
  txt1: "#dedede",
  txt2: "#aeaeae",
  txt3: "#636363",
  txt4: "#484848",
  txtErr: "#d6809c",
};

function detectFormatPreferences() {
  try {
    const use24h = !new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
    }).resolvedOptions().hour12;
    const dayBeforeMonth =
      new Intl.DateTimeFormat().formatToParts(new Date())[0].type === "day";
    const useFahrenheit = navigator.language === "en-US";
    return {
      timeFormat: use24h ? "24hr" : "12hr",
      dateFormat: dayBeforeMonth ? "dmy" : "mdy",
      tempUnit: useFahrenheit ? "fahrenheit" : "celsius",
      speedUnit: useFahrenheit ? "mph" : "kmh",
    };
  } catch {
    return {};
  }
}

const defaultSettings = {
  font: "Geist Mono",
  currentTheme: "default",
  locationMode: "auto",
  latitude: null,
  longitude: null,
  timeFormat: "12hr",
  dateFormat: "mdy",
  tempUnit: "celsius",
  speedUnit: "kmh",
  forecastMode: "hourly",
  pingUrl: "https://www.google.com/generate_204",
  customCSS: "",
  pomFocusDuration: 25,
  pomShortBreakDuration: 5,
  pomLongBreakDuration: 15,
  pomSessions: 4,
  pomAutoStartFocus: false,
  pomAutoStartBreaks: false,
  pomSoundFocusStart: "chime",
  pomSoundBreakStart: "soft ping",
  pomSoundAllDone: "bell",
  showPomodoro: true,
  showStats: true,
  showWeather: true,
  showTasks: true,
  customThemeColors: { ...defaultCustomColors },
};

function loadSettings() {
  try {
    const stored = localStorage.getItem("startpage-settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultSettings,
        ...parsed,
        customThemeColors: {
          ...defaultCustomColors,
          ...(parsed.customThemeColors || {}),
        },
      };
    }
  } catch {}
  return { ...defaultSettings, ...detectFormatPreferences() };
}

export function saveSettings(s) {
  try {
    localStorage.setItem("startpage-settings", JSON.stringify(s));
  } catch {}
}

export function resetSettings() {
  try {
    localStorage.removeItem("startpage-settings");
    const fresh = { ...defaultSettings, ...detectFormatPreferences() };
    Object.assign(settings, fresh);
  } catch {}
}

export function exportSettings() {
  const blob = new Blob([JSON.stringify(settings, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "startpage-settings.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importSettings(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const merged = {
        ...defaultSettings,
        ...parsed,
        customThemeColors: {
          ...defaultCustomColors,
          ...(parsed.customThemeColors || {}),
        },
      };
      Object.assign(settings, merged);
      saveSettings(settings);
    } catch {}
  };
  reader.readAsText(file);
}

export const settings = $state(loadSettings());
export { defaultCustomColors };
