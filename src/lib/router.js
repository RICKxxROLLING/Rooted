// Minimal History-API router: real URLs (so the phone's back button works) without
// a dependency. nginx and Vite already fall back to index.html for unknown paths.
import { useEffect, useState } from "react";

const listeners = new Set();

export function navigate(path, { replace = false } = {}) {
  if (path === location.pathname) return;
  history[replace ? "replaceState" : "pushState"]({ inApp: !replace || !!history.state?.inApp }, "", path);
  window.scrollTo(0, 0);
  listeners.forEach(fn => fn(location.pathname));
}

/** Go back within the app, or to `fallback` when this is the first page visited */
export function goBack(fallback = "/") {
  if (history.state?.inApp) history.back();
  else navigate(fallback, { replace: true });
}

export function usePath() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    listeners.add(setPath);
    addEventListener("popstate", onPop);
    return () => { listeners.delete(setPath); removeEventListener("popstate", onPop); };
  }, []);
  return path;
}

/** Match "/plants/:id" style patterns; returns params or null */
export function match(pattern, path) {
  const p = pattern.split("/"), a = path.split("/");
  if (p.length !== a.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}

/** <a> that navigates client-side (keeps real hrefs for accessibility / new-tab) */
export function linkProps(href) {
  return {
    href,
    onClick: e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(href);
    },
  };
}
