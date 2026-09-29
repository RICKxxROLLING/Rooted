// Theme preference: "system" | "light" | "dark". Writes .dark / .light on <html>
// so the CSS variables swap. public/theme-init.js applies it before first paint.
const KEY = "rooted-theme";

export function getThemePref() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function setThemePref(pref) {
  try {
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
    localStorage.removeItem("gt-darkmode"); // pre-redesign setting
  } catch { /* storage unavailable: still apply for this session */ }
  applyTheme(pref);
}

export function applyTheme(pref) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (pref !== "system") root.classList.add(pref);
  const dark = pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#1C1A16" : "#F4EFE6");
}
