import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

export interface UiState {
  themeMode: ThemeMode;
}

const STORAGE_KEY = "solodesk.themeMode";

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const initialState: UiState = {
  themeMode: getInitialThemeMode()
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === "light" ? "dark" : "light";
    }
  }
});

export const { setThemeMode, toggleThemeMode } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
export const uiStorageKey = STORAGE_KEY;
