// Today — what the garden needs from you today (spec §1).
import { useMemo, useState } from "react";
import { useGarden } from "../lib/store";
import { PLANT_DB } from "../lib/plantDb";
import { NUMBER_WORDS, daysUntil, nextWaterDate, todaysTasks, waterStatus } from "../lib/tasks";
import { navigate, linkProps } from "../lib/router";
import { Icon } from "../components/Icon";
import { Card, EmptyState, Eyebrow, Fab, IconButton, ProgressBar, ScreenTitle, SectionHeader, TaskRow, TextLink, Button } from "../components/ui";
import { SettingsSheet, WeekSheet } from "../components/sheets";

function greeting(h = new Date().getHours()) {
  return h < 12 ? "Good morning." : h < 18 ? "Good afternoon." : "Good evening.";
}

export default function Today() {
  const { plants, beds, fertilizers, logWater, logFeed, logHarvest, restorePlant } = useGarden();
  // Snapshot the list on arrival so checked rows stay put (don't reorder under the finger)
  const [tasks] = useState(() => todaysTasks(plants, beds, fertilizers));
  const [done, setDone] = useState({}); // task id → entry before the action (for undo)
  const [sheet, setSheet] = useState(null);

  function toggle(task, checked) {
    if (checked) {
      const prev = task.kind === "water" ? logWater(task.plantId)
        : task.kind === "feed" ? logFeed(task.plantId, plants.find(p => p.id === task.plantId)?.fertId)
        : logHarvest(task.plantId);
      setDone(d => ({ ...d, [task.id]: prev }));
    } else {
      if (done[task.id]) restorePlant(done[task.id]);
      setDone(d => { const n = { ...d }; delete n[task.id]; return n; });
    }
  }

  const remaining = tasks.length - Object.keys(done).length;
  const countLine = remaining === 0
    ? (tasks.length ? "All done for today." : "Nothing due today.")
    : `${NUMBER_WORDS[remaining] || remaining} thing${remaining === 1 ? "" : "s"} today.`;
  const dateLine = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).replace(",", " ·");

  return (
    <div className="pt-screen pb-tabbar">
      <div className="flex flex-col gap-[22px]">
        {/* 1. Header */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <Eyebrow>{dateLine}</Eyebrow>
            <ScreenTitle>{greeting()}<br />{countLine}</ScreenTitle>
          </div>
          <div className="flex flex-col gap-2">
            <IconButton icon="calendar" label="This week" onClick={() => setSheet("week")} />
            <IconButton icon="settings" label="Settings" onClick={() => setSheet("settings")} />
          </div>
        </header>

        {/* 2. Conditions banner (from watering data — no weather source yet) */}
        <ConditionsBanner plants={plants} />

        <div className="flex flex-col gap-[22px] md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-start md:gap-6">
          {/* 3. Today's tasks */}
          <section className="flex flex-col gap-2.5" aria-labelledby="tasks-h">
            <SectionHeader id="tasks-h" title="Today's tasks" action={<TextLink onClick={() => setSheet("week")}>See week</TextLink>} />
            {tasks.length ? (
              <Card className="overflow-hidden">
                {tasks.map(t => (
                  <TaskRow
                    key={t.id}
                    title={t.title}
                    detail={t.overdue ? `${t.detail} · overdue ${-daysUntil(t.due)} d` : t.detail}
                    time="—"
                    accent={t.overdue ? "clay" : t.accent}
                    done={!!done[t.id]}
                    onToggle={v => toggle(t, v)}
                  />
                ))}
              </Card>
            ) : plants.length ? (
              <EmptyState icon="check" title="Nothing due today" detail="Every plant is watered and fed. Check the week ahead for what's next." />
            ) : (
              <EmptyState icon="sprout" title="No plants yet" detail="Identify a plant with your camera or add one by name." action={<Button icon="scan" onClick={() => navigate("/identify")}>Identify a plant</Button>} />
            )}
          </section>

          {/* 4. Your beds */}
          <section className="flex flex-col gap-2.5" aria-labelledby="beds-h">
            <SectionHeader id="beds-h" title="Your beds" action={beds.length > 0 && <TextLink href="/beds">All beds</TextLink>} />
            <div className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
              {beds.map(b => <BedMiniCard key={b.id} bed={b} plants={plants} />)}
              <a {...linkProps("/beds?new=1")} className="flex w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-line-dashed p-3.5 text-caption font-semibold text-muted md:w-auto md:min-h-[128px]">
                <Icon name="plus" size={20} />
                New bed
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* 5. Identify FAB — sits above the tab bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(112px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[480px] justify-end px-5 md:max-w-5xl">
        <Fab icon="scan" className="pointer-events-auto" onClick={() => navigate("/identify")}>Identify</Fab>
      </div>

      {sheet === "week" && <WeekSheet onClose={() => setSheet(null)} />}
      {sheet === "settings" && <SettingsSheet onClose={() => setSheet(null)} />}
    </div>
  );
}

function ConditionsBanner({ plants }) {
  const manual = plants.filter(p => !p.autoWater?.enabled && PLANT_DB[p.plantId]);
  if (!plants.length) return null;
  const due = manual.filter(p => daysUntil(nextWaterDate(p)) <= 0);
  const overdue = due.filter(p => daysUntil(nextWaterDate(p)) < 0);
  const upcoming = [...manual].sort((a, b) => nextWaterDate(a) - nextWaterDate(b))[0];
  const sprinklers = plants.length - manual.length;

  let title, detail;
  if (due.length) {
    title = `${NUMBER_WORDS[due.length] || due.length} plant${due.length === 1 ? " needs" : "s need"} water`;
    detail = [due.slice(0, 3).map(p => p.nickname).join(", ") + (due.length > 3 ? ` +${due.length - 3}` : ""),
      overdue.length && `${overdue.length} overdue`].filter(Boolean).join(" · ");
  } else {
    title = "Watering is on track";
    detail = upcoming
      ? `Next: ${upcoming.nickname} ${daysUntil(nextWaterDate(upcoming)) === 1 ? "tomorrow" : nextWaterDate(upcoming).toLocaleDateString("en-US", { weekday: "long" })}`
      : "Sprinklers are handling everything";
  }
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] bg-rain-tint px-[18px] py-4 text-rain-deep" role="status">
      <Icon name="droplet" size={28} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-row font-semibold">{title}</div>
        <div className="truncate text-caption">{detail}</div>
      </div>
      {sprinklers > 0 && (
        <div className="shrink-0 text-right font-mono text-caption">{sprinklers}<br /><span className="text-[11px]">auto</span></div>
      )}
    </div>
  );
}

function BedMiniCard({ bed, plants }) {
  const crops = [...new Set(Object.values(bed.cells).filter(v => !v.startsWith("@")).map(id => PLANT_DB[id]?.name).filter(Boolean))];
  const inBed = plants.filter(p => p.bedId === bed.id);
  const watered = inBed.filter(p => waterStatus(p).key !== "overdue" && waterStatus(p).key !== "today").length;
  return (
    <a {...linkProps(`/beds/${bed.id}`)} className="flex w-40 shrink-0 flex-col gap-2 rounded-[20px] border border-line bg-surface p-3.5 md:w-auto">
      <div className="truncate font-display text-card-title font-medium">{bed.name}</div>
      <div className="line-clamp-1 text-caption text-muted">{crops.length ? crops.slice(0, 3).join(", ") : "Nothing planned yet"}</div>
      {inBed.length > 0 ? (
        <>
          <ProgressBar value={(watered / inBed.length) * 100} accent="rain" label={`${bed.name} watering`} />
          <div className="font-mono text-xs text-rain-deep">{watered} of {inBed.length} watered</div>
        </>
      ) : (
        <div className="font-mono text-xs text-muted">{bed.height} × {bed.width} ft</div>
      )}
    </a>
  );
}
