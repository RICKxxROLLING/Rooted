// Sheets shared across screens. All built from the Rooted primitives.
import { useMemo, useState } from "react";
import { useGarden } from "../lib/store";
import { PLANT_DB, registerCustomPlant } from "../lib/plantDb";
import { FERT_TYPES, calcNPKScore, canPlace, doPlace, getSpacingCells, randomId, resolveAnchor, toDateInput } from "../lib/garden";
import { fetchCustomPlantData, fetchPerenualPlant } from "../lib/api";
import { tasksUntil, daysUntil } from "../lib/tasks";
import { getThemePref, setThemePref } from "../lib/theme";
import { Icon } from "./Icon";
import {
  Button, Card, Eyebrow, FilterChip, Mono, NpkBar, SegmentedControl, Sheet, StatusChip, TINT, TextArea, TextField, cn,
} from "./ui";

/* ───────────── Settings ───────────── */
export function SettingsSheet({ onClose }) {
  const [theme, setTheme] = useState(getThemePref);
  return (
    <Sheet title="Settings" onClose={onClose}>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Appearance</span>
        <SegmentedControl
          label="Theme"
          options={[["system", "System"], ["light", "Light"], ["dark", "Dark"]]}
          value={theme}
          onChange={v => { setTheme(v); setThemePref(v); }}
        />
      </div>
    </Sheet>
  );
}

/* ───────────── Week ahead ───────────── */
export function WeekSheet({ onClose }) {
  const { plants, beds, fertilizers } = useGarden();
  const days = useMemo(() => {
    const tasks = tasksUntil(plants, beds, fertilizers, new Date(Date.now() + 6 * 864e5));
    const groups = new Map();
    for (const t of tasks) {
      const d = daysUntil(t.due);
      const key = d <= 0 ? "Today" : d === 1 ? "Tomorrow" : t.due.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    }
    return [...groups];
  }, [plants, beds, fertilizers]);

  return (
    <Sheet title="This week" onClose={onClose}>
      {days.length === 0 ? (
        <p className="py-6 text-center text-body-sm text-muted">Nothing scheduled in the next 7 days.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {days.map(([day, tasks]) => (
            <section key={day} className="flex flex-col gap-2">
              <Eyebrow>{day}</Eyebrow>
              <Card className="overflow-hidden">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3.5 border-b border-line-soft px-4 py-3 last:border-b-0">
                    <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", t.overdue ? "bg-clay" : { rain: "bg-rain", ochre: "bg-ochre" }[t.accent])} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-row font-semibold">{t.title}</span>
                      <span className="truncate text-caption text-muted">{t.detail}</span>
                    </span>
                    {t.overdue && <StatusChip accent="clay" icon="alert">Overdue</StatusChip>}
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </Sheet>
  );
}

/* ───────────── Log watering ───────────── */
export function LogWaterSheet({ plant, onClose }) {
  const { logWater, toast } = useGarden();
  const [amount, setAmount] = useState("");
  function save() {
    logWater(plant.id, amount.trim());
    toast(`Watered ${plant.nickname}`, { icon: "droplet", accent: "rain" });
    onClose();
  }
  return (
    <Sheet title="Log watering" onClose={onClose} footer={<Button block size="lg" icon="droplet" onClick={save}>Log watering</Button>}>
      <TextField label="Amount (optional)" unit="gal" mono inputMode="decimal" placeholder="0.5" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} />
    </Sheet>
  );
}

/* ───────────── Log feeding (choose a product) ───────────── */
export function LogFeedSheet({ plant, onClose }) {
  const { fertilizers, logFeed, toast } = useGarden();
  const category = PLANT_DB[plant.plantId]?.category;
  const [fertId, setFertId] = useState(plant.fertId && fertilizers.some(f => f.id === plant.fertId) ? plant.fertId : fertilizers[0]?.id || null);
  const [amount, setAmount] = useState("");
  function save() {
    logFeed(plant.id, fertId, amount.trim());
    toast(`Fed ${plant.nickname}`, { icon: "fertilizer", accent: "ochre" });
    onClose();
  }
  return (
    <Sheet title="Log feeding" onClose={onClose} footer={<Button block size="lg" icon="fertilizer" onClick={save}>Log feeding</Button>}>
      <div className="flex flex-col gap-4">
        {fertilizers.length === 0 ? (
          <p className="text-body-sm text-muted">No products yet — add them in the Feeding tab to track N-P-K. You can still log a feeding.</p>
        ) : (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">Product</legend>
            {fertilizers.map(f => {
              const score = calcNPKScore(category, f.npk);
              return (
                <label key={f.id} className={cn("flex cursor-pointer flex-col gap-2.5 rounded-tile border p-4", fertId === f.id ? "border-2 border-moss p-[15px]" : "border-line bg-surface")}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="fert" checked={fertId === f.id} onChange={() => setFertId(f.id)} className="size-5 accent-[var(--r-moss)]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-row font-semibold">{f.name}</span>
                      <span className="block text-caption text-muted">{[f.brand, f.type].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="font-mono text-body-sm font-medium">{f.npk.n}-{f.npk.p}-{f.npk.k}</span>
                  </span>
                  <NpkBar npk={f.npk} labels={false} />
                  <span className="text-caption text-muted">
                    <Mono value={`${score}%`} className={score >= 70 ? "text-moss-deep" : "text-ink"} /> N-P-K match for {category?.toLowerCase() || "this plant"}
                  </span>
                </label>
              );
            })}
            <label className="flex cursor-pointer items-center gap-3 px-1 py-2 text-body-sm">
              <input type="radio" name="fert" checked={fertId === null} onChange={() => setFertId(null)} className="size-5 accent-[var(--r-moss)]" />
              No product / other
            </label>
          </fieldset>
        )}
        <TextField label="Amount (optional)" placeholder="1 tbsp/gal" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
    </Sheet>
  );
}

/* ───────────── Plant picker (library + online) ───────────── */
/** Calls onPick({ plantId }) for a library plant, or onPick({ plant }) for a new online/custom one */
export function PlantPickerSheet({ onPick, onClose, title = "Find a plant", initialQuery = "" }) {
  const [q, setQ] = useState(initialQuery);
  const [online, setOnline] = useState(null); // { loading } | result from fetchCustomPlantData
  const all = useMemo(() => Object.entries(PLANT_DB).map(([id, p]) => ({ id, ...p })).sort((a, b) => a.name.localeCompare(b.name)), []);
  const query = q.trim().toLowerCase();
  const results = query ? all.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)) : all;

  async function searchOnline() {
    setOnline({ loading: true });
    setOnline(await fetchCustomPlantData(q.trim()));
  }
  async function pickOption(id) {
    setOnline(o => ({ ...o, loading: true }));
    try { onPick({ plant: await fetchPerenualPlant(q.trim(), id) }); }
    catch (err) { setOnline(o => ({ ...o, loading: false, reason: err.message })); }
  }

  return (
    <Sheet title={title} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <TextField label="Plant name" placeholder="Tomato, basil, agapanthus…" value={q} onChange={e => { setQ(e.target.value); setOnline(null); }} autoComplete="off" />

        {query.length > 1 && (
          <Card className="flex flex-col gap-3 p-4">
            {!online && (
              <button type="button" onClick={searchOnline} className="flex items-center gap-3 text-left">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-icon-tile", TINT.moss)}><Icon name="search" size={20} /></span>
                <span className="flex-1">
                  <span className="block text-row font-semibold">Search online for “{q.trim()}”</span>
                  <span className="block text-caption text-muted">Care info from the Perenual plant database</span>
                </span>
                <Icon name="chevron-right" size={18} className="text-muted" />
              </button>
            )}
            {online?.loading && <p className="text-body-sm text-muted">Searching Perenual…</p>}
            {online && !online.loading && (
              <>
                {online.reason && <StatusChip accent="clay" icon="alert" className="h-auto whitespace-normal py-1.5">{online.reason}</StatusChip>}
                {online.options?.length > 0 && (
                  <div className="flex flex-col">
                    <Eyebrow className="pb-1.5">Online matches</Eyebrow>
                    {online.options.map(o => (
                      <button key={o.id} type="button" onClick={() => pickOption(o.id)} className="flex min-h-[44px] items-center justify-between border-t border-line py-2.5 text-left text-row">
                        {o.name}<Icon name="chevron-right" size={18} className="text-muted" />
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="secondary" onClick={() => onPick({ plant: online.plant })}>
                  Use {online.source === "perenual" ? `“${online.plant.name}”` : "generic care info"}
                </Button>
              </>
            )}
          </Card>
        )}

        <div className="flex flex-col">
          <Eyebrow className="pb-1.5">{query ? `${results.length} in the library` : `Library · ${all.length} plants`}</Eyebrow>
          <div className="flex flex-col">
            {results.slice(0, 80).map(p => (
              <button key={p.id} type="button" onClick={() => onPick({ plantId: p.id })} className="flex min-h-[48px] items-center gap-3 border-t border-line py-2.5 text-left last:border-b">
                <span className="flex-1">
                  <span className="block text-row font-semibold">{p.name}</span>
                  <span className="block text-caption text-muted">{p.category} · water every {p.waterDays} d</span>
                </span>
                <Icon name="chevron-right" size={18} className="text-muted" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

/* ───────────── Add plant (nickname, date, bed + square) ───────────── */
/**
 * choice: { plantId } (library) or { plant } (custom/online), plus optional
 * photo, latin, idScore. `preset` may carry { bedId, cell: "x,y" }.
 */
export function AddPlantSheet({ choice, preset = {}, onClose, onAdded }) {
  const { beds, addPlant, updateBed, toast } = useGarden();
  const base = choice.plantId ? PLANT_DB[choice.plantId] : choice.plant;
  const [nickname, setNickname] = useState(choice.name || base?.name || "");
  const [planted, setPlanted] = useState(() => toDateInput(new Date()));
  const [bedId, setBedId] = useState(preset.bedId || null);
  const [cell, setCell] = useState(preset.cell || null);
  const bed = beds.find(b => b.id === bedId);
  const s = getSpacingCells(base || {});

  function save() {
    let plantId = choice.plantId;
    if (!plantId) {
      plantId = base.name.toLowerCase().replace(/\s+/g, "_") + "_" + randomId();
      registerCustomPlant(plantId, base);
    }
    const entry = addPlant({
      plantId,
      nickname: nickname.trim() || base.name,
      plantedDate: new Date(`${planted}T00:00`).toISOString(),
      photo: choice.photo || null,
      latin: choice.latin || base.latin || null,
      idScore: choice.idScore ?? null,
      bedId: bed?.id || null,
    });
    if (bed && cell) {
      const [x, y] = cell.split(",").map(Number);
      if (canPlace(bed.cells, bed.width, bed.height, x, y, s)) updateBed({ ...bed, cells: doPlace(bed.cells, x, y, plantId, s) });
    }
    toast(`${entry.nickname} added${bed ? ` to ${bed.name}` : ""}`, { icon: "sprout" });
    onAdded?.(entry);
  }

  return (
    <Sheet title="Add to your garden" onClose={onClose} footer={<Button block size="lg" icon="plus" onClick={save} disabled={!base}>Add plant</Button>}>
      <div className="flex flex-col gap-5">
        <TextField label="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} placeholder={base?.name} />
        <TextField label="Date planted" type="date" mono value={planted} onChange={e => setPlanted(e.target.value)} />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Bed</span>
          <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5">
            <FilterChip selected={!bedId} onClick={() => { setBedId(null); setCell(null); }}>No bed</FilterChip>
            {beds.map(b => <FilterChip key={b.id} selected={bedId === b.id} onClick={() => { setBedId(b.id); setCell(null); }}>{b.name}</FilterChip>)}
          </div>
        </div>
        {bed && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Square <span className="font-normal text-muted">(optional · needs {s} × {s} ft)</span></span>
            <MiniBedPicker bed={bed} size={s} value={cell} onChange={setCell} />
          </div>
        )}
      </div>
    </Sheet>
  );
}

/** Compact bed grid for choosing where a plant goes */
function MiniBedPicker({ bed, size, value, onChange }) {
  const [vx, vy] = value ? value.split(",").map(Number) : [-1, -1];
  const inPick = (x, y) => x >= vx && x < vx + size && y >= vy && y < vy + size;
  return (
    <div className="rounded-[16px] bg-wood p-2 shadow-[inset_0_0_0_2px_var(--r-wood-ring)]">
      <div className="grid gap-1 rounded-[10px] bg-wood-gap p-1" style={{ gridTemplateColumns: `repeat(${bed.width}, minmax(0, 1fr))` }}>
        {Array.from({ length: bed.height }, (_, y) => Array.from({ length: bed.width }, (_, x) => {
          const taken = !!resolveAnchor(bed.cells, `${x},${y}`);
          const fits = !taken && canPlace(bed.cells, bed.width, bed.height, x, y, size);
          const picked = inPick(x, y);
          return (
            <button
              key={`${x},${y}`}
              type="button"
              disabled={!fits && !picked}
              aria-label={`Square ${x + 1}, ${y + 1}${taken ? " (planted)" : fits ? "" : " (too small here)"}`}
              aria-pressed={picked}
              onClick={() => onChange(picked ? null : `${x},${y}`)}
              className={cn("aspect-square rounded-md text-[10px] font-bold", picked ? "bg-moss text-on-accent" : taken ? "bg-sunken" : fits ? "bg-ground" : "bg-ground opacity-40")}
            >
              {picked && x === vx && y === vy && <Icon name="check" size={14} className="mx-auto" />}
            </button>
          );
        }))}
      </div>
    </div>
  );
}

/** Number fields keep the raw text while typing (so the box can be cleared and
 *  retyped); the clamped value is derived, and the box is tidied on blur. */
const clampNum = (text, min, max) => {
  const n = Math.round(Number(text));
  return Number.isFinite(n) && String(text).trim() !== "" ? Math.max(min, Math.min(max, n)) : min;
};

/* ───────────── New bed ───────────── */
export function NewBedSheet({ onClose, onCreated }) {
  const { beds, addBed } = useGarden();
  const [name, setName] = useState(`Bed ${beds.length + 1}`);
  const [widthText, setWidthText] = useState("8");
  const [heightText, setHeightText] = useState("4");
  const width = clampNum(widthText, 1, 12);
  const height = clampNum(heightText, 1, 8);
  function create() {
    const bed = addBed({ name: name.trim() || `Bed ${beds.length + 1}`, width, height });
    onCreated?.(bed);
  }
  return (
    <Sheet title="New bed" onClose={onClose} footer={<Button block size="lg" icon="plus" onClick={create}>Create bed</Button>}>
      <div className="flex flex-col gap-5">
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Length" type="number" inputMode="numeric" min={1} max={12} mono unit="ft" hint="1–12 ft"
            value={widthText} onChange={e => setWidthText(e.target.value)} onBlur={() => setWidthText(String(width))} />
          <TextField label="Width" type="number" inputMode="numeric" min={1} max={8} mono unit="ft" hint="1–8 ft"
            value={heightText} onChange={e => setHeightText(e.target.value)} onBlur={() => setHeightText(String(height))} />
        </div>
        <p className="text-caption text-muted">Each square is 1 sq ft. <Mono value={width * height} unit="sq ft" /> in total.</p>
      </div>
    </Sheet>
  );
}

/* ───────────── Add fertilizer product (with barcode scan) ───────────── */
export function AddProductSheet({ onClose }) {
  const { addFertilizer, toast } = useGarden();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("Liquid");
  const [npkText, setNpkText] = useState({ n: "10", p: "10", k: "10" });
  const npk = { n: clampNum(npkText.n, 0, 50), p: clampNum(npkText.p, 0, 50), k: clampNum(npkText.k, 0, 50) };
  const [notes, setNotes] = useState("");
  const [scan, setScan] = useState({ busy: false, msg: "" });

  async function handleBarcode(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setScan({ busy: true, msg: "" });
    const imgUrl = URL.createObjectURL(file);
    try {
      let barcode;
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser"); // lazy: keeps the main bundle small
        barcode = (await new BrowserMultiFormatReader().decodeFromImageUrl(imgUrl)).getText();
      } catch {
        throw new Error("Couldn't read the barcode — try a clearer, closer photo.");
      }
      const res = await fetch(`/api/upc/lookup?upc=${encodeURIComponent(barcode)}`);
      if (res.status === 429) throw new Error("Barcode lookup limit reached — try again later.");
      const item = (await res.json().catch(() => ({}))).items?.[0];
      if (!item) throw new Error(`Product ${barcode} not found — enter details below.`);
      if (item.title) setName(item.title);
      if (item.brand) setBrand(item.brand);
      const text = `${item.title || ""} ${item.description || ""}`;
      const m = text.match(/(?<![\d.-])(\d{1,2}(?:\.\d+)?)\s*-\s*(\d{1,2}(?:\.\d+)?)\s*-\s*(\d{1,2}(?:\.\d+)?)(?![\d.-])/);
      if (m) {
        const c = v => Math.min(50, Math.round(Number(v)));
        setNpkText({ n: String(c(m[1])), p: String(c(m[2])), k: String(c(m[3])) });
      }
      const t = text.toLowerCase();
      const guessed = /spike/.test(t) ? "Spike" : /slow.?release|controlled.?release/.test(t) ? "Slow-release"
        : /granul|pellet/.test(t) ? "Granular" : /powder|soluble/.test(t) ? "Powder"
        : /liquid|concentrate/.test(t) ? "Liquid" : /organic|compost|manure|fish|kelp|bone meal/.test(t) ? "Organic" : null;
      if (guessed) setType(guessed);
      setScan({ busy: false, msg: m ? "" : "Found the product, but no N-P-K on record — check the label." });
    } catch (err) {
      setScan({ busy: false, msg: err instanceof TypeError ? "Couldn't reach the barcode lookup service." : err.message });
    } finally {
      URL.revokeObjectURL(imgUrl);
    }
  }

  const npkProps = k => ({
    value: npkText[k],
    onChange: e => setNpkText(v => ({ ...v, [k]: e.target.value })),
    onBlur: () => setNpkText(v => ({ ...v, [k]: String(npk[k]) })),
  });
  const valid = name.trim() && npk.n + npk.p + npk.k > 0;
  function save() {
    addFertilizer({ name: name.trim(), brand: brand.trim(), type, npk, notes });
    toast(`${name.trim()} added`, { icon: "fertilizer", accent: "ochre" });
    onClose();
  }

  return (
    <Sheet title="Add product" onClose={onClose} footer={<Button block size="lg" onClick={save} disabled={!valid}>Save product</Button>}>
      <div className="flex flex-col gap-5">
        <label className={cn("flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-surface text-[15px] font-semibold", scan.busy && "opacity-50")}>
          <Icon name="barcode" size={18} />
          {scan.busy ? "Reading barcode…" : "Scan barcode"}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleBarcode} disabled={scan.busy} />
        </label>
        {scan.msg && <StatusChip accent="clay" icon="alert" className="h-auto whitespace-normal py-1.5">{scan.msg}</StatusChip>}
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Tomato feed" />
        <TextField label="Brand (optional)" value={brand} onChange={e => setBrand(e.target.value)} />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Type</span>
          <div className="flex flex-wrap gap-2">
            {FERT_TYPES.map(t => <FilterChip key={t} selected={type === t} onClick={() => setType(t)}>{t}</FilterChip>)}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <TextField label="N" type="number" inputMode="numeric" min={0} max={50} mono {...npkProps("n")} />
            <TextField label="P" type="number" inputMode="numeric" min={0} max={50} mono {...npkProps("p")} />
            <TextField label="K" type="number" inputMode="numeric" min={0} max={50} mono {...npkProps("k")} />
          </div>
          <NpkBar npk={npk} />
        </div>
        <TextArea label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Half strength every 4 weeks" />
      </div>
    </Sheet>
  );
}

/* ───────────── Confirm ───────────── */
export function ConfirmSheet({ title, message, confirmLabel, onConfirm, onClose }) {
  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={<>
        <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" size="lg" className="flex-1" icon="trash" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </>}
    >
      <p className="text-body-sm text-muted">{message}</p>
    </Sheet>
  );
}
