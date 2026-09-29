// Plant care — one plant's watering + fertilizer schedule and history (spec §4).
import { useState } from "react";
import { logText, logType, useGarden } from "../lib/store";
import { PLANT_DB } from "../lib/plantDb";
import { addDays, currentHealth, daysBetween, fmt, getStage, healthStatus, stageProgress, startOfDay } from "../lib/garden";
import { FEED_INTERVAL_DAYS, daysUntil, harvestDate, isReadyToPick, nextFeedDate, waterInterval, waterStatus } from "../lib/tasks";
import { goBack, linkProps } from "../lib/router";
import { Icon } from "../components/Icon";
import {
  Button, Card, Eyebrow, FilterChip, IconButton, Mono, NpkBar, PlantImage, ProgressBar, StatusChip, Switch, TextField, cn,
} from "../components/ui";
import { ConfirmSheet, LogFeedSheet, LogWaterSheet } from "../components/sheets";

export default function PlantCare({ id }) {
  const { getPlant, beds } = useGarden();
  const plant = getPlant(id);
  const db = plant && PLANT_DB[plant.plantId];
  const [sheet, setSheet] = useState(null);

  if (!plant || !db) {
    return (
      <div className="pt-screen flex flex-col items-start gap-4">
        <p className="text-body text-muted">That plant isn't in your garden any more.</p>
        <Button variant="secondary" icon="chevron-left" onClick={() => goBack("/plants")}>Back to plants</Button>
      </div>
    );
  }
  const bed = beds.find(b => b.id === plant.bedId);
  const health = currentHealth(plant);
  const hs = healthStatus(health);

  return (
    <div className="-mx-5 pb-[calc(120px+env(safe-area-inset-bottom))] md:mx-0 md:pt-6">
      {/* 1. Hero */}
      <div className="relative h-[240px] overflow-hidden md:rounded-card">
        <PlantImage photo={plant.photo} dim iconSize={112} />
        <IconButton icon="chevron-left" label="Back" round onClick={() => goBack("/plants")} className="absolute left-5 top-[calc(12px+env(safe-area-inset-top))] border-transparent md:top-4" />
      </div>

      <div className="flex flex-col gap-4 px-5 pt-5 md:px-0">
        {/* 2. Title block */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-soft text-[32px] font-normal leading-[1.05] tracking-[-0.02em]">{plant.nickname}</h1>
          <p className="text-body-sm text-muted">
            {plant.latin && <><span className="font-display italic">{plant.latin}</span> · </>}
            {db.name}
            {bed && <> · <a {...linkProps(`/beds/${bed.id}`)} className="underline-offset-4 hover:underline">{bed.name}</a></>}
            {" · planted "}{fmt(plant.plantedDate)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusChip accent={hs.accent} icon={hs.icon}>{hs.label} · <span className="font-mono">{health}%</span></StatusChip>
            {isReadyToPick(plant) && <StatusChip accent="ochre" icon="basket">Ready to pick</StatusChip>}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-4">
            <WateringCard plant={plant} />
            <FertilizerCard plant={plant} />
          </div>
          <div className="flex flex-col gap-4">
            <GrowthCard plant={plant} db={db} />
            <TipsCard db={db} />
          </div>
        </div>
        <ActivityCard plant={plant} />
        <Button variant="destructive" icon="trash" onClick={() => setSheet("delete")} className="self-start">Remove plant</Button>
      </div>

      {/* 5. Actions pinned bottom */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line-soft bg-ground">
        <div className="mx-auto flex max-w-[480px] gap-2.5 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 md:max-w-3xl">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setSheet("feed")}>Log feeding</Button>
          <Button size="lg" icon="droplet" className="flex-1" onClick={() => setSheet("water")}>Log watering</Button>
        </div>
      </div>

      {sheet === "water" && <LogWaterSheet plant={plant} onClose={() => setSheet(null)} />}
      {sheet === "feed" && <LogFeedSheet plant={plant} onClose={() => setSheet(null)} />}
      {sheet === "delete" && <DeleteSheet plant={plant} onClose={() => setSheet(null)} />}
    </div>
  );
}

function DeleteSheet({ plant, onClose }) {
  const { deletePlant, toast } = useGarden();
  return (
    <ConfirmSheet
      title={`Remove ${plant.nickname}?`}
      message="This permanently deletes its watering and feeding history."
      confirmLabel="Remove"
      onClose={onClose}
      onConfirm={() => { goBack("/plants"); deletePlant(plant.id); toast(`${plant.nickname} removed`, { icon: "trash", accent: "clay" }); }}
    />
  );
}

/* ───────────── 3. Watering ───────────── */
function WateringCard({ plant }) {
  const { setAutoWater } = useGarden();
  const status = waterStatus(plant);
  const every = waterInterval(plant);
  const auto = !!plant.autoWater?.enabled;
  const db = PLANT_DB[plant.plantId];

  // Last 7 days: filled = watered; dashed ring = next due (if within the strip)
  const today = startOfDay(new Date());
  const wateredDays = new Set((plant.logs || []).filter(l => logType(l) === "water").map(l => startOfDay(new Date(l.date)).getTime()));
  wateredDays.add(startOfDay(new Date(plant.lastWatered)).getTime());
  // Overdue → it's due today, so the dashed "next due" ring sits on today
  const nextDue = Math.max(startOfDay(addDays(new Date(plant.lastWatered), every)).getTime(), today.getTime());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 5)); // 5 days back … tomorrow

  return (
    <Card className="flex flex-col gap-3.5 px-[18px] py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-rain-deep">
          <Icon name="droplet" size={20} />
          <h2 className="text-base font-semibold text-ink">Watering</h2>
        </div>
        <StatusChip accent={status.accent} icon={status.icon}>{status.label}</StatusChip>
      </div>

      <ol className="grid grid-cols-7 gap-1.5" aria-label="Last 5 days, today and tomorrow">
        {days.map(d => {
          const t = d.getTime();
          const watered = wateredDays.has(t);
          const due = !watered && t === nextDue && !auto;
          const isToday = t === today.getTime();
          return (
            <li key={t} className="flex flex-col items-center gap-1.5">
              <span
                className={cn("size-[30px] rounded-full", watered ? "bg-rain" : due ? "border-2 border-dashed border-rain" : "border border-line")}
                aria-label={`${d.toLocaleDateString("en-US", { weekday: "long" })}: ${watered ? "watered" : due ? "next due" : "not watered"}`}
              />
              <span className={cn("font-mono text-[11px]", isToday ? "font-medium text-ink" : "text-muted")}>
                {d.toLocaleDateString("en-US", { weekday: "narrow" })}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex justify-between font-mono text-xs text-muted">
        <span>every {every} d{db.waterDays !== every && auto ? ` · rec. ${db.waterDays} d` : ""}</span>
        <span>last {daysBetween(new Date(plant.lastWatered), new Date()) === 0 ? "today" : `${daysBetween(new Date(plant.lastWatered), new Date())} d ago`}</span>
      </div>

      {/* Sprinkler (auto-watering) */}
      <div className="flex flex-col gap-3 border-t border-line-soft pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-row font-semibold">Sprinkler</div>
            <div className="text-caption text-muted">{auto ? "Waters automatically — no reminders" : "Let a sprinkler handle this plant"}</div>
          </div>
          <Switch label="Sprinkler" checked={auto} onChange={v => setAutoWater(plant.id, { enabled: v, frequencyDays: plant.autoWater?.frequencyDays || db.waterDays })} />
        </div>
        {auto && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-caption text-muted">Runs every</span>
            {[1, 2, 3, 7].map(d => (
              <FilterChip key={d} selected={every === d} onClick={() => setAutoWater(plant.id, { frequencyDays: d })}>
                {d === 1 ? "Daily" : d === 7 ? "Weekly" : `${d} days`}
              </FilterChip>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ───────────── 4. Fertilizer ───────────── */
function FertilizerCard({ plant }) {
  const { fertilizers } = useGarden();
  const fert = fertilizers.find(f => f.id === plant.fertId);
  const next = daysUntil(nextFeedDate(plant));
  return (
    <Card className="flex flex-col gap-3.5 px-[18px] py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-ochre-deep">
          <Icon name="fertilizer" size={20} />
          <h2 className="text-base font-semibold text-ink">Fertilizer</h2>
        </div>
        {next < 0 ? <StatusChip accent="clay" icon="alert">Feed overdue</StatusChip>
          : next === 0 ? <StatusChip accent="ochre" icon="fertilizer">Feed due</StatusChip>
          : <span className="font-mono text-xs text-muted">next in {next} d</span>}
      </div>
      {fert ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-row">{fert.name}</span>
            <span className="font-mono text-body-sm font-medium">{fert.npk.n}-{fert.npk.p}-{fert.npk.k}</span>
          </div>
          <NpkBar npk={fert.npk} />
        </div>
      ) : (
        <p className="text-body-sm text-muted">No product logged yet. Choose one when you log a feeding.</p>
      )}
      <p className="text-caption leading-[1.45] text-muted">
        {fert?.notes ? `${fert.notes} ` : ""}Every {FEED_INTERVAL_DAYS} d. Last fed {fmt(plant.lastFed)}.
      </p>
    </Card>
  );
}

/* ───────────── Growth ───────────── */
function GrowthCard({ plant, db }) {
  const age = Math.max(0, daysBetween(new Date(plant.plantedDate), new Date()));
  const stage = getStage(db, age);
  const perennial = db.daysToHarvest >= 365;
  const left = daysUntil(harvestDate(plant));
  let elapsed = 0;
  return (
    <Card className="flex flex-col gap-3.5 px-[18px] py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-moss">
          <Icon name="sprout" size={20} />
          <h2 className="text-base font-semibold text-ink">Growth</h2>
        </div>
        <span className="font-mono text-xs text-muted">day {age}</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-row font-semibold">{stage.name}</span>
          <Mono value={stageProgress(db, age)} unit="%" className="text-caption" />
        </div>
        <ProgressBar value={stageProgress(db, age)} accent="moss" label="Current stage" />
      </div>
      <ol className="flex flex-wrap gap-x-3 gap-y-1 text-caption">
        {db.stages.map(s => {
          const start = elapsed; elapsed += s.days;
          const state = age >= elapsed ? "done" : age >= start ? "now" : "later";
          return (
            <li key={s.name} className={cn("flex items-center gap-1", state === "now" ? "font-semibold text-ink" : "text-muted")}>
              {state === "done" && <Icon name="check" size={14} className="text-moss" />}
              {s.name}
            </li>
          );
        })}
      </ol>
      {!perennial && (
        <div className="flex flex-col gap-2 border-t border-line-soft pt-3.5">
          <ProgressBar value={(age / db.daysToHarvest) * 100} accent="ochre" label="Time to harvest" />
          <div className="flex justify-between font-mono text-xs text-muted">
            <span>{left > 0 ? `${left} d to harvest` : "ready"}</span><span>{fmt(harvestDate(plant))}</span>
          </div>
          <p className="text-caption text-muted">{db.harvest}</p>
        </div>
      )}
    </Card>
  );
}

/* ───────────── Care tips + companions ───────────── */
function TipsCard({ db }) {
  return (
    <Card className="flex flex-col gap-3 px-[18px] py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Care</h2>
        <span className="inline-flex items-center gap-1.5 text-caption text-muted"><Icon name="sun" size={16} className="text-ochre" />{db.sunNeeds}</span>
      </div>
      <ul className="flex flex-col gap-2 text-body-sm">
        {db.tips.slice(0, 4).map((t, i) => <li key={i} className="border-t border-line-soft pt-2 first:border-t-0 first:pt-0">{t}</li>)}
      </ul>
      {(db.companions?.length > 0 || db.avoid?.length > 0) && (
        <div className="flex flex-col gap-1.5 border-t border-line-soft pt-3 text-caption">
          {db.companions?.length > 0 && <p><span className="font-semibold text-moss-deep">Grows well with</span> <span className="text-muted">{db.companions.join(", ")}</span></p>}
          {db.avoid?.length > 0 && <p><span className="font-semibold text-clay-deep">Keep away from</span> <span className="text-muted">{db.avoid.join(", ")}</span></p>}
        </div>
      )}
    </Card>
  );
}

/* ───────────── Activity log ───────────── */
const QUICK_LOGS = ["Pruned", "Treated for pests", "Repotted", "Measured growth"];
const LOG_ICON = { water: ["droplet", "text-rain"], feed: ["fertilizer", "text-ochre"], harvest: ["basket", "text-ochre"], note: ["note", "text-muted"] };

function ActivityCard({ plant }) {
  const { logNote, toast } = useGarden();
  const [text, setText] = useState("");
  const [showAll, setShowAll] = useState(false);
  const logs = plant.logs || [];
  const add = t => { if (!t.trim()) return; logNote(plant.id, t.trim().replace(/\.?$/, ".")); setText(""); toast("Note added", { icon: "note" }); };

  return (
    <Card className="flex flex-col gap-3.5 px-[18px] py-4">
      <h2 className="text-base font-semibold">Activity</h2>
      {plant.notes && <p className="rounded-tile bg-sunken px-4 py-3 text-body-sm">{plant.notes}</p>}
      <div className="flex flex-wrap gap-2">
        {QUICK_LOGS.map(q => <FilterChip key={q} onClick={() => add(q)}>{q}</FilterChip>)}
      </div>
      <form className="flex items-end gap-2" onSubmit={e => { e.preventDefault(); add(text); }}>
        <TextField label="Add a note" className="flex-1" value={text} onChange={e => setText(e.target.value)} placeholder="New leaves on the east side" />
        <Button type="submit" variant="secondary" disabled={!text.trim()}>Add</Button>
      </form>
      {logs.length > 0 && (
        <ol className="flex flex-col">
          {(showAll ? logs : logs.slice(0, 6)).map((l, i) => {
            const [icon, colour] = LOG_ICON[logType(l)] || LOG_ICON.note;
            return (
              <li key={`${l.date}-${i}`} className="flex gap-3 border-t border-line-soft py-2.5">
                <Icon name={icon} size={18} className={cn("mt-px shrink-0", colour)} />
                <span className="flex-1 text-body-sm">{logText(l)}</span>
                <span className="shrink-0 font-mono text-xs text-muted">{fmt(l.date)}</span>
              </li>
            );
          })}
        </ol>
      )}
      {logs.length > 6 && <Button variant="text" className="self-start" onClick={() => setShowAll(v => !v)}>{showAll ? "Show less" : `Show all ${logs.length}`}</Button>}
    </Card>
  );
}
