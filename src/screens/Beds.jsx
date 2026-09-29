// Bed planner — plan what grows where, square-foot style (spec §3).
import { useEffect, useMemo, useState } from "react";
import { useGarden } from "../lib/store";
import { PLANT_DB, registerCustomPlant } from "../lib/plantDb";
import {
  adjacentPairs, canPlace, cellCompatStatus, doPlace, doRemove, getCompatibility, getNeighbours, getSpacingCells,
  getSuggestions, randomId, resolveAnchor, scorePlantAgainstNeighbours,
} from "../lib/garden";
import { FEED_INTERVAL_DAYS, daysUntil, nextFeedDate, season, waterInterval } from "../lib/tasks";
import { linkProps, navigate } from "../lib/router";
import { Icon } from "../components/Icon";
import {
  Button, Card, EmptyState, Eyebrow, FilterChip, Mono, ScreenTitle, SegmentedControl, Sheet, StatusChip, TINT, TextField, cn,
} from "../components/ui";
import { ConfirmSheet, NewBedSheet, PlantPickerSheet } from "../components/sheets";

// Crop tints cycle through the four accent tints, stable per crop within a bed
const CROP_ACCENTS = ["moss", "ochre", "clay", "rain"];

export default function Beds({ id }) {
  const { beds } = useGarden();
  const [creating, setCreating] = useState(() => new URLSearchParams(location.search).has("new"));
  const bed = beds.find(b => b.id === id) || (!id ? beds[0] : null);

  // /beds → first bed's URL, so back/forward and links work
  useEffect(() => { if (!id && beds[0]) navigate(`/beds/${beds[0].id}`, { replace: true }); }, [id, beds]);

  const header = (
    <div className="flex items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <Eyebrow>Planner · {season()}</Eyebrow>
        <ScreenTitle className="truncate">{bed ? bed.name : "Beds"}</ScreenTitle>
      </div>
      {bed && <span className="shrink-0 pb-1.5 font-mono text-caption text-muted">{bed.height} × {bed.width} ft</span>}
    </div>
  );

  const switcher = (
    <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
      {beds.map(b => (
        <FilterChip key={b.id} selected={bed?.id === b.id} onClick={() => navigate(`/beds/${b.id}`, { replace: true })}>{b.name}</FilterChip>
      ))}
      <button type="button" aria-label="New bed" onClick={() => setCreating(true)} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-line-dashed text-muted">
        <Icon name="plus" size={18} />
      </button>
    </div>
  );

  return (
    <div className="pt-screen pb-tabbar flex flex-col gap-[18px]">
      {header}
      {switcher}
      {bed ? <BedPlanner key={bed.id} bed={bed} /> : (
        <EmptyState icon="beds" title={id ? "That bed doesn't exist" : "No beds yet"} detail="Lay out a raised bed square-foot style and see which plants make good neighbours." action={<Button icon="plus" onClick={() => setCreating(true)}>New bed</Button>} />
      )}
      {creating && (
        <NewBedSheet
          onClose={() => { setCreating(false); if (location.search) navigate(location.pathname, { replace: true }); }}
          onCreated={b => { setCreating(false); navigate(`/beds/${b.id}`, { replace: true }); }}
        />
      )}
    </div>
  );
}

function BedPlanner({ bed }) {
  const { plants, fertilizers, updateBed, deleteBed, toast } = useGarden();
  const [active, setActive] = useState(null); // {x, y}
  const [confirmDelete, setConfirmDelete] = useState(false);

  const anchors = Object.entries(bed.cells).filter(([, v]) => v && !v.startsWith("@"));
  const cropAccent = useMemo(() => {
    const map = {};
    for (const [, id] of anchors) if (!(id in map)) map[id] = CROP_ACCENTS[Object.keys(map).length % CROP_ACCENTS.length];
    return map;
  }, [bed.cells]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = {};
  for (const [, id] of anchors) counts[id] = (counts[id] || 0) + 1;
  const occupied = Object.keys(bed.cells).length;
  const total = bed.width * bed.height;
  const pairs = adjacentPairs(bed).map(([a, b]) => ({ a, b, c: getCompatibility(a, b) })).filter(p => p.c !== "neutral");
  const conflicts = pairs.filter(p => p.c === "bad");

  function plantAt(plantId) {
    const { x, y } = active;
    const s = getSpacingCells(PLANT_DB[plantId] || {});
    if (!canPlace(bed.cells, bed.width, bed.height, x, y, s)) return;
    updateBed({ ...bed, cells: doPlace(bed.cells, x, y, plantId, s) });
    setActive(null);
  }
  function removeAt() {
    const anchor = resolveAnchor(bed.cells, `${active.x},${active.y}`);
    if (anchor) updateBed({ ...bed, cells: doRemove(bed.cells, anchor) });
    setActive(null);
  }

  // Bed care: tracked plants assigned to this bed
  const inBed = plants.filter(p => p.bedId === bed.id);

  return (
    <div className="flex flex-col gap-[18px] md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start md:gap-6">
      <div className="flex flex-col gap-[18px]">
        {/* 3. Bed grid */}
        <div className="rounded-[20px] bg-wood p-2.5 shadow-[inset_0_0_0_2px_var(--r-wood-ring)]">
          <div
            className="grid gap-1 rounded-icon-tile bg-wood-gap p-1"
            style={{ gridTemplateColumns: `repeat(${bed.width}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${bed.height}, auto)` }}
          >
            {Array.from({ length: bed.height }, (_, y) => Array.from({ length: bed.width }, (_, x) => {
              const key = `${x},${y}`;
              const v = bed.cells[key];
              if (v?.startsWith("@")) return null; // covered by a multi-square plant
              const pos = { gridColumnStart: x + 1, gridRowStart: y + 1 };
              if (!v) {
                return (
                  <button key={key} type="button" style={pos} onClick={() => setActive({ x, y })}
                    aria-label={`Open square ${x + 1}, ${y + 1} — add a plant`}
                    className="flex aspect-square items-center justify-center rounded-lg bg-ground text-line-dashed transition-transform duration-150 active:scale-95">
                    <Icon name="plus" size={14} />
                  </button>
                );
              }
              const p = PLANT_DB[v];
              const s = getSpacingCells(p || {});
              const accent = cropAccent[v] || "moss";
              const status = cellCompatStatus(bed.cells, bed.width, bed.height, x, y);
              return (
                <button key={key} type="button" onClick={() => setActive({ x, y })}
                  style={{ ...pos, gridColumnEnd: `span ${s}`, gridRowEnd: `span ${s}` }}
                  aria-label={`${p?.name || "Plant"}${status === "bad" ? " — companion conflict" : ""}`}
                  className={cn("relative flex min-h-0 flex-col items-center justify-center rounded-lg text-[11px] font-bold transition-transform duration-150 active:scale-[0.97]", TINT[accent], s === 1 && "aspect-square")}>
                  <span>{s >= 2 ? p?.name : (p?.name || "?")[0]}</span>
                  {status === "bad" && <Icon name="alert" size={14} className="absolute right-1 top-1 text-clay-deep" />}
                </button>
              );
            }))}
          </div>
        </div>

        {/* 4. Legend */}
        <ul className="flex flex-wrap gap-x-3.5 gap-y-2 text-caption text-muted">
          {Object.entries(counts).map(([id, n]) => (
            <li key={id} className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-[4px] border border-line-strong", TINT[cropAccent[id]])} />
              {PLANT_DB[id]?.name || "Plant"} <span className="font-mono">×{n}</span>
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-[4px] border border-dashed border-line-dashed bg-ground" />
            Open <span className="font-mono">×{total - occupied}</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-[18px]">
        {/* 5. Bed care */}
        <Card className="flex flex-col gap-3 px-[18px] py-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Bed care</h2>
            <span className="font-mono text-xs text-muted">{occupied} / {total} sq ft</span>
          </div>
          {inBed.length === 0 ? (
            <p className="text-body-sm text-muted">No tracked plants in this bed yet. Add one from Plants or Identify and choose this bed.</p>
          ) : inBed.map(p => {
            const fert = fertilizers.find(f => f.id === p.fertId);
            const feedIn = daysUntil(nextFeedDate(p));
            return (
              <a key={p.id} {...linkProps(`/plants/${p.id}`)} className="flex flex-col gap-1.5 border-t border-line-soft pt-3 first-of-type:border-t-0 first-of-type:pt-0">
                <span className="text-row font-semibold">{p.nickname}</span>
                <span className="flex items-center gap-3 text-rain-deep">
                  <Icon name="droplet" size={18} />
                  <span className="flex-1 text-body-sm text-ink">{p.autoWater?.enabled ? "Sprinkler" : "Water"} · every {waterInterval(p)} days</span>
                </span>
                <span className="flex items-center gap-3 text-ochre-deep">
                  <Icon name="fertilizer" size={18} />
                  <span className="flex-1 text-body-sm text-ink">{fert ? `${fert.name} ${fert.npk.n}-${fert.npk.p}-${fert.npk.k}` : "Feed"} · every {FEED_INTERVAL_DAYS} d</span>
                  <span className="font-mono text-caption">{feedIn <= 0 ? "due" : `in ${feedIn} d`}</span>
                </span>
              </a>
            );
          })}
        </Card>

        {/* Companion planting */}
        {pairs.length > 0 && (
          <Card className="flex flex-col gap-3 px-[18px] py-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold">Neighbours</h2>
              {conflicts.length > 0 && <StatusChip accent="clay" icon="alert">{conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}</StatusChip>}
            </div>
            {pairs.map(({ a, b, c }, i) => (
              <div key={i} className="flex items-center justify-between gap-3 border-t border-line-soft pt-3 text-body-sm first-of-type:border-t-0 first-of-type:pt-0">
                <span>{PLANT_DB[a]?.name} + {PLANT_DB[b]?.name}</span>
                {c === "good"
                  ? <StatusChip accent="moss" icon="check">Good pair</StatusChip>
                  : <StatusChip accent="clay" icon="alert">Conflict</StatusChip>}
              </div>
            ))}
          </Card>
        )}

        <Button variant="destructive" icon="trash" className="self-start" onClick={() => setConfirmDelete(true)}>Delete bed</Button>
      </div>

      {active && (bed.cells[`${active.x},${active.y}`]
        ? <PlantedSquareSheet bed={bed} x={active.x} y={active.y} onRemove={removeAt} onClose={() => setActive(null)} />
        : <OpenSquareSheet bed={bed} x={active.x} y={active.y} onPlant={plantAt} onClose={() => setActive(null)} />)}
      {confirmDelete && (
        <ConfirmSheet
          title={`Delete ${bed.name}?`}
          message="The layout is removed. Plants tracked in this bed stay in your garden without a bed."
          confirmLabel="Delete bed"
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => { deleteBed(bed.id); toast(`${bed.name} deleted`, { icon: "trash", accent: "clay" }); navigate("/beds", { replace: true }); }}
        />
      )}
    </div>
  );
}

/* ───────────── Open square: choose what to plant ───────────── */
function OpenSquareSheet({ bed, x, y, onPlant, onClose }) {
  const [tab, setTab] = useState("best");
  const [q, setQ] = useState("");
  const [picker, setPicker] = useState(false);
  const nbs = getNeighbours(bed.cells, bed.width, bed.height, x, y);
  const ids = tab === "best"
    ? getSuggestions(bed.cells, bed.width, bed.height, x, y).map(s => s.id)
    : Object.keys(PLANT_DB).filter(id => PLANT_DB[id].name.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => PLANT_DB[a].name.localeCompare(PLANT_DB[b].name));

  return (
    <Sheet title="Plant this square" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <SegmentedControl label="Plant list" options={[["best", "Best picks"], ["all", "All plants"]]} value={tab} onChange={setTab} />
        {tab === "all" && <TextField label="Search" value={q} onChange={e => setQ(e.target.value)} placeholder="Tomato, kale…" />}
        {tab === "best" && nbs.length === 0 && <p className="text-caption text-muted">No neighbours yet — these are the most companion-friendly plants overall.</p>}
        <ul className="flex flex-col">
          {ids.slice(0, 60).map(id => {
            const p = PLANT_DB[id];
            const s = getSpacingCells(p);
            const fits = canPlace(bed.cells, bed.width, bed.height, x, y, s);
            const score = scorePlantAgainstNeighbours(id, nbs);
            return (
              <li key={id}>
                <button type="button" disabled={!fits} onClick={() => onPlant(id)}
                  className="flex min-h-[52px] w-full items-center gap-3 border-t border-line py-2.5 text-left disabled:opacity-50">
                  <span className="flex-1">
                    <span className="block text-row font-semibold">{p.name}</span>
                    <span className="block text-caption text-muted">{fits ? <><Mono value={`${s} × ${s}`} unit="ft" /> · {p.category}</> : `Needs ${s} × ${s} ft — won't fit here`}</span>
                  </span>
                  {fits && nbs.length > 0 && score > 0 && <StatusChip accent="moss" icon="check">Good neighbour</StatusChip>}
                  {fits && nbs.length > 0 && score < 0 && <StatusChip accent="clay" icon="alert">Conflict</StatusChip>}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2.5 border-t border-line pt-4">
          <Button variant="secondary" icon="scan" onClick={() => navigate(`/identify?bed=${bed.id}&cell=${x},${y}`)}>Identify</Button>
          <Button variant="secondary" icon="search" onClick={() => setPicker(true)}>Search online</Button>
        </div>
      </div>
      {picker && (
        <PlantPickerSheet
          title="Search online"
          onClose={() => setPicker(false)}
          onPick={({ plantId, plant }) => {
            if (!plant) return onPlant(plantId);
            const key = plant.name.toLowerCase().replace(/\s+/g, "_") + "_" + randomId();
            registerCustomPlant(key, plant);
            onPlant(key);
          }}
        />
      )}
    </Sheet>
  );
}

/* ───────────── Planted square: details + remove ───────────── */
function PlantedSquareSheet({ bed, x, y, onRemove, onClose }) {
  const anchor = resolveAnchor(bed.cells, `${x},${y}`);
  const id = bed.cells[anchor];
  const p = PLANT_DB[id];
  const [ax, ay] = anchor.split(",").map(Number);
  const nbs = getNeighbours(bed.cells, bed.width, bed.height, ax, ay);
  const s = getSpacingCells(p || {});
  return (
    <Sheet
      title={p?.name || "Plant"}
      onClose={onClose}
      footer={<Button variant="destructive" size="lg" block icon="trash" onClick={onRemove}>Remove from bed</Button>}
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-muted">{p?.category} · <Mono value={`${s} × ${s}`} unit="ft" /> · water every <Mono value={p?.waterDays} unit="d" /></p>
        {nbs.length > 0 ? (
          <Card className="overflow-hidden">
            {nbs.map(n => {
              const c = getCompatibility(id, n);
              return (
                <div key={n} className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 last:border-b-0">
                  <span className="text-row">{PLANT_DB[n]?.name}</span>
                  {c === "good" ? <StatusChip accent="moss" icon="check">Good pair</StatusChip>
                    : c === "bad" ? <StatusChip accent="clay" icon="alert">Conflict</StatusChip>
                    : <span className="text-caption text-muted">Neutral</span>}
                </div>
              );
            })}
          </Card>
        ) : <p className="text-caption text-muted">No neighbours yet.</p>}
        {(p?.companions?.length > 0 || p?.avoid?.length > 0) && (
          <div className="flex flex-col gap-1.5 text-caption">
            {p.companions?.length > 0 && <p><span className="font-semibold text-moss-deep">Grows well with</span> <span className="text-muted">{p.companions.join(", ")}</span></p>}
            {p.avoid?.length > 0 && <p><span className="font-semibold text-clay-deep">Keep away from</span> <span className="text-muted">{p.avoid.join(", ")}</span></p>}
          </div>
        )}
      </div>
    </Sheet>
  );
}
