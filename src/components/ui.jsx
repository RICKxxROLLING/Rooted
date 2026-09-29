// Rooted primitives (from rooted-design-handoff/starter, adapted to JS).
// Every colour is a semantic token, so dark mode works with no `dark:` variants.
// Accent jobs are fixed: moss = primary/healthy/ID · rain = water ·
// ochre = feeding/harvest/sun · clay = attention/create.
import { useEffect, useId, useRef } from "react";
import { Icon } from "./Icon";
import { linkProps } from "../lib/router";

export const cn = (...c) => c.filter(Boolean).join(" ");

export const TINT = {
  moss: "bg-moss-tint text-moss-deep",
  rain: "bg-rain-tint text-rain-deep",
  ochre: "bg-ochre-tint text-ochre-deep",
  clay: "bg-clay-tint text-clay-deep",
};
export const SOLID_TEXT = { moss: "text-moss", rain: "text-rain", ochre: "text-ochre", clay: "text-clay" };
export const DEEP_TEXT = { moss: "text-moss-deep", rain: "text-rain-deep", ochre: "text-ochre-deep", clay: "text-clay-deep" };
export const SOLID_BG = { moss: "bg-moss", rain: "bg-rain", ochre: "bg-ochre", clay: "bg-clay" };

/* ───────────────────────── Buttons ───────────────────────── */
export function Button({ variant = "primary", size = "md", icon, block, className, children, type = "button", ...rest }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans text-[15px] font-semibold transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
        size === "md" ? "h-12" : "h-[52px]",
        variant !== "text" && "rounded-full px-[22px]",
        variant === "primary" && "bg-moss text-on-accent",
        variant === "secondary" && "border border-line-strong bg-surface text-ink",
        variant === "text" && "px-3.5 text-moss underline underline-offset-4",
        variant === "destructive" && "bg-clay-tint text-clay-deep",
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

/** 44px icon button. `round` = circle (back buttons); default = radius 14 tile */
export function IconButton({ icon, label, round, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center border border-line bg-surface text-ink transition-transform duration-150 active:scale-[0.96]",
        round ? "rounded-full" : "rounded-input",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

/** Create/Identify floating action. Clay, 18px radius (not a circle). */
export function Fab({ icon = "plus", label, children, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={children ? undefined : label}
      className={cn(
        "inline-flex h-14 items-center justify-center gap-2 rounded-fab bg-clay text-[15px] font-semibold text-on-accent shadow-fab transition-transform duration-150 active:scale-[0.98]",
        children ? "pl-4 pr-5" : "w-14",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={22} strokeWidth={1.9} />
      {children}
    </button>
  );
}

/* ───────────────────────── Chips ───────────────────────── */
/** Status chip: tint fill, deep text, icon + word (status is never colour-only). */
export function StatusChip({ accent, icon, children, className }) {
  return (
    <span className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-chip pl-2.5 pr-3 text-[13px] font-semibold", TINT[accent], className)}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
}

/** Filter chip: pill, 36px. Selected = ink fill. */
export function FilterChip({ selected, children, className, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      className={cn(
        "h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors duration-150",
        selected ? "border-ink bg-ink text-on-inverse" : "border-line-strong bg-transparent text-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ───────────────────────── Inputs ───────────────────────── */
export function TextField({ label, unit, mono, className, hint, ...rest }) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      <div className="flex h-12 items-center gap-2 rounded-input border border-line-strong bg-surface px-4 focus-within:border-2 focus-within:border-moss focus-within:px-[15px]">
        <input id={id} className={cn("min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted outline-none focus-visible:outline-none", mono && "font-mono")} {...rest} />
        {unit && <span className="font-mono text-sm text-muted">{unit}</span>}
      </div>
      {hint && <p className="text-caption text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, className, ...rest }) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      <textarea
        id={id}
        rows={2}
        className="resize-none rounded-input border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-muted outline-none focus:border-2 focus:border-moss focus:px-[15px] focus:py-[11px] focus-visible:outline-none"
        {...rest}
      />
    </div>
  );
}

export function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-sunken p-1">
      {options.map(o => {
        const [val, text] = Array.isArray(o) ? o : [o, o];
        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={val === value}
            onClick={() => onChange(val)}
            className={cn(
              "h-10 flex-1 rounded-full text-sm transition-colors duration-150",
              val === value ? "bg-surface font-semibold text-ink shadow-thumb" : "font-medium text-muted",
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle switch (not in the handoff; built from moss + sunken + thumb shadow) */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150", checked ? "bg-moss" : "bg-sunken")}
    >
      <span className={cn("absolute top-1 size-5 rounded-full bg-surface shadow-thumb transition-[left] duration-150", checked ? "left-6" : "left-1")} />
    </button>
  );
}

/* ───────────────────────── Surfaces ───────────────────────── */
export function Card({ className, children, raised, as: As = "div", ...rest }) {
  return (
    <As className={cn("rounded-card border border-line", raised ? "bg-raised shadow-raised" : "bg-surface", className)} {...rest}>
      {children}
    </As>
  );
}

export function SectionHeader({ title, action, id }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-heading font-semibold">{title}</h2>
      {action}
    </div>
  );
}

/** Text link styled per spec (14/600, moss) */
export function TextLink({ href, onClick, children }) {
  const props = href ? linkProps(href) : { onClick, type: "button" };
  const El = href ? "a" : "button";
  // -my-3 + min-h-11: 44px tap target without changing the visual line height
  return <El {...props} className="-my-3 inline-flex min-h-11 items-center text-body-sm font-semibold text-moss underline-offset-4 hover:underline">{children}</El>;
}

/** 6px track, sunken background, accent fill. */
export function ProgressBar({ value, accent = "moss", label, height = "h-1.5" }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className={cn(height, "overflow-hidden rounded-full bg-sunken")}>
      <div className={cn("h-full rounded-full transition-[width] duration-200", SOLID_BG[accent])} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Reading tile: accent icon, mono value with muted unit, caption. */
export function ReadingTile({ icon, accent, value, unit, caption }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-tile border border-line bg-surface p-4">
      <span className={SOLID_TEXT[accent]}><Icon name={icon} size={20} /></span>
      <div className="font-mono text-stat font-medium text-ink">
        {value}<span className="text-sm text-muted">{unit}</span>
      </div>
      <div className="text-caption text-muted">{caption}</div>
    </div>
  );
}

/** Mono number with a muted unit — every measurement uses this */
export const Mono = ({ value, unit, className }) => (
  <span className={cn("font-mono", className)}>{value}{unit && <span className="text-muted"> {unit}</span>}</span>
);

/* ───────────────────────── Task row ───────────────────────── */
/** Lives inside a Card; the whole row is the label → big hit area. */
export function TaskRow({ title, detail, time, accent, icon, done, onToggle }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3.5 border-b border-line-soft px-4 py-3.5 last:border-b-0">
      <input type="checkbox" checked={!!done} onChange={e => onToggle?.(e.target.checked)} className="size-[22px] shrink-0 accent-[var(--r-moss)]" />
      {icon ? (
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-icon-tile", TINT[accent])}><Icon name={icon} size={20} /></span>
      ) : (
        <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", SOLID_BG[accent])} />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className={cn("text-row font-semibold transition-colors duration-150", done && "text-muted line-through")}>{title}</span>
        {detail && <span className="text-caption text-muted">{detail}</span>}
      </span>
      {time && <span className="shrink-0 font-mono text-xs text-muted">{time}</span>}
    </label>
  );
}

/* ───────────────────────── N-P-K bar ───────────────────────── */
/** Three 8px segments, flex-grow proportional: N = moss, P = ochre, K = clay */
export function NpkBar({ npk, labels = true }) {
  const parts = [["n", "bg-moss", "N · leaves"], ["p", "bg-ochre", "P · roots"], ["k", "bg-clay", "K · vigor"]];
  const total = (npk.n || 0) + (npk.p || 0) + (npk.k || 0);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-2 gap-1" role="img" aria-label={`N-P-K ${npk.n}-${npk.p}-${npk.k}`}>
        {parts.map(([k, bg]) => (
          <div key={k} className={cn("rounded-full", bg)} style={{ flexGrow: total ? Math.max(npk[k] || 0, 0.001) : 1, flexBasis: 0 }} />
        ))}
      </div>
      {labels && (
        <div className="flex justify-between font-mono text-[11px] text-muted">
          {parts.map(([k, , l]) => <span key={k}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Plant imagery ───────────────────────── */
/** Photo, or the moss-tint placeholder with a faint sprout */
export function PlantImage({ photo, className, iconSize = 64, dim }) {
  return photo ? (
    <img src={photo} alt="" className={cn("h-full w-full object-cover", dim && "dark:brightness-[0.92]", className)} />
  ) : (
    <div className={cn("flex h-full w-full items-center justify-center bg-moss-tint text-moss opacity-90", className)}>
      <Icon name="sprout" size={iconSize} strokeWidth={1.25} />
    </div>
  );
}

/* ───────────────────────── Type helpers ───────────────────────── */
export const ScreenTitle = ({ children, className }) => (
  <h1 className={cn("font-display font-soft text-screen-title font-normal", className)}>{children}</h1>
);
export const Eyebrow = ({ children, className }) => <div className={cn("text-label-caps", className)}>{children}</div>;
export const Latin = ({ children }) => <span className="font-display italic">{children}</span>;

/* ───────────────────────── Sheet ───────────────────────── */
/** Bottom sheet on phones, centred dialog from 768px. Escape / scrim closes. */
export function Sheet({ title, onClose, children, footer, wide }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const prev = document.activeElement;
    const el = ref.current;
    el?.querySelector("input, textarea, button:not([data-grabber])")?.focus({ preventScroll: true });
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && el) {
        // Keep focus inside the dialog
        const f = [...el.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter(n => !n.disabled);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; prev?.focus?.({ preventScroll: true }); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className="anim-fade absolute inset-0 bg-camera-scrim" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "anim-sheet relative flex max-h-[calc(100dvh-40px)] w-full flex-col rounded-t-sheet border border-line bg-ground shadow-raised md:rounded-sheet",
          wide ? "md:max-w-2xl" : "md:max-w-lg",
        )}
      >
        <div className="flex justify-center pt-3 md:hidden"><div className="h-[5px] w-10 rounded-full bg-line-strong" /></div>
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3 md:pt-5">
          <h2 id={titleId} className="font-display text-card-title font-medium">{title}</h2>
          <IconButton icon="close" label="Close" round onClick={onClose} className="border-transparent bg-transparent" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="flex gap-2.5 border-t border-line-soft px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 md:pb-5">{footer}</div>}
      </div>
    </div>
  );
}

/* ───────────────────────── Toasts ───────────────────────── */
export function Toasts({ toasts, withTabBar }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[60] mx-auto flex max-w-md flex-col gap-2 px-5",
        withTabBar ? "bottom-[calc(112px+env(safe-area-inset-bottom))]" : "bottom-[calc(96px+env(safe-area-inset-bottom))]",
      )}
    >
      {toasts.map(t => (
        <div key={t.id} className="anim-sheet flex items-center gap-3 rounded-tile border border-line bg-raised px-4 py-3 text-row font-semibold shadow-raised">
          {t.icon && <span className={SOLID_TEXT[t.accent || "moss"]}><Icon name={t.icon} size={20} /></span>}
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Tab bar ───────────────────────── */
export const TABS = [
  { id: "today", label: "Today", icon: "home", href: "/" },
  { id: "beds", label: "Beds", icon: "beds", href: "/beds" },
  { id: "plants", label: "Plants", icon: "sprout", href: "/plants" },
  { id: "feeding", label: "Feeding", icon: "fertilizer", href: "/feeding" },
];

/** Floating: 12px from sides, 24px + safe-area from bottom, 72px tall. */
export function TabBar({ active }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-[calc(24px+env(safe-area-inset-bottom))] z-40 mx-auto flex h-[72px] max-w-[456px] items-center justify-around rounded-tabbar border border-line bg-surface shadow-raised"
    >
      {TABS.map(t => {
        const on = t.id === active;
        return (
          <a
            key={t.id}
            {...linkProps(t.href)}
            aria-current={on ? "page" : undefined}
            className={cn("flex min-h-[44px] min-w-14 flex-col items-center justify-center gap-1 text-tab", on ? "font-semibold text-ink" : "font-medium text-muted")}
          >
            <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-150", on && "bg-moss-tint text-moss-deep")}>
              <Icon name={t.icon} size={20} />
            </span>
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}

/** Empty state card: neutral, one icon, one line, optional action */
export function EmptyState({ icon, title, detail, action }) {
  return (
    <Card className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="text-muted"><Icon name={icon} size={28} /></span>
      <p className="text-row font-semibold">{title}</p>
      {detail && <p className="max-w-xs text-caption text-muted">{detail}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}
