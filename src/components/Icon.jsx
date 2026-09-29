// Rooted icon set — 24px grid, 1.75 stroke, round caps/joins, no fills.
// Colour comes from currentColor, so set it with text-* utilities. Never use emoji as icons.
const paths = {
  logo: <><path d="M4 13h16"/><path d="M12 13V8.5"/><path d="M12 8.5c0-2.5-2-4.5-5.5-4.5 0 2.7 2 4.5 5.5 4.5z"/><path d="M12 10c0-2.2 1.8-3.8 5-3.8 0 2.3-1.8 3.8-5 3.8z"/><path d="M12 13v5M12 15.5l-3 3M12 15l3 2.5"/></>,
  sprout: <><path d="M12 20v-8"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 14c0-3.5 2.5-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5z"/></>,
  droplet: <><path d="M12 3.5c3 3.6 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.9 6-10.5z"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></>,
  basket: <><path d="M4 10h16l-1.6 8.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8z"/><path d="M8 10l3-5M16 10l-3-5"/></>,
  beds: <><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></>,
  frost: <><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/></>,
  scan: <><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 15c0-3.5 2-6 6-6 0 4-2.5 6-6 6z"/></>,
  fertilizer: <><path d="M7 7h10l1.5 11a2 2 0 0 1-2 2.3H7.5a2 2 0 0 1-2-2.3z"/><path d="M8 7l1-3h6l1 3"/><path d="M10 13.5h4"/></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></>,
  home: <><path d="M4 11l8-6.5 8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></>,
  check: <><path d="M5 12.5l4.5 4.5L19 7.5"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  close: <><path d="M6 6l12 12M18 6L6 18"/></>,
  "chevron-left": <><path d="M15 6l-6 6 6 6"/></>,
  "chevron-right": <><path d="M9 6l6 6-6 6"/></>,
  "arrow-right": <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  // Added for the app, same construction (24 grid, stroke only, round joins)
  alert: <><path d="M12 4.5l8.5 14.5h-17z"/><path d="M12 10v4M12 16.8v.2"/></>,
  settings: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></>,
  trash: <><path d="M5 7h14M10 7V5h4v2"/><path d="M7 7l1 12.2a1.5 1.5 0 0 0 1.5 1.3h5a1.5 1.5 0 0 0 1.5-1.3L17 7"/></>,
  search: <><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/></>,
  barcode: <><path d="M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2"/><path d="M8 9v6M11 9v6M14 9v6M16.5 9v6"/></>,
  note: <><path d="M5 19l1-4 9.5-9.5a2.1 2.1 0 0 1 3 3L9 18z"/><path d="M13.5 7.5l3 3"/></>,
};

export function Icon({ name, size = 20, strokeWidth, title, ...rest }) {
  const sw = strokeWidth ?? (size <= 18 ? 2 : 1.75);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(paths);
