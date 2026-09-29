// Derives garden tasks (water / feed / harvest) from plants' schedules.
import { PLANT_DB } from "./plantDb";
import { addDays, daysBetween, startOfDay } from "./garden";

export const FEED_INTERVAL_DAYS = 14;

export const waterInterval = p => p.autoWater?.enabled
  ? p.autoWater.frequencyDays || PLANT_DB[p.plantId]?.waterDays || 2
  : PLANT_DB[p.plantId]?.waterDays || 2;

export const nextWaterDate = p => startOfDay(addDays(new Date(p.lastWatered), waterInterval(p)));
export const nextFeedDate = p => startOfDay(addDays(new Date(p.lastFed), FEED_INTERVAL_DAYS));
export const harvestDate = p => startOfDay(addDays(new Date(p.plantedDate), PLANT_DB[p.plantId]?.daysToHarvest || 90));

/** Days until a date (negative = overdue) */
export const daysUntil = date => daysBetween(new Date(), date);

/** "Ready to pick" when harvest day has arrived and it wasn't picked in the last week */
export function isReadyToPick(p) {
  if (daysUntil(harvestDate(p)) > 0) return false;
  return !p.harvestedAt || daysBetween(new Date(p.harvestedAt), new Date()) > 7;
}

export function waterStatus(p) {
  if (p.autoWater?.enabled) return { key: "auto", label: "Sprinkler", accent: "rain", icon: "droplet" };
  const d = daysUntil(nextWaterDate(p));
  if (d < 0) return { key: "overdue", label: "Overdue", accent: "clay", icon: "alert" };
  if (d === 0) return { key: "today", label: "Water today", accent: "rain", icon: "droplet" };
  if (d === 1) return { key: "tomorrow", label: "Due tomorrow", accent: "rain", icon: "droplet" };
  return { key: "ok", label: `Due in ${d} d`, accent: "rain", icon: "droplet" };
}

const bedName = (p, beds) => beds.find(b => b.id === p.bedId)?.name;
const fertLine = (p, fertilizers) => {
  const f = fertilizers.find(x => x.id === p.fertId);
  return f ? `${f.name} ${f.npk.n}-${f.npk.p}-${f.npk.k}` : "any balanced feed";
};

/**
 * Tasks due on or before `until` (a Date), each tagged with its due date.
 * Recurring water/feed tasks repeat within the window (for week/season views).
 */
export function tasksUntil(plants, beds, fertilizers, until, { from = startOfDay(new Date()) } = {}) {
  const tasks = [];
  const end = startOfDay(until);
  for (const p of plants) {
    const db = PLANT_DB[p.plantId];
    if (!db) continue;
    const where = bedName(p, beds) || db.name;

    if (!p.autoWater?.enabled) {
      const every = waterInterval(p);
      for (let due = nextWaterDate(p), i = 0; due <= end && i < 60; due = addDays(due, every), i++) {
        if (i > 0 && due < from) continue; // only the first missed watering counts as overdue
        tasks.push({
          id: `water:${p.id}:${due.toISOString()}`, kind: "water", plantId: p.id, due,
          overdue: due < from, title: `Water ${p.nickname}`, detail: `${where} · every ${every} d`, accent: "rain",
        });
      }
    }

    for (let due = nextFeedDate(p), i = 0; due <= end && i < 30; due = addDays(due, FEED_INTERVAL_DAYS), i++) {
      if (i > 0 && due < from) continue;
      tasks.push({
        id: `feed:${p.id}:${due.toISOString()}`, kind: "feed", plantId: p.id, due, overdue: due < from,
        title: `Feed ${p.nickname}`, detail: `${where} · ${fertLine(p, fertilizers)}`, accent: "ochre",
      });
    }

    const pick = harvestDate(p);
    if (pick <= end && (isReadyToPick(p) || pick >= from)) {
      tasks.push({
        id: `harvest:${p.id}`, kind: "harvest", plantId: p.id, due: pick < from ? from : pick, overdue: false,
        title: `Pick ${p.nickname}`, detail: `${where} · ready to harvest`, accent: "ochre",
      });
    }
  }
  const order = { water: 0, feed: 1, harvest: 2 };
  return tasks.sort((a, b) => (a.overdue === b.overdue ? 0 : a.overdue ? -1 : 1) || a.due - b.due || order[a.kind] - order[b.kind]);
}

/** Today's to-do list (includes anything overdue) */
export const todaysTasks = (plants, beds, fertilizers) =>
  tasksUntil(plants, beds, fertilizers, new Date()).filter(t => t.kind !== "harvest" || isReadyToPick(plantById(plants, t.plantId)));

const plantById = (plants, id) => plants.find(p => p.id === id);

export const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export function season(date = new Date()) {
  const m = date.getMonth();
  return m <= 1 || m === 11 ? "Winter" : m <= 4 ? "Spring" : m <= 7 ? "Summer" : "Fall";
}
