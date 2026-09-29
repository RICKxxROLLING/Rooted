// /design — every primitive in light and dark, side by side. Visual check against
// rooted-design-handoff/reference/Components.dc.html and DarkTokens.dc.html. Not linked in the UI.
import { useState } from "react";
import { Icon, ICON_NAMES } from "../components/Icon";
import {
  Button, Card, Eyebrow, Fab, FilterChip, IconButton, Latin, NpkBar, PlantImage, ProgressBar, ReadingTile, ScreenTitle,
  SectionHeader, SegmentedControl, StatusChip, Switch, TaskRow, TextField, cn,
} from "../components/ui";

const SWATCHES = ["ground", "surface", "raised", "sunken", "line", "line-strong", "ink", "muted",
  "moss", "moss-tint", "moss-deep", "rain", "rain-tint", "rain-deep", "ochre", "ochre-tint", "ochre-deep", "clay", "clay-tint", "clay-deep", "wood", "wood-gap"];

function Panel({ theme }) {
  const [seg, setSeg] = useState("Week");
  const [chip, setChip] = useState(true);
  const [done, setDone] = useState(false);
  const [sw, setSw] = useState(true);
  return (
    <section className={cn(theme === "dark" ? "theme-dark" : "theme-light", "flex flex-col gap-6 rounded-sheet bg-ground p-5 text-ink")}>
      <Eyebrow>{theme}</Eyebrow>
      <div className="grid grid-cols-6 gap-2">
        {SWATCHES.map(s => (
          <div key={s} className="flex flex-col gap-1">
            <div className="h-10 rounded-chip border border-line" style={{ background: `var(--r-${s})` }} />
            <span className="truncate font-mono text-[10px] text-muted">{s}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <ScreenTitle>Good morning.<br />Four things today.</ScreenTitle>
        <p className="font-display text-[26px]">Sweet basil <span className="text-base text-muted"><Latin>Ocimum basilicum</Latin></span></p>
        <p className="text-body">Instrument Sans body · <span className="font-mono">72<span className="text-muted">°F</span></span></p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button>Primary</Button><Button variant="secondary">Secondary</Button>
        <Button variant="text">Text</Button><Button variant="destructive" icon="trash">Remove</Button>
        <Fab icon="scan">Identify</Fab><Fab icon="plus" label="Add" /><IconButton icon="calendar" label="Week" /><IconButton icon="chevron-left" label="Back" round />
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusChip accent="moss" icon="sprout">Thriving</StatusChip><StatusChip accent="rain" icon="droplet">Due tomorrow</StatusChip>
        <StatusChip accent="ochre" icon="basket">Ready to pick</StatusChip><StatusChip accent="clay" icon="frost">Frost tonight</StatusChip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip selected={chip} onClick={() => setChip(!chip)}>Bed 2</FilterChip><FilterChip>Bed 3</FilterChip><Switch label="Demo" checked={sw} onChange={setSw} />
      </div>
      <TextField label="Amount" unit="gal" mono defaultValue="0.5" />
      <SegmentedControl label="Range" options={["Week", "Month", "Season"]} value={seg} onChange={setSeg} />
      <Card className="overflow-hidden">
        <TaskRow title="Water tomatoes" detail="Bed 2 · every 2 d" time="7:00" accent="rain" done={done} onToggle={setDone} />
        <TaskRow title="Feed peppers" detail="Bed 3 · fish emulsion 1 tbsp/gal" time="—" accent="ochre" icon="fertilizer" />
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <ReadingTile icon="droplet" accent="rain" value="31" unit="%" caption="Soil moisture" />
        <ReadingTile icon="sun" accent="ochre" value="7.5" unit=" h" caption="Sun today" />
      </div>
      <div className="flex flex-col gap-3">
        <SectionHeader title="Progress" />
        <ProgressBar value={60} accent="moss" label="growth" /><ProgressBar value={28} accent="rain" label="moisture" /><ProgressBar value={88} accent="ochre" label="harvest" />
        <NpkBar npk={{ n: 5, p: 10, k: 5 }} />
      </div>
      <div className="h-24 overflow-hidden rounded-card"><PlantImage iconSize={56} /></div>
      <div className="flex flex-wrap gap-3 text-ink">
        {ICON_NAMES.map(n => <span key={n} title={n}><Icon name={n} size={24} /></span>)}
      </div>
    </section>
  );
}

export default function Design() {
  return (
    <div className="py-8">
      <h1 className="mb-6 font-display text-title">Rooted · components</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel theme="light" />
        <Panel theme="dark" />
      </div>
    </div>
  );
}
