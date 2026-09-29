import { PLANT_DB } from "./plantDb";
import { escapeRegExp, guessCategory, guessEmoji, buildStagesFromDays, buildFallbackPlant } from "./garden";

// ── Pl@ntNet identification ──────────────────────────────────────────────────
// Requests go through our own /api proxy, which adds the API key server-side
// (nginx in production, vite.config.js in dev) so it never reaches the browser.
export const PLANTNET_MIN_SCORE = 0.15;



// Map Pl@ntNet results (sorted by score) to a PLANT_DB id using whole-word
// name matches, so e.g. "Peppermint" doesn't match "Pepper".
export function matchPlantNetResults(results) {
  // Longest names first so "Bell Pepper" wins over "Pepper"
  const entries = Object.entries(PLANT_DB).sort((a, b) => b[1].name.length - a[1].name.length);
  for (const r of results) {
    if ((r.score ?? 0) < PLANTNET_MIN_SCORE) break;
    const names = [...(r.species?.commonNames || []), r.species?.scientificNameWithoutAuthor || ""]
      .map(n => n.toLowerCase().trim()).filter(Boolean);
    const exact = entries.find(([, p]) => names.includes(p.name.toLowerCase()));
    if (exact) return exact[0];
    const partial = entries.find(([, p]) => {
      const re = new RegExp(`\\b${escapeRegExp(p.name.toLowerCase())}(e?s)?\\b`);
      return names.some(n => re.test(n));
    });
    if (partial) return partial[0];
  }
  return null;
}


// ── Perenual plant-care lookup ────────────────────────────────────────────────
export const PERENUAL_API = "/api/perenual"; // proxied; the server adds the key

// Free-plan responses replace premium fields with an "Upgrade Plans…" string
export const perenualValue = v =>
  (typeof v === "string" && /upgrade|subscription/i.test(v)) ? null : v;
export const perenualList = v => Array.isArray(v) ? v.map(perenualValue).filter(Boolean) : [];
export const titleCase = s => s.replace(/\b\w/g, ch => ch.toUpperCase());

export async function perenualFetch(path, params = {}) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${PERENUAL_API}/${path}?${qs}`, { signal: AbortSignal.timeout(8000) });
  if (res.status === 429) throw new Error("Too many plant lookups — try again later.");
  if ([400, 401, 403].includes(res.status)) throw new Error("Online search isn't set up (check the PERENUAL_KEY setting).");
  if (!res.ok) throw new Error("Perenual lookup failed (HTTP " + res.status + ").");
  return res.json();
}

export function mapPerenualToPlant(query, d) {
  const name = titleCase(perenualValue(d.common_name) || query);
  const cycle = (perenualValue(d.cycle) || "").toLowerCase();
  const type = (perenualValue(d.type) || "").toLowerCase();
  const desc = perenualValue(d.description) || "";

  // Watering: prefer the numeric benchmark ("5-7" days), else the qualitative level
  const bench = String(perenualValue(d.watering_general_benchmark?.value) ?? "").match(/\d+/);
  const wateringLevel = (perenualValue(d.watering) || "").toLowerCase();
  const waterDays = Math.min(14, Math.max(1, bench ? Number(bench[0])
    : { frequent: 2, average: 4, minimum: 7, none: 14 }[wateringLevel] || 3));

  const sunlight = perenualList(d.sunlight).map(x => x.toLowerCase());
  const sunNeeds = sunlight.some(x => x.includes("full sun")) ? "Full Sun"
    : sunlight.some(x => x.includes("part")) ? "Partial Sun"
    : sunlight.some(x => x.includes("shade")) ? "Shade" : "Full Sun";

  let category = guessCategory(name, `${type} ${desc}`);
  if (category === "Vegetable") {
    if (/tree/.test(type)) category = d.edible_fruit ? "Tree Fruit" : "Shrub";
    else if (/shrub|bush/.test(type)) category = "Shrub";
    else if (d.flowers && !d.edible_fruit && !d.edible_leaf) category = cycle.includes("annual") ? "Flower/Annual" : "Flower/Perennial";
  }

  // Perenual has no days-to-maturity, so estimate from the life cycle
  const daysToHarvest = cycle.includes("annual") ? 90 : cycle.includes("biennial") ? 180 : cycle ? 365 : 90;

  const soil = perenualList(d.soil);
  const pests = perenualList(d.pest_susceptibility);
  const pruning = perenualList(d.pruning_month);
  const tips = [
    `Water about every ${waterDays} day${waterDays > 1 ? "s" : ""}${wateringLevel ? ` (${wateringLevel} watering)` : ""}.`,
    sunlight.length && `Prefers ${sunlight.join(", ")}.`,
    soil.length && `Grows best in ${soil.join(", ").toLowerCase()} soil.`,
    pests.length && `Watch for ${pests.join(", ").toLowerCase()}.`,
    pruning.length && `Prune in ${pruning.join(", ")}.`,
    d.poisonous_to_pets === true && "Poisonous to pets — keep out of reach.",
    d.drought_tolerant === true && "Drought tolerant once established — avoid overwatering.",
  ].filter(Boolean);
  const generic = [
    `Feed with a balanced fertiliser every 2–3 weeks during the growing season.`,
    `Mulch around the base to retain moisture and suppress weeds.`,
    `Ensure good air circulation to reduce disease risk.`,
  ];
  for (const g of generic) if (tips.length < 3) tips.push(g);

  const harvestSeason = perenualValue(d.harvest_season);
  const harvestMethod = perenualValue(d.harvest_method);
  return {
    name,
    latin: perenualList(d.scientific_name)[0] || null,
    emoji: guessEmoji(name),
    category,
    daysToHarvest,
    waterDays,
    sunNeeds,
    stages: buildStagesFromDays(daysToHarvest),
    tips: tips.slice(0, 5),
    harvest: harvestSeason
      ? `Harvest in ${harvestSeason.toLowerCase()}${harvestMethod ? ` by ${harvestMethod.toLowerCase()}` : ""}.`
      : `Harvest when the plant reaches its mature size and colour.`,
    companions: ["Marigold", "Comfrey"],
    avoid: ["Fennel"],
    source: "perenual",
  };
}

/** Care data for one Perenual species id */
export async function fetchPerenualPlant(query, id) {
  return mapPerenualToPlant(query, await perenualFetch(`species/details/${id}`));
}


export async function fetchCustomPlantData(name) {
  const trimmed = name.trim();
  const fallback = reason => ({ plant: buildFallbackPlant(trimmed), source: "fallback", options: [], reason });
  try {
    const { data = [] } = await perenualFetch("species-list", { q: trimmed });
    if (data.length === 0) return fallback(`No results for "${trimmed}" on Perenual.`);
    const options = data.slice(0, 4).map(r => ({ id: r.id, name: titleCase(r.common_name || "") }));
    return { plant: await fetchPerenualPlant(trimmed, data[0].id), source: "perenual", options };
  } catch (err) {
    return fallback(err.name === "TimeoutError" || err instanceof TypeError
      ? "Couldn't reach Perenual." : err.message);
  }
}

