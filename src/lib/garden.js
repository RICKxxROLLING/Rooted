import { PLANT_DB } from "./plantDb";

export const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── Helpers ─────────────────────────────────────────────────────────────────
export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
// Whole calendar days from a to b (local time; round() absorbs DST shifts)
export function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
}
// "YYYY-MM-DD" for <input type="date"> in local time (toISOString would give the UTC date)
export function toDateInput(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
/** "Sep 28" — adds the year only when it isn't this year */
export function fmt(date) {
  const d = new Date(date);
  const opts = { month: "short", day: "numeric" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString("en-US", opts);
}
export function getStage(plant, daysSincePlanting) {
  let elapsed = 0;
  for (const s of plant.stages) {
    elapsed += s.days;
    if (daysSincePlanting < elapsed) return s;
  }
  return plant.stages[plant.stages.length - 1];
}
export function stageProgress(plant, daysSincePlanting) {
  let elapsed = 0;
  for (const s of plant.stages) {
    const prev = elapsed;
    elapsed += s.days;
    if (daysSincePlanting < elapsed) {
      return Math.min(100, Math.round(((daysSincePlanting - prev) / s.days) * 100));
    }
  }
  return 100;
}
export function overallProgress(plant, daysSincePlanting) {
  return Math.max(0, Math.min(100, Math.round((daysSincePlanting / plant.daysToHarvest) * 100)));
}
export function urgency(daysAgo, interval) {
  if (daysAgo >= interval) return "overdue";
  if (daysAgo >= interval - 1) return "due";
  return "ok";
}
export function randomId() {
  return Math.random().toString(36).slice(2, 9);
}


// ── Custom plant lookup ───────────────────────────────────────────────────────
export function guessEmoji(name) {
  const n = name.toLowerCase();
  if (/rose|tulip|daisy|orchid|lily|poppy|dahlia|marigold|pansy|peony/.test(n)) return "🌸";
  if (/sunflower/.test(n)) return "🌻";
  if (/lavender|violet|wisteria|bluebell/.test(n)) return "💜";
  if (/tomato/.test(n)) return "🍅";
  if (/pepper|chilli/.test(n)) return "🌶️";
  if (/carrot/.test(n)) return "🥕";
  if (/lettuce|spinach|kale|chard/.test(n)) return "🥬";
  if (/cucumber/.test(n)) return "🥒";
  if (/pea|bean/.test(n)) return "🫛";
  if (/strawberry/.test(n)) return "🍓";
  if (/raspberry|blackberry|blueberry|currant/.test(n)) return "🫐";
  if (/apple/.test(n)) return "🍎";
  if (/pear/.test(n)) return "🍐";
  if (/lemon|lime|citrus/.test(n)) return "🍋";
  if (/orange/.test(n)) return "🍊";
  if (/grape/.test(n)) return "🍇";
  if (/melon|watermelon/.test(n)) return "🍈";
  if (/corn|maize/.test(n)) return "🌽";
  if (/potato|sweet potato/.test(n)) return "🥔";
  if (/onion|garlic|leek/.test(n)) return "🧅";
  if (/mushroom/.test(n)) return "🍄";
  if (/herb|basil|mint|sage|thyme|rosemary|oregano|parsley/.test(n)) return "🌿";
  if (/tree|oak|pine|maple/.test(n)) return "🌳";
  if (/cactus|succulent/.test(n)) return "🌵";
  return "🌱";
}

export function guessCategory(name, description = "") {
  const t = (name + " " + description).toLowerCase();
  if (/herb|mint|basil|thyme|sage|rosemary|oregano|parsley|chive|dill|coriander/.test(t)) return "Herb";
  // Checked before fruit trees so e.g. "cherry tomato" isn't a Tree Fruit
  if (/tomato|pepper|chilli|cucumber|squash|zucchini|courgette|pumpkin|eggplant|aubergine|okra/.test(t)) return "Vegetable";
  if (/rose|tulip|daisy|marigold|zinnia|cosmos|pansy|petunia|sunflower|dahlia|lily|iris|peony|lavender/.test(t)) return "Flower/Perennial";
  if (/lettuce|spinach|kale|chard|rocket|arugula|bok choy|pak choi|endive|watercress/.test(t)) return "Leafy Green";
  if (/carrot|parsnip|beetroot|beet|radish|turnip|potato|sweet potato|yam/.test(t)) return "Root Vegetable";
  if (/broccoli|cauliflower|cabbage|brussel|kohlrabi/.test(t)) return "Brassica";
  if (/strawberry|raspberry|blackberry|blueberry|gooseberry|currant/.test(t)) return "Berry";
  if (/apple|pear|plum|cherry|peach|nectarine|apricot|lemon|lime|orange/.test(t)) return "Tree Fruit";
  if (/shrub|bush|hydrangea|rhododendron|camellia|viburnum/.test(t)) return "Shrub";
  return "Vegetable";
}

export function buildStagesFromDays(days) {
  if (days <= 45) return [
    { name: "Germination", days: Math.round(days * 0.2), icon: "🌱" },
    { name: "Growth", days: Math.round(days * 0.4), icon: "🌿" },
    { name: "Harvest", days: Math.round(days * 0.4), icon: "🌾" },
  ];
  if (days >= 300) return [
    { name: "Establishing", days: Math.round(days * 0.3), icon: "🌱" },
    { name: "Vegetative", days: Math.round(days * 0.35), icon: "🌿" },
    { name: "Flowering", days: Math.round(days * 0.2), icon: "🌸" },
    { name: "Mature", days: Math.round(days * 0.15), icon: "🌾" },
  ];
  return [
    { name: "Germination", days: Math.round(days * 0.15), icon: "🌱" },
    { name: "Vegetative", days: Math.round(days * 0.35), icon: "🌿" },
    { name: "Flowering", days: Math.round(days * 0.25), icon: "🌸" },
    { name: "Harvest", days: Math.round(days * 0.25), icon: "🌾" },
  ];
}


export function buildFallbackPlant(name) {
  const category = guessCategory(name);
  const days = category === "Tree Fruit" ? 365 : category === "Shrub" ? 365 : category === "Flower/Perennial" ? 365 : 90;
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    emoji: guessEmoji(name),
    category,
    daysToHarvest: days,
    waterDays: 2,
    sunNeeds: "Full Sun",
    stages: buildStagesFromDays(days),
    tips: [
      `Water ${name} at the base regularly, keeping soil evenly moist but not waterlogged.`,
      `Feed with a balanced general-purpose fertiliser every 2–3 weeks during active growth.`,
      `Ensure ${name} receives adequate sunlight — most garden plants prefer at least 6 hours daily.`,
      `Monitor for pests and disease weekly; treat early with appropriate organic or chemical controls.`,
      `Mulch around the base to retain moisture, regulate soil temperature, and suppress weeds.`,
    ],
    harvest: `Harvest ${name} when it reaches its mature size and shows signs of ripeness. Regular harvesting encourages continued production.`,
    companions: ["Marigold", "Nasturtium", "Comfrey"],
    avoid: ["Fennel"],
    source: "Generated",
  };
}

/** Search Perenual; returns { plant, source, options, reason? } and never throws */

// ── NPK / fertilizer helpers ─────────────────────────────────────────────────

/** Ideal N-P-K ratio (as percentages of total) per plant category */
export const NPK_IDEAL = {
  "Vegetable":        { n: 34, p: 33, k: 33 }, // balanced
  "Leafy Green":      { n: 60, p: 20, k: 20 }, // nitrogen-heavy (leaf growth)
  "Brassica":         { n: 50, p: 25, k: 25 },
  "Herb":             { n: 34, p: 33, k: 33 }, // balanced, light feed
  "Herb/Perennial":   { n: 34, p: 33, k: 33 },
  "Root Vegetable":   { n: 20, p: 40, k: 40 }, // low N, high P/K (root dev)
  "Fruit":            { n: 25, p: 35, k: 40 }, // high K for fruiting
  "Berry":            { n: 25, p: 35, k: 40 },
  "Tree Fruit":       { n: 34, p: 33, k: 33 },
  "Citrus":           { n: 34, p: 33, k: 33 },
  "Flower/Annual":    { n: 20, p: 60, k: 20 }, // high P for blooms
  "Flower/Perennial": { n: 25, p: 45, k: 30 },
  "Bulb":             { n: 15, p: 55, k: 30 }, // P for bulb development
  "Shrub":            { n: 40, p: 30, k: 30 },
  "Climber":          { n: 34, p: 33, k: 33 },
  "Exotic":           { n: 34, p: 33, k: 33 },
};

export const FERT_TYPES = ["Liquid", "Granular", "Slow-release", "Organic", "Powder", "Spike"];

/** Score 0-100: how well npk {n,p,k} matches a plant category's ideal */
export function calcNPKScore(category, npk) {
  const ideal = NPK_IDEAL[category] || NPK_IDEAL["Vegetable"];
  const total = (npk.n || 0) + (npk.p || 0) + (npk.k || 0);
  if (total === 0) return 0;
  const ap = { n: npk.n/total*100, p: npk.p/total*100, k: npk.k/total*100 };
  const diff = (Math.abs(ideal.n - ap.n) + Math.abs(ideal.p - ap.p) + Math.abs(ideal.k - ap.k)) / 2;
  return Math.max(0, Math.round(100 - diff));
}

/** Health boost from an NPK score */
export function npkHealthBoost(score) {
  if (score >= 85) return 18;
  if (score >= 70) return 12;
  if (score >= 50) return 7;
  return 3;
}

/** Current health accounting for feed-decay */
export function currentHealth(entry) {
  const base = entry.health ?? 75;
  const daysSinceFed = daysBetween(new Date(entry.lastFed), new Date());
  const decay = daysSinceFed <= 14 ? 0 : daysSinceFed <= 28 ? 5 : daysSinceFed <= 42 ? 12 : 20;
  return Math.max(0, Math.min(100, base - decay));
}

/** Health → status chip. Accent jobs: moss = healthy, ochre = feeding, clay = attention */
export function healthStatus(h) {
  if (h >= 70) return { label: "Thriving",   accent: "moss",  icon: "sprout" };
  if (h >= 50) return { label: "Needs feed", accent: "ochre", icon: "fertilizer" };
  return              { label: "Struggling", accent: "clay",  icon: "alert" };
}

// ── Sample data ──────────────────────────────────────────────────────────────
export const INITIAL = [
  {
    id: randomId(), plantId: "tomato", nickname: "Cherry Tom",
    plantedDate: addDays(new Date(), -45).toISOString(),
    lastWatered: addDays(new Date(), -1).toISOString(),
    lastFed: addDays(new Date(), -14).toISOString(),
    health: 78,
    photo: null, notes: "Growing in the south-facing raised bed.",
    logs: [{ date: addDays(new Date(), -45).toISOString(), text: "Planted seedling." }],
  },
  {
    id: randomId(), plantId: "basil", nickname: "Kitchen Basil",
    plantedDate: addDays(new Date(), -20).toISOString(),
    lastWatered: addDays(new Date(), -2).toISOString(),
    lastFed: addDays(new Date(), -10).toISOString(),
    health: 85,
    photo: null, notes: "Pot on the kitchen windowsill.",
    logs: [{ date: addDays(new Date(), -20).toISOString(), text: "Planted from seed." }],
  },
];


// ════════════════════════════════════════════════════════════════════════════
// ── Planner: compatibility helpers ───────────────────────────────────────────

/** True if either name contains the other as whole words, ignoring plurals ("Beans" ~ "Bush Bean") */
export function namesMatch(x, y) {
  const contains = (hay, needle) => {
    const stem = needle.toLowerCase().trim()
      .replace(/(s|x|z|ch|sh|o)es$/, "$1")   // tomatoes → tomato, radishes → radish
      .replace(/([^s])s$/, "$1");            // beans → bean (but cress stays cress)
    return stem.length > 1 && new RegExp(`\\b${escapeRegExp(stem)}(e?s)?\\b`).test(hay.toLowerCase());
  };
  return contains(x, y) || contains(y, x);
}

/** Returns "good" | "bad" | "neutral" for two plantIds */
export function getCompatibility(idA, idB) {
  if (!idA || !idB || idA === idB) return "neutral";
  const a = PLANT_DB[idA];
  const b = PLANT_DB[idB];
  if (!a || !b) return "neutral";
  const listHas = (list, name) => (list || []).some(c => namesMatch(c, name));
  const isGood = listHas(a.companions, b.name) || listHas(b.companions, a.name);
  const isBad = listHas(a.avoid, b.name) || listHas(b.avoid, a.name);
  if (isBad) return "bad";
  if (isGood) return "good";
  return "neutral";
}

/** Plant ids adjacent to the plant (or empty cell) at (x,y), including every
 *  cell of a multi-cell footprint. Follows "@anchor" refs and de-duplicates. */
export function getNeighbours(cells, w, h, x, y) {
  const self = resolveAnchor(cells, `${x},${y}`);
  const s = self ? getSpacingCells(PLANT_DB[cells[self]] || {}) : 1;
  const [ax, ay] = self ? self.split(",").map(Number) : [x, y];
  const anchors = new Set();
  for (let i = 0; i < s; i++) {
    for (const [nx, ny] of [[ax - 1, ay + i], [ax + s, ay + i], [ax + i, ay - 1], [ax + i, ay + s]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const a = resolveAnchor(cells, `${nx},${ny}`);
      if (a && a !== self) anchors.add(a);
    }
  }
  return [...anchors].map(a => cells[a]);
}

/** Unique pairs of plant ids that sit next to each other in a box */
export function adjacentPairs(box) {
  const pairs = new Map();
  for (const key of Object.keys(box.cells)) {
    const [x, y] = key.split(",").map(Number);
    for (const nKey of [`${x + 1},${y}`, `${x},${y + 1}`]) {
      const a = resolveAnchor(box.cells, key), b = resolveAnchor(box.cells, nKey);
      if (a && b && a !== b) pairs.set([a, b].sort().join("|"), [box.cells[a], box.cells[b]]);
    }
  }
  return [...pairs.values()];
}

/** Overall compat status of a planted cell with its neighbours */
export function cellCompatStatus(cells, w, h, x, y) {
  const id = cells[`${x},${y}`];
  if (!id) return "empty";
  const nbs = getNeighbours(cells, w, h, x, y);
  if (nbs.length === 0) return "neutral";
  const scores = nbs.map(nId => getCompatibility(id, nId));
  if (scores.some(s => s === "bad")) return "bad";
  if (scores.some(s => s === "good")) return "good";
  return "neutral";
}

/** Score every plant in DB against a list of neighbour ids */
export function scorePlantAgainstNeighbours(plantId, neighbourIds) {
  let score = 0;
  for (const nId of neighbourIds) {
    const c = getCompatibility(plantId, nId);
    if (c === "good") score += 3;
    if (c === "bad") score -= 5;
  }
  return score;
}

/** Return ranked suggestions for an empty cell */
export function getSuggestions(cells, w, h, x, y) {
  const nbs = getNeighbours(cells, w, h, x, y);
  return Object.keys(PLANT_DB)
    .map(id => ({ id, score: scorePlantAgainstNeighbours(id, nbs) }))
    .sort((a, b) => b.score - a.score || PLANT_DB[a.id].name.localeCompare(PLANT_DB[b.id].name))
    .slice(0, 12);
}


// ── Spacing helpers ───────────────────────────────────────────────────────────
export const SPACING_DEFAULTS = {
  "Vegetable": 2, "Leafy Green": 1, "Brassica": 2,
  "Herb": 1, "Herb/Perennial": 2,
  "Root Vegetable": 1, "Fruit": 1, "Berry": 1,
  "Tree Fruit": 4, "Citrus": 3,
  "Flower/Annual": 1, "Flower/Perennial": 2,
  "Bulb": 1, "Shrub": 3, "Climber": 2, "Exotic": 2,
};

export function getSpacingCells(plant) {
  return plant.spacingCells || SPACING_DEFAULTS[plant.category] || 1;
}
export function spacingCm(plant)     { return getSpacingCells(plant) * 30; }
export function spacingInches(plant) { return getSpacingCells(plant) * 12; }

/** All cell keys a plant would occupy if placed at (ax, ay) */
export function plantFootprint(ax, ay, s) {
  const keys = [];
  for (let dy = 0; dy < s; dy++)
    for (let dx = 0; dx < s; dx++)
      keys.push(`${ax + dx},${ay + dy}`);
  return keys;
}

/** True if placing plant with spacing s at (ax, ay) fits in the grid and all cells are free */
export function canPlace(cells, w, h, ax, ay, s) {
  if (ax + s > w || ay + s > h) return false;
  return plantFootprint(ax, ay, s).every(k => !cells[k]);
}

/** Place plant at anchor (ax, ay), marking all footprint cells */
export function doPlace(cells, ax, ay, plantId, s) {
  const next = { ...cells };
  const anchorKey = `${ax},${ay}`;
  plantFootprint(ax, ay, s).forEach((k, i) => {
    next[k] = i === 0 ? plantId : `@${anchorKey}`;
  });
  return next;
}

/** Remove plant rooted at anchorKey, clearing all its footprint cells */
export function doRemove(cells, anchorKey) {
  const [ax, ay] = anchorKey.split(",").map(Number);
  const plantId = cells[anchorKey];
  if (!plantId || plantId.startsWith("@")) return cells;
  const s = getSpacingCells(PLANT_DB[plantId] || {});
  const next = { ...cells };
  plantFootprint(ax, ay, s).forEach(k => delete next[k]);
  return next;
}

/** Resolve a cell key to its anchor key (handles both anchor and occupied cells) */
export function resolveAnchor(cells, key) {
  const val = cells[key];
  if (!val) return null;
  if (val.startsWith("@")) return val.slice(1);
  return key;
}

/** Get the real plantId at any cell (follows @ references) */
export function plantIdAt(cells, key) {
  const anchor = resolveAnchor(cells, key);
  return anchor ? cells[anchor] : null;
}

