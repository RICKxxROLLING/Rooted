// Rooted design tokens → Tailwind v3 utilities (from rooted-design-handoff/tokens).
// Colours are CSS variables defined in src/index.css, so dark mode works by
// swapping variables — never use `dark:` for colour, and never palette colours.
const v = name => `var(--r-${name})`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ground: v("ground"), surface: v("surface"), raised: v("raised"), sunken: v("sunken"),
        line: { DEFAULT: v("line"), soft: v("line-soft"), strong: v("line-strong"), dashed: v("line-dashed") },
        ink: v("ink"), muted: v("muted"),
        "on-inverse": v("on-inverse"), "on-accent": v("on-accent"),
        moss: { DEFAULT: v("moss"), tint: v("moss-tint"), deep: v("moss-deep") },
        rain: { DEFAULT: v("rain"), tint: v("rain-tint"), deep: v("rain-deep") },
        ochre: { DEFAULT: v("ochre"), tint: v("ochre-tint"), deep: v("ochre-deep") },
        clay: { DEFAULT: v("clay"), tint: v("clay-tint"), deep: v("clay-deep") },
        wood: { DEFAULT: v("wood"), gap: v("wood-gap"), ring: v("wood-ring") },
        camera: { bg: v("camera-bg"), chrome: v("camera-chrome"), scrim: v("camera-scrim") },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', "Georgia", "serif"],
        sans: ['"Instrument Sans Variable"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "52px", letterSpacing: "-0.02em" }],
        "screen-title": ["36px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        title: ["28px", { lineHeight: "34px" }],
        "card-title": ["20px", { lineHeight: "26px" }],
        heading: ["18px", { lineHeight: "24px" }],
        body: ["16px", { lineHeight: "24px" }],
        row: ["15px", { lineHeight: "20px" }],
        "body-sm": ["14px", { lineHeight: "20px" }],
        caption: ["13px", { lineHeight: "18px" }],
        label: ["12px", { lineHeight: "16px", letterSpacing: "0.08em" }],
        tab: ["11px", { lineHeight: "14px" }],
        stat: ["24px", { lineHeight: "28px" }],
      },
      borderRadius: {
        chip: "8px", "icon-tile": "12px", input: "14px", tile: "18px", fab: "18px",
        card: "22px", tabbar: "24px", sheet: "28px",
      },
      boxShadow: {
        raised: v("shadow-raised"), fab: v("shadow-fab"), thumb: v("shadow-thumb"),
      },
    },
  },
  plugins: [],
};
