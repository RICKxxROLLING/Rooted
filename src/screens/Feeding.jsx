// Feeding — designed from the system (spec §5 is an outline only; needs design review).
import { useMemo, useState } from "react";
import { useGarden } from "../lib/store";
import { daysUntil, tasksUntil } from "../lib/tasks";
import { Icon } from "../components/Icon";
import {
  Button, Card, EmptyState, Eyebrow, IconButton, NpkBar, ScreenTitle, SectionHeader, SegmentedControl, TaskRow, TextLink,
} from "../components/ui";
import { AddProductSheet, ConfirmSheet } from "../components/sheets";

const RANGES = { week: 7, month: 30, season: 90 };

export default function Feeding() {
  const { plants, beds, fertilizers, logFeed, restorePlant, deleteFertilizer, toast } = useGarden();
  const [range, setRange] = useState("week");
  const [done, setDone] = useState({});
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);

  // Feedings due in the range, grouped by date (overdue first). Snapshotted per range
  // so checked rows stay in place.
  const groups = useMemo(() => {
    const until = new Date(Date.now() + (RANGES[range] - 1) * 864e5);
    const tasks = tasksUntil(plants, beds, fertilizers, until).filter(t => t.kind === "feed");
    const map = new Map();
    for (const t of tasks) {
      const d = daysUntil(t.due);
      const key = t.overdue ? "Overdue" : d === 0 ? "Today" : d === 1 ? "Tomorrow"
        : t.due.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return [...map];
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(t, checked) {
    if (checked) {
      const prev = logFeed(t.plantId, plants.find(p => p.id === t.plantId)?.fertId);
      setDone(d => ({ ...d, [t.id]: prev }));
    } else {
      if (done[t.id]) restorePlant(done[t.id]);
      setDone(d => { const n = { ...d }; delete n[t.id]; return n; });
    }
  }

  return (
    <div className="pt-screen pb-tabbar flex flex-col gap-[22px]">
      <header className="flex flex-col gap-1.5">
        <Eyebrow>Feeding</Eyebrow>
        <ScreenTitle>What's hungry.</ScreenTitle>
      </header>

      <div className="flex flex-col gap-[22px] md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start md:gap-6">
        <section className="flex flex-col gap-4" aria-label="Feeding schedule">
          <SegmentedControl label="Range" options={[["week", "Week"], ["month", "Month"], ["season", "Season"]]} value={range} onChange={v => { setRange(v); setDone({}); }} />
          {plants.length === 0 ? (
            <EmptyState icon="fertilizer" title="Nothing to feed yet" detail="Plants you add show up here on a 14-day feeding cycle." />
          ) : groups.length === 0 ? (
            <EmptyState icon="check" title="No feedings due" detail={`Nothing due in the next ${RANGES[range]} days.`} />
          ) : groups.map(([label, tasks]) => (
            <div key={label} className="flex flex-col gap-2">
              <Eyebrow className={label === "Overdue" ? "text-clay-deep" : undefined}>{label}</Eyebrow>
              <Card className="overflow-hidden">
                {tasks.map(t => (
                  <TaskRow key={t.id} icon="fertilizer" accent={t.overdue ? "clay" : "ochre"} title={t.title} detail={t.detail}
                    done={!!done[t.id]} onToggle={v => toggle(t, v)} />
                ))}
              </Card>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-2.5" aria-labelledby="products-h">
          <SectionHeader id="products-h" title="Products" action={<TextLink onClick={() => setAdding(true)}>Add</TextLink>} />
          {fertilizers.length === 0 ? (
            <EmptyState icon="fertilizer" title="No products yet" detail="Scan a barcode or enter the N-P-K from the label." action={<Button icon="barcode" onClick={() => setAdding(true)}>Add product</Button>} />
          ) : fertilizers.map(f => (
            <Card key={f.id} className="flex flex-col gap-3 px-[18px] py-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-icon-tile bg-ochre-tint text-ochre-deep"><Icon name="fertilizer" size={20} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-row font-semibold">{f.name}</span>
                    <span className="shrink-0 font-mono text-body-sm font-medium">{f.npk.n}-{f.npk.p}-{f.npk.k}</span>
                  </div>
                  <div className="truncate text-caption text-muted">{[f.brand, f.type].filter(Boolean).join(" · ")}</div>
                </div>
                <IconButton icon="trash" label={`Delete ${f.name}`} className="-mr-2 -mt-1.5 border-transparent bg-transparent text-muted" onClick={() => setRemoving(f)} />
              </div>
              <NpkBar npk={f.npk} />
              {f.notes && <p className="text-caption text-muted">{f.notes}</p>}
            </Card>
          ))}
        </section>
      </div>

      {adding && <AddProductSheet onClose={() => setAdding(false)} />}
      {removing && (
        <ConfirmSheet
          title={`Delete ${removing.name}?`}
          message="It's removed from your products. Past feedings keep their history."
          confirmLabel="Delete"
          onClose={() => setRemoving(null)}
          onConfirm={() => { deleteFertilizer(removing.id); toast(`${removing.name} deleted`, { icon: "trash", accent: "clay" }); }}
        />
      )}
    </div>
  );
}
