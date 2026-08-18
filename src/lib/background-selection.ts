export type BackgroundSelection = { mode: "none" } | { mode: "blur" } | { mode: "image"; url: string };

export const BACKGROUND_STORAGE_KEY = "reuniao:background";

export function loadBackgroundSelection(): BackgroundSelection {
  if (typeof window === "undefined") return { mode: "none" };
  try {
    const raw = window.localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (!raw) return { mode: "none" };
    return JSON.parse(raw) as BackgroundSelection;
  } catch {
    return { mode: "none" };
  }
}

export function saveBackgroundSelection(selection: BackgroundSelection) {
  window.localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(selection));
}
