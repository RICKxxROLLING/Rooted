// Applies the saved System/Light/Dark preference before first paint (no flash).
// External file rather than inline so the strict CSP (script-src 'self') allows it.
// Kept in sync with src/lib/theme.js.
(function () {
  var pref = "system";
  try {
    var v = localStorage.getItem("rooted-theme");
    if (v === "light" || v === "dark") pref = v;
    else if (localStorage.getItem("gt-darkmode") === "true") pref = "dark"; // pre-redesign setting
  } catch (e) {}
  var root = document.documentElement;
  if (pref !== "system") root.classList.add(pref);
  var dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#1C1A16" : "#F4EFE6");
})();
