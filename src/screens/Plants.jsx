// Plants — every tracked plant as a plant card (spec: components.md "Plant card").
import { useGarden } from "../lib/store";
import { PLANT_DB } from "../lib/plantDb";
import { currentHealth, daysBetween, healthStatus } from "../lib/garden";
import { daysUntil, harvestDate, isReadyToPick, waterStatus } from "../lib/tasks";
import { linkProps, navigate } from "../lib/router";
import { Button, EmptyState, Eyebrow, Fab, PlantImage, ProgressBar, ScreenTitle, StatusChip } from "../components/ui";

export default function Plants() {
  const { plants, beds } = useGarden();
  return (
    <div className="pt-screen pb-tabbar">
      <header className="mb-[22px] flex flex-col gap-1.5">
        <Eyebrow>{plants.length} {plants.length === 1 ? "plant" : "plants"}</Eyebrow>
        <ScreenTitle>Your plants</ScreenTitle>
      </header>

      {plants.length === 0 ? (
        <EmptyState icon="sprout" title="No plants yet" detail="Identify one with your camera, or search by name." action={<Button icon="scan" onClick={() => navigate("/identify")}>Identify a plant</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plants.map(p => <PlantCard key={p.id} plant={p} bed={beds.find(b => b.id === p.bedId)} />)}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(112px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[480px] justify-end px-5 md:max-w-5xl">
        <Fab icon="plus" className="pointer-events-auto" onClick={() => navigate("/identify")}>Add plant</Fab>
      </div>
    </div>
  );
}

function PlantCard({ plant, bed }) {
  const db = PLANT_DB[plant.plantId];
  if (!db) return null;
  const age = Math.max(0, daysBetween(new Date(plant.plantedDate), new Date()));
  const left = daysUntil(harvestDate(plant));
  const ready = isReadyToPick(plant);
  const water = waterStatus(plant);
  const health = healthStatus(currentHealth(plant));
  const perennial = db.daysToHarvest >= 365;

  return (
    <a {...linkProps(`/plants/${plant.id}`)} className="group overflow-hidden rounded-card border border-line bg-surface transition-transform duration-150 active:scale-[0.99]">
      <div className="relative h-[200px]">
        <PlantImage photo={plant.photo} dim iconSize={96} />
        <span className="absolute bottom-3 left-3 inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 font-mono text-caption">
          {ready ? <span className="font-sans font-semibold text-ochre-deep">Ready to pick</span>
            : perennial ? <span className="font-sans font-semibold text-muted">Perennial</span>
            : <>{left}<span className="text-muted">&nbsp;d to harvest</span></>}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-[18px]">
        <div className="flex flex-col gap-1">
          <h2 className="truncate font-display text-[26px] font-normal leading-tight">{plant.nickname}</h2>
          <p className="truncate text-body-sm text-muted">
            {plant.latin ? <span className="font-display italic">{plant.latin}</span> : db.name}
            {bed && ` · ${bed.name}`}
            {plant.idScore != null && <span className="text-moss-deep"> · ID {Math.round(plant.idScore * 100)}% match</span>}
          </p>
        </div>
        {(water.key === "overdue" || water.key === "today" || health.accent !== "moss") && (
          <div className="flex flex-wrap gap-2">
            {(water.key === "overdue" || water.key === "today") && <StatusChip accent={water.accent} icon={water.icon}>{water.key === "overdue" ? "Needs water" : water.label}</StatusChip>}
            {health.accent !== "moss" && <StatusChip accent={health.accent} icon={health.icon}>{health.label}</StatusChip>}
          </div>
        )}
        {!perennial && (
          <div className="flex flex-col gap-2">
            <ProgressBar value={(age / db.daysToHarvest) * 100} accent="ochre" label={`${plant.nickname} growth to harvest`} />
            <div className="flex justify-between font-mono text-xs text-muted">
              <span>Day {age}</span><span>{db.daysToHarvest} d to harvest</span>
            </div>
          </div>
        )}
      </div>
    </a>
  );
}
