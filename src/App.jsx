import { useState, useRef, useEffect } from "react";

// ── Plant database (250 plants) ─────────────────────────────────────────────
// `let` so custom-lookup plants can be registered at runtime
let PLANT_DB = {
  tomato: {
    name: "Tomato", emoji: "🍅", category: "Vegetable",
    spacingCells: 2, // 60 cm / 24 in
    daysToHarvest: 70, waterDays: 2, sunNeeds: "Full Sun",
    stages: [
      { name: "Seedling", days: 14, icon: "🌱" },
      { name: "Vegetative", days: 28, icon: "🌿" },
      { name: "Flowering", days: 14, icon: "🌸" },
      { name: "Fruiting", days: 14, icon: "🍅" },
    ],
    tips: [
      "Water deeply at the base — avoid wetting leaves to prevent blight.",
      "Pinch off suckers growing between the main stem and branches.",
      "Add calcium to prevent blossom-end rot.",
      "Support with stakes or cages once plants reach 30 cm.",
      "Feed with a high-potassium fertiliser once flowers appear.",
    ],
    harvest: "Harvest when fully coloured and slightly soft to the touch. Twist gently or snip with scissors.",
    companions: ["Basil", "Carrot", "Parsley"],
    avoid: ["Fennel", "Brassicas"],
  },
  lettuce: {
    name: "Lettuce", emoji: "🥬", category: "Leafy Green",
    spacingCells: 1, // 30 cm / 12 in
    daysToHarvest: 40, waterDays: 1, sunNeeds: "Partial Sun",
    stages: [
      { name: "Germination", days: 7, icon: "🌱" },
      { name: "Seedling", days: 14, icon: "🌿" },
      { name: "Head formation", days: 19, icon: "🥬" },
    ],
    tips: [
      "Keep soil consistently moist — drought causes bitterness.",
      "Provide shade in summer to prevent bolting.",
      "Harvest outer leaves first for a 'cut-and-come-again' approach.",
      "Sow in succession every 2–3 weeks for continuous harvest.",
      "Thin seedlings to 20–30 cm apart for full heads.",
    ],
    harvest: "Cut the whole head at the base or harvest outer leaves as needed. Best in the morning.",
    companions: ["Carrots", "Radish", "Strawberries"],
    avoid: ["Celery"],
  },
  basil: {
    name: "Basil", emoji: "🌿", category: "Herb",
    spacingCells: 1, // 30 cm / 12 in
    daysToHarvest: 60, waterDays: 2, sunNeeds: "Full Sun",
    stages: [
      { name: "Germination", days: 10, icon: "🌱" },
      { name: "Seedling", days: 20, icon: "🌿" },
      { name: "Bushy growth", days: 30, icon: "🌿" },
    ],
    tips: [
      "Pinch flowers immediately to keep leaves flavourful.",
      "Harvest from the top down, taking no more than 1/3 at a time.",
      "Avoid cold drafts — basil is sensitive to temperatures below 10 °C.",
      "Water at the base; wet leaves invite disease.",
      "Pot with other herbs for easy kitchen access.",
    ],
    harvest: "Pinch stems just above a leaf pair. Regular harvesting encourages bushier growth.",
    companions: ["Tomato", "Pepper"],
    avoid: ["Sage", "Thyme"],
  },
  carrot: {
    name: "Carrot", emoji: "🥕", category: "Root Vegetable",
    spacingCells: 1, // 10-15 cm / 4-6 in — sow a whole cell
    daysToHarvest: 75, waterDays: 3, sunNeeds: "Full Sun",
    stages: [
      { name: "Germination", days: 14, icon: "🌱" },
      { name: "Thinning stage", days: 21, icon: "🌿" },
      { name: "Root development", days: 40, icon: "🥕" },
    ],
    tips: [
      "Loosen soil to 30 cm depth — compacted soil causes forking.",
      "Thin seedlings to 5–8 cm apart once 5 cm tall.",
      "Avoid fresh manure — it splits roots.",
      "Keep soil evenly moist to prevent cracking.",
      "Mulch to keep the soil cool and retain moisture.",
    ],
    harvest: "Check shoulders at soil level — harvest when they reach desired size. Loosen with a fork first.",
    companions: ["Onion", "Lettuce", "Rosemary"],
    avoid: ["Dill", "Fennel"],
  },
  pepper: {
    name: "Pepper", emoji: "🌶️", category: "Vegetable",
    spacingCells: 2, // 45-60 cm / 18-24 in
    daysToHarvest: 80, waterDays: 2, sunNeeds: "Full Sun",
    stages: [
      { name: "Seedling", days: 14, icon: "🌱" },
      { name: "Vegetative", days: 30, icon: "🌿" },
      { name: "Flowering", days: 16, icon: "🌸" },
      { name: "Fruiting", days: 20, icon: "🌶️" },
    ],
    tips: [
      "Peppers love heat — don't transplant until nights stay above 15 °C.",
      "Shake the plant gently or use a soft brush to aid pollination.",
      "Feed with a balanced fertiliser during vegetative growth.",
      "Switch to high-potassium feed once fruiting begins.",
      "Leaving peppers on the plant longer intensifies heat and colour.",
    ],
    harvest: "Green peppers can be harvested early; leave longer for red/yellow colour and sweeter flavour.",
    companions: ["Basil", "Tomato", "Carrot"],
    avoid: ["Fennel", "Brassicas"],
  },
  cucumber: {
    name: "Cucumber", emoji: "🥒", category: "Vegetable",
    spacingCells: 2, // 60 cm / 24 in
    daysToHarvest: 55, waterDays: 1, sunNeeds: "Full Sun",
    stages: [
      { name: "Germination", days: 7, icon: "🌱" },
      { name: "Vine growth", days: 21, icon: "🌿" },
      { name: "Flowering", days: 14, icon: "🌸" },
      { name: "Fruiting", days: 13, icon: "🥒" },
    ],
    tips: [
      "Cucumbers are 95% water — keep soil consistently moist.",
      "Train vines up a trellis to save space and improve air flow.",
      "Harvest frequently to keep the plant producing.",
      "Avoid overhead watering to reduce mildew risk.",
      "Mulch to keep roots cool and retain moisture.",
    ],
    harvest: "Harvest when firm and dark green, before seeds harden. Don't let them turn yellow.",
    companions: ["Beans", "Corn", "Peas"],
    avoid: ["Sage", "Potatoes"],
  },
  zucchini: {
    name: "Zucchini", emoji: "🫛", category: "Vegetable",
    spacingCells: 3, // 90 cm / 36 in
    daysToHarvest: 55, waterDays: 2, sunNeeds: "Full Sun",
    stages: [
      { name: "Seedling", days: 10, icon: "🌱" },
      { name: "Rapid growth", days: 20, icon: "🌿" },
      { name: "Flowering", days: 12, icon: "🌸" },
      { name: "Fruiting", days: 13, icon: "🫛" },
    ],
    tips: [
      "Hand-pollinate if fruit shrivels — transfer pollen from male to female flowers.",
      "Harvest when 15–20 cm long for best flavour.",
      "Space plants 60–90 cm apart — they spread quickly.",
      "Remove any yellowing leaves to improve airflow.",
      "One or two plants are usually enough for a family.",
    ],
    harvest: "Best harvested small (15–20 cm). Check daily in peak season — they can double in size overnight.",
    companions: ["Beans", "Corn", "Nasturtium"],
    avoid: ["Potatoes", "Fennel"],
  },
  strawberry: {
    name: "Strawberry", emoji: "🍓", category: "Fruit",
    spacingCells: 1, // 30 cm / 12 in
    daysToHarvest: 90, waterDays: 2, sunNeeds: "Full Sun",
    stages: [
      { name: "Establishing", days: 30, icon: "🌱" },
      { name: "Runner production", days: 30, icon: "🌿" },
      { name: "Flowering", days: 15, icon: "🌸" },
      { name: "Ripening", days: 15, icon: "🍓" },
    ],
    tips: [
      "Remove runners unless you want new plants.",
      "Mulch with straw to keep fruit off the ground and retain moisture.",
      "Net against birds as fruit ripens.",
      "Renovate plants after harvest — cut leaves back to 10 cm.",
      "Replace plants every 3–4 years for best yields.",
    ],
    harvest: "Pick when fully red and glossy. Twist gently to detach. Best eaten same day.",
    companions: ["Lettuce", "Spinach", "Thyme"],
    avoid: ["Brassicas", "Fennel"],
  },
  lavender: {
    name: "Lavender", emoji: "💜", category: "Herb/Perennial",
    spacingCells: 2, // 60 cm / 24 in
    daysToHarvest: 365, waterDays: 7, sunNeeds: "Full Sun",
    stages: [
      { name: "Establishing", days: 90, icon: "🌱" },
      { name: "First year growth", days: 180, icon: "🌿" },
      { name: "Mature flowering", days: 95, icon: "💜" },
    ],
    tips: [
      "Plant in well-draining, slightly alkaline soil — lavender hates wet feet.",
      "Prune by 1/3 in spring and again after flowering.",
      "Never cut into old wood — it won't regenerate.",
      "Avoid over-fertilising; poor soil produces more aromatic plants.",
      "Harvest flower spikes when buds are just starting to open.",
    ],
    harvest: "Cut stems when buds show colour but are not fully open. Bundle and hang to dry in a warm, dark place.",
    companions: ["Roses", "Echinacea", "Yarrow"],
    avoid: ["Shade-loving plants"],
  },
  rose: {
    name: "Rose", emoji: "🌹", category: "Flower/Perennial",
    spacingCells: 2, // 60 cm / 24 in
    daysToHarvest: 365, waterDays: 3, sunNeeds: "Full Sun",
    stages: [
      { name: "Dormant", days: 120, icon: "🪵" },
      { name: "Spring growth", days: 60, icon: "🌿" },
      { name: "First flush", days: 60, icon: "🌹" },
      { name: "Repeat flush", days: 125, icon: "🌹" },
    ],
    tips: [
      "Prune to an outward-facing bud at a 45° angle to encourage open shape.",
      "Feed with rose-specific fertiliser after each flush.",
      "Water at the base — wet foliage encourages black spot.",
      "Deadhead spent blooms to encourage repeat flowering.",
      "Mulch thickly in autumn to protect roots from frost.",
    ],
    harvest: "Cut roses in early morning when buds are half-open. Use sharp, clean secateurs at a 45° angle.",
    companions: ["Lavender", "Garlic", "Geranium"],
    avoid: ["Brassicas", "Fennel"],
  },
};

const PLANT_LIST = Object.entries(PLANT_DB).map(([id, p]) => ({ id, ...p }));

// ── Helpers ─────────────────────────────────────────────────────────────────
function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function fmt(date) {
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
function getStage(plant, daysSincePlanting) {
  let elapsed = 0;
  for (const s of plant.stages) {
    elapsed += s.days;
    if (daysSincePlanting < elapsed) return s;
  }
  return plant.stages[plant.stages.length - 1];
}
function stageProgress(plant, daysSincePlanting) {
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
function overallProgress(plant, daysSincePlanting) {
  return Math.min(100, Math.round((daysSincePlanting / plant.daysToHarvest) * 100));
}
function urgency(daysAgo, interval) {
  if (daysAgo >= interval) return "overdue";
  if (daysAgo >= interval - 1) return "due";
  return "ok";
}
function randomId() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Custom plant lookup ───────────────────────────────────────────────────────
function guessEmoji(name) {
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

function guessCategory(name, description = "") {
  const t = (name + " " + description).toLowerCase();
  if (/herb|mint|basil|thyme|sage|rosemary|oregano|parsley|chive|dill|coriander/.test(t)) return "Herb";
  if (/rose|tulip|daisy|marigold|zinnia|cosmos|pansy|petunia|sunflower|dahlia|lily|iris|peony|lavender/.test(t)) return "Flower/Perennial";
  if (/lettuce|spinach|kale|chard|rocket|arugula|bok choy|pak choi|endive|watercress/.test(t)) return "Leafy Green";
  if (/carrot|parsnip|beetroot|beet|radish|turnip|potato|sweet potato|yam/.test(t)) return "Root Vegetable";
  if (/broccoli|cauliflower|cabbage|brussel|kohlrabi/.test(t)) return "Brassica";
  if (/strawberry|raspberry|blackberry|blueberry|gooseberry|currant/.test(t)) return "Berry";
  if (/apple|pear|plum|cherry|peach|nectarine|apricot|lemon|lime|orange/.test(t)) return "Tree Fruit";
  if (/shrub|bush|hydrangea|rhododendron|camellia|viburnum/.test(t)) return "Shrub";
  return "Vegetable";
}

function buildStagesFromDays(days) {
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

function mapOpenFarmToPlant(name, attrs) {
  const days = attrs.days_to_maturity
    ? parseInt(attrs.days_to_maturity, 10)
    : attrs.growing_degree_days
    ? 90
    : 90;
  const sunRaw = (attrs.sun_requirements || "Full Sun").trim();
  const sunMap = {
    "Full Sun": "Full Sun",
    "Partial Sun/Shade": "Partial Sun",
    "Partial shade": "Partial Sun",
    "Full Shade": "Shade",
  };
  const sun = sunMap[sunRaw] || "Full Sun";
  const desc = attrs.description || "";

  // Extract up to 4 sentences from description as tips
  const sentences = desc.replace(/\n/g, " ").split(/(?<=[.!?])\s+/).filter(s => s.length > 20).slice(0, 4);
  const tips = sentences.length >= 3
    ? sentences
    : [
        `Water ${name} consistently, especially during dry spells.`,
        `Feed with a balanced fertiliser every 2–3 weeks during the growing season.`,
        `Ensure good air circulation to reduce disease risk.`,
        `Harvest regularly to encourage continued production.`,
        `Mulch around the base to retain moisture and suppress weeds.`,
      ];

  const category = guessCategory(name, desc);

  return {
    name: attrs.name || name,
    emoji: guessEmoji(name),
    category,
    daysToHarvest: isNaN(days) ? 90 : days,
    waterDays: sun === "Shade" ? 3 : 2,
    sunNeeds: sun,
    stages: buildStagesFromDays(isNaN(days) ? 90 : days),
    tips: tips.slice(0, 5),
    harvest: attrs.sowing_method
      ? `Sowing method: ${attrs.sowing_method}. Harvest when the plant reaches maturity around day ${days}.`
      : `Harvest when the plant reaches its mature size and colour around day ${isNaN(days) ? 90 : days}.`,
    companions: ["Marigold", "Comfrey"],
    avoid: ["Fennel"],
    source: "OpenFarm",
  };
}

function buildFallbackPlant(name) {
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

async function fetchCustomPlantData(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("No name");
  try {
    const url = `https://openfarm.cc/api/v1/crops?q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    const results = json.data || [];
    if (results.length === 0) return { plant: buildFallbackPlant(trimmed), source: "fallback", options: [] };
    // Return best match plus alternatives
    const options = results.slice(0, 4).map(r => ({
      id: r.id,
      name: r.attributes.name,
      description: (r.attributes.description || "").slice(0, 100),
      attrs: r.attributes,
    }));
    return {
      plant: mapOpenFarmToPlant(trimmed, results[0].attributes),
      source: "openfarm",
      options,
    };
  } catch (err) {
    return { plant: buildFallbackPlant(trimmed), source: "fallback", options: [] };
  }
}

// ── NPK / fertilizer helpers ─────────────────────────────────────────────────

/** Ideal N-P-K ratio (as percentages of total) per plant category */
const NPK_IDEAL = {
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

const FERT_TYPES = ["Liquid", "Granular", "Slow-release", "Organic", "Powder", "Spike"];
const FERT_COLOURS = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

/** Score 0-100: how well npk {n,p,k} matches a plant category's ideal */
function calcNPKScore(category, npk) {
  const ideal = NPK_IDEAL[category] || NPK_IDEAL["Vegetable"];
  const total = (npk.n || 0) + (npk.p || 0) + (npk.k || 0);
  if (total === 0) return 0;
  const ap = { n: npk.n/total*100, p: npk.p/total*100, k: npk.k/total*100 };
  const diff = (Math.abs(ideal.n - ap.n) + Math.abs(ideal.p - ap.p) + Math.abs(ideal.k - ap.k)) / 2;
  return Math.max(0, Math.round(100 - diff));
}

/** Health boost from an NPK score */
function npkHealthBoost(score) {
  if (score >= 85) return 18;
  if (score >= 70) return 12;
  if (score >= 50) return 7;
  return 3;
}

/** Current health accounting for feed-decay */
function currentHealth(entry) {
  const base = entry.health ?? 75;
  const daysSinceFed = daysBetween(new Date(entry.lastFed), new Date());
  const decay = daysSinceFed <= 14 ? 0 : daysSinceFed <= 28 ? 5 : daysSinceFed <= 42 ? 12 : 20;
  return Math.max(0, Math.min(100, base - decay));
}

function healthLabel(h) {
  if (h >= 90) return { label: "Excellent", colour: "text-emerald-600", bar: "bg-emerald-500", icon: "💚" };
  if (h >= 70) return { label: "Good",      colour: "text-green-600",   bar: "bg-green-500",   icon: "🟢" };
  if (h >= 50) return { label: "Fair",      colour: "text-yellow-600",  bar: "bg-yellow-400",  icon: "🟡" };
  if (h >= 30) return { label: "Poor",      colour: "text-orange-500",  bar: "bg-orange-400",  icon: "🟠" };
  return              { label: "Critical",  colour: "text-red-600",     bar: "bg-red-500",      icon: "🔴" };
}

// ── Sample data ──────────────────────────────────────────────────────────────
const INITIAL = [
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

// ── Colour palette ───────────────────────────────────────────────────────────
const CAT_COLOUR = {
  "Vegetable":        "bg-green-100 text-green-700",
  "Leafy Green":      "bg-teal-100 text-teal-700",
  "Brassica":         "bg-cyan-100 text-cyan-700",
  "Herb":             "bg-lime-100 text-lime-700",
  "Herb/Perennial":   "bg-purple-100 text-purple-700",
  "Root Vegetable":   "bg-orange-100 text-orange-700",
  "Fruit":            "bg-red-100 text-red-700",
  "Berry":            "bg-rose-100 text-rose-700",
  "Tree Fruit":       "bg-amber-100 text-amber-700",
  "Citrus":           "bg-yellow-100 text-yellow-700",
  "Flower/Annual":    "bg-pink-100 text-pink-700",
  "Flower/Perennial": "bg-fuchsia-100 text-fuchsia-700",
  "Bulb":             "bg-violet-100 text-violet-700",
  "Shrub":            "bg-emerald-100 text-emerald-700",
  "Climber":          "bg-sky-100 text-sky-700",
  "Exotic":           "bg-indigo-100 text-indigo-700",
};

// ════════════════════════════════════════════════════════════════════════════
// ── Components ───────────────────────────────────────────────────────────────

function Badge({ text, extra = "" }) {
  const cls = CAT_COLOUR[text] || "bg-gray-100 text-gray-600";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls} ${extra}`}>{text}</span>;
}

function ProgressBar({ pct, colour = "bg-green-500" }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${colour} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header({ view, onBack, onAdd }) {
  return (
    <header className="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-4 py-3 flex items-center gap-3 shadow-md">
      {view !== "dashboard" && (
        <button onClick={onBack} className="text-white/80 hover:text-white text-xl leading-none">←</button>
      )}
      <span className="text-2xl">🌱</span>
      <h1 className="font-bold text-lg flex-1">Garden Tracker</h1>
      {view === "dashboard" && (
        <button
          onClick={onAdd}
          className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          <span className="text-base leading-none">+</span> Add Plant
        </button>
      )}
    </header>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ plants, onSelect, onAdd }) {
  const today = new Date();
  const overdueWater = plants.filter(p => {
    if (p.autoWater?.enabled) return false; // sprinkler handles it
    const db = PLANT_DB[p.plantId];
    return urgency(daysBetween(new Date(p.lastWatered), today), db.waterDays) === "overdue";
  });

  return (
    <div className="p-4 space-y-5">
      {/* Alert strip */}
      {overdueWater.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2">
          <span className="text-xl">💧</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Watering overdue!</p>
            <p className="text-amber-700 text-xs">{overdueWater.map(p => p.nickname).join(", ")} need water today.</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Plants", value: plants.length, icon: "🪴" },
          { label: "Harvesting soon", icon: "🌾",
            value: plants.filter(p => {
              const db = PLANT_DB[p.plantId];
              const d = daysBetween(new Date(p.plantedDate), today);
              return d >= db.daysToHarvest - 14 && d <= db.daysToHarvest + 7;
            }).length
          },
          { label: "Need water", icon: "💧", value: overdueWater.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-3 text-center border border-gray-100">
            <div className="text-2xl">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Plant cards */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-2">My Garden</h2>
        {plants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-gray-500 mb-4">No plants yet. Add your first one!</p>
            <button onClick={onAdd} className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold text-sm">
              Add Plant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {plants.map(p => <PlantCard key={p.id} entry={p} onClick={() => onSelect(p.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function PlantCard({ entry, onClick }) {
  const db = PLANT_DB[entry.plantId];
  const today = new Date();
  const age = daysBetween(new Date(entry.plantedDate), today);
  const pct = overallProgress(db, age);
  const stage = getStage(db, age);
  const daysLeft = Math.max(0, db.daysToHarvest - age);
  const autoOn = entry.autoWater?.enabled;
  const freq = entry.autoWater?.frequencyDays || db.waterDays;
  const waterDaysAgo = daysBetween(new Date(entry.lastWatered), today);
  // Auto-watered plants are never "overdue" — sprinkler handles it
  const waterStatus = autoOn ? "auto" : urgency(waterDaysAgo, db.waterDays);
  const daysUntilNext = autoOn ? Math.max(0, freq - waterDaysAgo) : Math.max(0, db.waterDays - waterDaysAgo);

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl relative">
          {db.emoji}
          {autoOn && <span className="absolute -bottom-1 -right-1 text-base">💦</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold text-gray-800 truncate">{entry.nickname}</span>
            <Badge text={db.category} />
            {autoOn && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">💦 Auto</span>}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">{db.name} · Planted {fmt(entry.plantedDate)}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm">{stage.icon}</span>
            <span className="text-xs text-gray-600">{stage.name}</span>
            <span className="text-xs text-gray-400 ml-auto">{pct}%</span>
          </div>
          <ProgressBar pct={pct} colour={pct >= 90 ? "bg-emerald-500" : "bg-green-400"} />
          {/* Health mini-bar */}
          {(() => { const h = currentHealth(entry); const hl = healthLabel(h); return (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs">{hl.icon}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div className={`${hl.bar} h-1.5 rounded-full transition-all`} style={{ width: `${h}%` }} />
              </div>
              <span className={`text-xs font-semibold ${hl.colour}`}>{h}%</span>
            </div>
          ); })()}
          <div className="flex items-center gap-3 mt-2">
            {autoOn ? (
              <span className="text-xs text-blue-500 font-semibold">
                💦 Next water in {daysUntilNext}d
              </span>
            ) : (
              <span className={`text-xs flex items-center gap-1 ${waterStatus === "overdue" ? "text-red-500 font-semibold" : waterStatus === "due" ? "text-amber-500" : "text-gray-400"}`}>
                💧 {waterStatus === "overdue" ? "Overdue" : waterStatus === "due" ? "Due today" : `${daysUntilNext}d`}
              </span>
            )}
            {daysLeft <= 14 && daysLeft > 0 && (
              <span className="text-xs text-emerald-600 font-semibold">🌾 {daysLeft}d to harvest</span>
            )}
            {daysLeft === 0 && <span className="text-xs text-emerald-700 font-bold">🎉 Ready to harvest!</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Add Plant ────────────────────────────────────────────────────────────────
// steps: scan | select | custom | loading | review | details
function AddPlant({ onSave, onCancel }) {
  const [step, setStep] = useState("scan");
  const [selectedId, setSelectedId] = useState(null);
  const [nickname, setNickname] = useState("");
  const [plantedDate, setPlantedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [search, setSearch] = useState("");
  // Custom lookup state
  const [customQuery, setCustomQuery] = useState("");
  const [lookupResult, setLookupResult] = useState(null); // { plant, source, options }
  const [lookupOptions, setLookupOptions] = useState([]);
  const [lookupError, setLookupError] = useState("");
  const fileRef = useRef();

  const allPlants = Object.entries(PLANT_DB).map(([id, p]) => ({ id, ...p }));
  const filtered = allPlants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );
  const noResults = search.trim().length > 1 && filtered.length === 0;

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPhoto(ev.target.result); setStep("select"); };
    reader.readAsDataURL(file);
  }

  async function handleLookup() {
    if (!customQuery.trim()) return;
    setStep("loading");
    setLookupError("");
    try {
      const result = await fetchCustomPlantData(customQuery);
      setLookupResult(result);
      setLookupOptions(result.options || []);
      setNickname(result.plant.name);
      setStep("review");
    } catch {
      setLookupError("Something went wrong. Using smart defaults instead.");
      const fallback = buildFallbackPlant(customQuery);
      setLookupResult({ plant: fallback, source: "fallback", options: [] });
      setNickname(fallback.name);
      setStep("review");
    }
  }

  function selectLookupOption(attrs) {
    const plant = mapOpenFarmToPlant(customQuery, attrs);
    setLookupResult(prev => ({ ...prev, plant }));
    setNickname(plant.name);
  }

  function confirmCustomPlant() {
    if (!lookupResult) return;
    const key = lookupResult.plant.name.toLowerCase().replace(/\s+/g, "_") + "_" + randomId();
    PLANT_DB[key] = lookupResult.plant;
    setSelectedId(key);
    setStep("details");
  }

  function handleSave() {
    if (!selectedId || !nickname) return;
    onSave({
      id: randomId(),
      plantId: selectedId,
      nickname: nickname.trim(),
      plantedDate: new Date(plantedDate).toISOString(),
      lastWatered: new Date().toISOString(),
      lastFed: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      photo,
      notes,
      logs: [{ date: new Date().toISOString(), text: "Added to garden tracker." }],
    });
  }

  // ── Step: scan ──
  if (step === "scan") return (
    <div className="p-4 space-y-4">
      <h2 className="font-bold text-gray-800 text-lg">Add a Plant</h2>
      <div
        onClick={() => fileRef.current.click()}
        className="border-2 border-dashed border-green-400 rounded-2xl p-10 text-center cursor-pointer hover:bg-green-50 transition-colors"
      >
        <div className="text-5xl mb-3">📷</div>
        <p className="font-semibold text-gray-700">Scan your plant</p>
        <p className="text-sm text-gray-500 mt-1">Take a photo or upload from gallery</p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>
      <button onClick={() => setStep("select")} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">
        Browse plant library
      </button>
      <button onClick={() => { setStep("custom"); setCustomQuery(""); }} className="w-full border border-green-600 text-green-700 py-3 rounded-xl font-semibold hover:bg-green-50">
        🔍 Search online for any plant
      </button>
    </div>
  );

  // ── Step: select (library) ──
  if (step === "select") return (
    <div className="p-4 space-y-3">
      {photo && (
        <div className="rounded-xl overflow-hidden h-36 bg-gray-100">
          <img src={photo} className="w-full h-full object-cover" alt="plant" />
        </div>
      )}
      <h2 className="font-bold text-gray-800">Select plant type</h2>
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search 250+ plants…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        autoFocus
      />
      <div className="plant-pick-grid max-h-64 overflow-y-auto pb-1">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => { setSelectedId(p.id); setNickname(p.name); setStep("details"); }}
            className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="text-3xl">{p.emoji}</div>
            <div className="font-semibold text-gray-800 text-sm mt-1">{p.name}</div>
            <Badge text={p.category} extra="mt-1" />
          </button>
        ))}
      </div>
      {/* Not found nudge */}
      <div className={`rounded-xl border border-dashed border-blue-300 bg-blue-50 p-3 text-center ${noResults ? "" : "opacity-60"}`}>
        <p className="text-sm text-blue-700 font-semibold">
          {noResults ? `"${search}" isn't in the library yet.` : "Can't find your plant?"}
        </p>
        <button
          onClick={() => { setCustomQuery(search); setStep("custom"); }}
          className="mt-1 text-xs text-blue-600 underline font-semibold"
        >
          Search online and download its care info →
        </button>
      </div>
    </div>
  );

  // ── Step: custom search input ──
  if (step === "custom") return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-3xl">🔍</span>
        <h2 className="font-bold text-gray-800 text-lg">Search any plant</h2>
      </div>
      <p className="text-sm text-gray-500">Enter the plant's name and we'll fetch its care info from the OpenFarm crop database.</p>
      <input
        value={customQuery}
        onChange={e => setCustomQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleLookup()}
        placeholder="e.g. Agapanthus, Loquat, Taro…"
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        autoFocus
      />
      <button
        onClick={handleLookup}
        disabled={!customQuery.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        🌐 Fetch care information
      </button>
      <button onClick={() => setStep("select")} className="w-full text-gray-500 text-sm py-2">
        ← Back to library
      </button>
    </div>
  );

  // ── Step: loading ──
  if (step === "loading") return (
    <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-64">
      <div className="text-5xl animate-bounce">🌱</div>
      <p className="font-semibold text-gray-700">Looking up "{customQuery}"…</p>
      <p className="text-sm text-gray-400 text-center">Fetching care data from OpenFarm crop database</p>
      <div className="flex gap-1 mt-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );

  // ── Step: review (show fetched data) ──
  if (step === "review" && lookupResult) {
    const p = lookupResult.plant;
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{lookupResult.source === "openfarm" ? "✅" : "🤖"}</span>
          <h2 className="font-bold text-gray-800">
            {lookupResult.source === "openfarm" ? "Found on OpenFarm" : "Smart defaults generated"}
          </h2>
        </div>

        {lookupError && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 text-xs text-amber-700">{lookupError}</div>
        )}

        {/* Alternative matches */}
        {lookupOptions.length > 1 && (
          <div>
            <p className="text-xs text-gray-500 mb-1 font-semibold">Other matches — tap to switch:</p>
            <div className="flex flex-wrap gap-2">
              {lookupOptions.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={() => selectLookupOption(opt.attrs)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${p.name === opt.name ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-300 text-gray-600 hover:border-green-400"}`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Plant card preview */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{p.emoji}</span>
            <div>
              <div className="font-bold text-gray-800 text-lg">{p.name}</div>
              <Badge text={p.category} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
            <div className="bg-white rounded-lg p-2">
              <div className="text-gray-400">☀️ Sun</div>
              <div className="font-semibold text-gray-700">{p.sunNeeds}</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-gray-400">💧 Water</div>
              <div className="font-semibold text-gray-700">Every {p.waterDays}d</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-gray-400">🌾 Days</div>
              <div className="font-semibold text-gray-700">{p.daysToHarvest >= 365 ? "Perennial" : p.daysToHarvest + "d"}</div>
            </div>
          </div>
          <div className="space-y-1">
            {p.tips.slice(0, 2).map((t, i) => (
              <div key={i} className="text-xs text-gray-600 bg-white rounded-lg p-2">💡 {t}</div>
            ))}
          </div>
          {lookupResult.source === "openfarm" && (
            <p className="text-xs text-green-600 mt-2">Source: OpenFarm crop database</p>
          )}
          {lookupResult.source === "fallback" && (
            <p className="text-xs text-gray-400 mt-2">Source: Smart defaults (OpenFarm had no results)</p>
          )}
        </div>

        <button
          onClick={confirmCustomPlant}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
        >
          Use this plant →
        </button>
        <button onClick={() => setStep("custom")} className="w-full text-gray-500 text-sm py-2">
          ← Search again
        </button>
      </div>
    );
  }

  // ── Step: details ──
  const db = selectedId ? PLANT_DB[selectedId] : null;
  return (
    <div className="p-4 space-y-4">
      {db && (
        <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
          <span className="text-4xl">{db.emoji}</span>
          <div>
            <div className="font-bold text-gray-800">{db.name}</div>
            <div className="flex items-center gap-2">
              <Badge text={db.category} />
              {db.source === "openfarm" && <span className="text-xs text-blue-500">📡 OpenFarm</span>}
              {db.source === "Generated" && <span className="text-xs text-gray-400">🤖 Auto-generated</span>}
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-1">Nickname *</label>
        <input
          value={nickname} onChange={e => setNickname(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="e.g. Back-garden tom"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-1">Date planted</label>
        <input
          type="date" value={plantedDate} onChange={e => setPlantedDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-1">Notes (optional)</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          placeholder="Location, variety, etc."
        />
      </div>
      <RippleBtn
        onClick={handleSave}
        disabled={!nickname}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40"
      >
        Add to My Garden 🌱
      </RippleBtn>
    </div>
  );
}

// ── Plant Profile ─────────────────────────────────────────────────────────────
function PlantProfile({ entry, onUpdate, onDelete, fertilizers, onToast }) {
  const db = PLANT_DB[entry.plantId];
  const today = new Date();
  const age = daysBetween(new Date(entry.plantedDate), today);
  const pct = overallProgress(db, age);
  const stage = getStage(db, age);
  const stagePct = stageProgress(db, age);
  const daysLeft = Math.max(0, db.daysToHarvest - age);
  const harvestDate = addDays(new Date(entry.plantedDate), db.daysToHarvest);
  const waterDaysAgo = daysBetween(new Date(entry.lastWatered), today);
  const feedDaysAgo = daysBetween(new Date(entry.lastFed), today);
  const waterStatus = urgency(waterDaysAgo, db.waterDays);
  const feedStatus = urgency(feedDaysAgo, 14);
  const health = currentHealth(entry);
  const hl = healthLabel(health);
  const [tab, setTab] = useState("overview");
  const [logText, setLogText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFertModal, setShowFertModal] = useState(false);

  function logAction(text, updates = {}, toastMsg = null, toastIcon = "✅", toastType = "success") {
    onUpdate({
      ...entry,
      ...updates,
      logs: [{ date: new Date().toISOString(), text }, ...(entry.logs || [])],
    });
    if (toastMsg && onToast) onToast(toastMsg, toastIcon, toastType);
  }

  // Tailored tips based on age
  const activeTips = (() => {
    const tips = [...db.tips];
    if (daysLeft <= 14 && daysLeft > 0) tips.unshift("🌾 Harvest time is approaching — check daily and prepare your harvest plan.");
    if (daysLeft === 0) tips.unshift("🎉 Your plant should be ready to harvest! " + db.harvest);
    if (waterStatus === "overdue") tips.unshift("💧 Urgent: water your plant now to prevent stress and damage.");
    if (feedStatus === "overdue") tips.unshift("🌿 Time to feed — plants need nutrients every 1–2 weeks during active growth.");
    return tips.slice(0, 4);
  })();

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white px-4 pt-2 pb-5">
        <div className="flex items-center gap-3">
          <div className="hero-emoji text-6xl flex-shrink-0">{db.emoji}</div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{entry.nickname}</h2>
            <div className="text-green-200 text-sm truncate">{db.name}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge text={db.category} />
              {entry.autoWater?.enabled && <span className="text-xs bg-blue-400/30 text-blue-100 px-2 py-0.5 rounded-full">💦 Auto</span>}
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-xl p-3">
          <div className="flex justify-between text-xs text-green-200 mb-1">
            <span>Overall progress</span><span>{pct}%</span>
          </div>
          <ProgressBar pct={pct} colour="bg-white" />
          <div className="flex justify-between text-xs text-green-100 mt-1">
            <span>Day {age}</span>
            <span>{daysLeft > 0 ? `${daysLeft} days to harvest` : "🎉 Ready!"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        {["overview", "care", "advice", "log"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-green-600 text-green-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t === "overview" ? "📊 Overview" : t === "care" ? "💧 Care" : t === "advice" ? "💡 Advice" : "📓 Log"}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {tab === "overview" && (
          <>
            {/* Stage progress */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-3">Growth Stage</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{stage.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{stage.name}</div>
                  <ProgressBar pct={stagePct} colour="bg-emerald-500" />
                </div>
                <span className="text-sm text-gray-400">{stagePct}%</span>
              </div>
              <div className="flex gap-1 mt-3">
                {db.stages.map((s, i) => {
                  let elapsed = 0;
                  for (let j = 0; j < i; j++) elapsed += db.stages[j].days;
                  const active = age >= elapsed && age < elapsed + s.days;
                  const done = age >= elapsed + s.days;
                  return (
                    <div key={s.name} className="flex-1 text-center">
                      <div className={`text-lg ${active ? "" : done ? "opacity-100" : "opacity-30"}`}>{s.icon}</div>
                      <div className={`text-xs mt-0.5 ${active ? "text-green-700 font-semibold" : done ? "text-gray-500" : "text-gray-300"}`}>
                        {s.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health */}
            <div className={`rounded-2xl p-4 border ${health >= 70 ? "bg-green-50 border-green-200" : health >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{hl.icon}</span>
                  <h3 className="font-bold text-gray-700">Plant Health</h3>
                </div>
                <span className={`text-sm font-bold ${hl.colour}`}>{health}% · {hl.label}</span>
              </div>
              <ProgressBar pct={health} colour={hl.bar} />
              {feedDaysAgo > 14 && (
                <p className="text-xs text-orange-600 mt-2">⚠️ Health declining — last fed {feedDaysAgo} days ago. Apply fertiliser to restore.</p>
              )}
              {health < 50 && (
                <p className="text-xs text-red-600 mt-1">🚨 Plant needs urgent nutrition — apply a fertiliser now.</p>
              )}
            </div>

            {/* Harvest countdown */}
            <div className={`rounded-2xl p-4 ${daysLeft === 0 ? "bg-emerald-100 border border-emerald-300 anim-wiggle" : "bg-amber-50 border border-amber-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🌾</span>
                <h3 className="font-bold text-gray-700">Harvest Forecast</h3>
              </div>
              {daysLeft === 0 ? (
                <p className="text-emerald-800 font-semibold">Ready to harvest now! 🎉</p>
              ) : (
                <p className="text-amber-800"><span className="font-bold text-2xl">{daysLeft}</span> days — around <span className="font-semibold">{fmt(harvestDate)}</span></p>
              )}
              <p className="text-xs text-gray-500 mt-1">{db.harvest}</p>
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-3">Plant Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Sun", value: db.sunNeeds, icon: "☀️" },
                  { label: "Water every", value: `${db.waterDays}d`, icon: "💧" },
                  { label: "Planted", value: fmt(entry.plantedDate), icon: "📅" },
                  { label: "Age", value: `${age} days`, icon: "🕐" },
                ].map(r => (
                  <div key={r.label} className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500">{r.icon} {r.label}</div>
                    <div className="font-semibold text-gray-800 text-sm">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {entry.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <div className="text-xs text-yellow-600 font-semibold mb-1">📝 Notes</div>
                <p className="text-sm text-gray-700">{entry.notes}</p>
              </div>
            )}

            {/* Companions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-2">Companion Planting</h3>
              <div className="text-xs text-gray-500 mb-1">✅ Grows well with</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {db.companions.map(c => <span key={c} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{c}</span>)}
              </div>
              <div className="text-xs text-gray-500 mb-1">❌ Keep away from</div>
              <div className="flex flex-wrap gap-1">
                {db.avoid.map(c => <span key={c} className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{c}</span>)}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-red-500 text-sm py-2 rounded-xl border border-red-200 hover:bg-red-50"
            >
              Remove plant
            </button>
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowDeleteConfirm(false)}>
                <div className="bg-white w-full rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-800 mb-2">Remove {entry.nickname}?</h3>
                  <p className="text-sm text-gray-500 mb-4">This will permanently delete all tracking data for this plant.</p>
                  <button onClick={onDelete} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold mb-2">Remove plant</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="w-full text-gray-500 py-2">Cancel</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "care" && (
          <>
            {/* ── Apply Fertilizer ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧪</span>
                  <h3 className="font-bold text-gray-700">Fertilizer</h3>
                </div>
                <button
                  onClick={() => setShowFertModal(true)}
                  className="bg-emerald-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700"
                >
                  Apply
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                Last fed: {feedDaysAgo === 0 ? "today" : `${feedDaysAgo}d ago`}
                {feedStatus === "overdue" && <span className="text-red-500 ml-1 font-semibold">· Overdue</span>}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`${hl.bar} h-2 rounded-full transition-all`} style={{ width: `${health}%` }} />
                </div>
                <span className={`text-xs font-bold ${hl.colour}`}>{hl.icon} {health}%</span>
              </div>
              {fertilizers.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">No fertilizers saved yet — add some in the 🧪 Nutrients tab.</p>
              )}
            </div>

            {/* Fertilizer apply modal */}
            {showFertModal && (
              <ApplyFertModal
                entry={entry}
                db={db}
                fertilizers={fertilizers}
                onApply={(fert) => {
                  const score = calcNPKScore(db.category, fert.npk);
                  const boost = npkHealthBoost(score);
                  const newHealth = Math.min(100, (entry.health ?? 75) + boost);
                  logAction(
                    `🧪 Applied ${fert.name} (N${fert.npk.n}-P${fert.npk.p}-K${fert.npk.k}). NPK match: ${score}%. Health: ${entry.health ?? 75}% → ${newHealth}%.`,
                    { lastFed: new Date().toISOString(), health: newHealth },
                    `${fert.name} applied! Health +${boost} 🧪`,
                    "🧪",
                    "fert"
                  );
                  setShowFertModal(false);
                }}
                onClose={() => setShowFertModal(false)}
              />
            )}

            {/* ── Auto Watering ── */}
            {(() => {
              const autoOn = entry.autoWater?.enabled || false;
              const freq = entry.autoWater?.frequencyDays || db.waterDays;
              const nextWaterIn = Math.max(0, freq - waterDaysAgo);
              const nextWaterDate = addDays(new Date(), nextWaterIn);

              function setAutoWater(updates) {
                onUpdate({
                  ...entry,
                  autoWater: { enabled: autoOn, frequencyDays: freq, ...entry.autoWater, ...updates },
                  // When enabling, reset lastWatered to now so reminder is clear
                  ...(updates.enabled === true && !autoOn
                    ? { lastWatered: new Date().toISOString(),
                        logs: [{ date: new Date().toISOString(), text: "💦 Auto-watering enabled. Sprinkler activated." }, ...(entry.logs || [])] }
                    : {}),
                  ...(updates.enabled === false && autoOn
                    ? { logs: [{ date: new Date().toISOString(), text: "💦 Auto-watering disabled." }, ...(entry.logs || [])] }
                    : {}),
                });
              }

              return (
                <div className={`rounded-2xl border p-4 ${autoOn ? "bg-blue-50 border-blue-300" : "bg-white border-gray-100 shadow-sm"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💦</span>
                      <span className="font-bold text-gray-800">Auto Watering</span>
                      {autoOn && <span className="text-xs bg-blue-500 text-white px-2 rounded-full">Active</span>}
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() => setAutoWater({ enabled: !autoOn })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${autoOn ? "bg-blue-500" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${autoOn ? "left-6" : "left-0.5"}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {autoOn ? "Sprinkler handles watering — reminders are cleared automatically." : "Enable to let a sprinkler manage watering on a schedule."}
                  </p>

                  {autoOn && (
                    <>
                      {/* Frequency picker */}
                      <div className="bg-white rounded-xl p-3 mb-3">
                        <div className="text-xs font-semibold text-gray-600 mb-2">Sprinkler runs every</div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setAutoWater({ frequencyDays: Math.max(1, freq - 1) })}
                            className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-lg hover:bg-blue-200 flex items-center justify-center"
                          >−</button>
                          <div className="flex-1 text-center">
                            <div className="text-2xl font-bold text-gray-800">{freq}</div>
                            <div className="text-xs text-gray-400">day{freq > 1 ? "s" : ""}</div>
                          </div>
                          <button
                            onClick={() => setAutoWater({ frequencyDays: Math.min(14, freq + 1) })}
                            className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-lg hover:bg-blue-200 flex items-center justify-center"
                          >+</button>
                        </div>
                        {/* Quick presets */}
                        <div className="flex gap-2 mt-2 justify-center">
                          {[1, 2, 3, 7].map(d => (
                            <button key={d} onClick={() => setAutoWater({ frequencyDays: d })}
                              className={`text-xs px-2 py-1 rounded-full border transition-colors ${freq === d ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-500 border-gray-200 hover:border-blue-400"}`}>
                              {d === 1 ? "Daily" : d === 7 ? "Weekly" : `${d}d`}
                            </button>
                          ))}
                        </div>
                        {db.waterDays !== freq && (
                          <p className="text-xs text-amber-600 mt-2 text-center">
                            ⚠️ Recommended for {db.name} is every {db.waterDays} day{db.waterDays > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>

                      {/* Next watering info */}
                      <div className="bg-blue-100 rounded-xl px-3 py-2 flex items-center gap-2">
                        <span className="text-xl">💦</span>
                        <div>
                          <div className="text-sm font-semibold text-blue-800">
                            {nextWaterIn === 0 ? "Sprinkler runs today" : `Next run in ${nextWaterIn} day${nextWaterIn > 1 ? "s" : ""}`}
                          </div>
                          <div className="text-xs text-blue-600">{fmt(nextWaterDate)}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── Manual water (shown always, grayed when auto is on) ── */}
            {(() => {
              const autoOn = entry.autoWater?.enabled;
              return (
                <div className={`rounded-2xl p-4 border transition-opacity ${autoOn ? "opacity-40" : waterStatus === "overdue" ? "bg-red-50 border-red-300" : waterStatus === "due" ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-200"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💧</span>
                        <span className="font-bold text-gray-800">Manual Watering</span>
                        {!autoOn && waterStatus === "overdue" && <span className="text-xs bg-red-500 text-white px-2 rounded-full">Overdue</span>}
                        {!autoOn && waterStatus === "due" && <span className="text-xs bg-amber-500 text-white px-2 rounded-full">Due today</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {autoOn ? "Managed by sprinkler" : `Last watered: ${waterDaysAgo === 0 ? "today" : `${waterDaysAgo}d ago`} · Every ${db.waterDays} day${db.waterDays > 1 ? "s" : ""}`}
                      </div>
                    </div>
                    <RippleBtn
                      disabled={autoOn}
                      onClick={() => logAction("💧 Watered plant.", { lastWatered: new Date().toISOString() }, "Watered! 💧", "💧", "water")}
                      className="bg-blue-500 text-white text-sm px-3 py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Log water
                    </RippleBtn>
                  </div>
                </div>
              );
            })()}

            {/* Feed */}
            <div className={`rounded-2xl p-4 border ${feedStatus === "overdue" ? "bg-red-50 border-red-300" : feedStatus === "due" ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <span className="font-bold text-gray-800">Feeding</span>
                    {feedStatus === "overdue" && <span className="text-xs bg-red-500 text-white px-2 rounded-full">Overdue</span>}
                    {feedStatus === "due" && <span className="text-xs bg-amber-500 text-white px-2 rounded-full">Due today</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Last fed: {feedDaysAgo === 0 ? "today" : `${feedDaysAgo}d ago`} · Every 14 days</div>
                </div>
                <RippleBtn
                  onClick={() => logAction("🌿 Fed plant.", { lastFed: new Date().toISOString() }, "Feeding logged! 🌿", "🌿", "success")}
                  className="bg-green-500 text-white text-sm px-3 py-2 rounded-lg font-semibold hover:bg-green-600"
                >
                  Log feed
                </RippleBtn>
              </div>
            </div>

            {/* Quick care actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-3">Log Activity</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "✂️ Pruned",       text: "✂️ Pruned plant.",            toast: "Pruned! ✂️" },
                  { label: "🪱 Treated pests", text: "🪱 Treated for pests.",       toast: "Pests treated! 🪱" },
                  { label: "🪣 Repotted",      text: "🪣 Repotted into fresh soil.", toast: "Repotted! 🪣" },
                  { label: "📏 Measured",      text: "📏 Measured growth.",         toast: "Growth measured! 📏" },
                ].map(a => (
                  <RippleBtn
                    key={a.label}
                    onClick={() => logAction(a.text, {}, a.toast, "✅", "success")}
                    className="bg-gray-50 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    {a.label}
                  </RippleBtn>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={logText} onChange={e => setLogText(e.target.value)}
                  placeholder="Custom note…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  onKeyDown={e => { if (e.key === "Enter" && logText.trim()) { logAction(logText.trim(), {}, "Note added! 📝", "📝"); setLogText(""); } }}
                />
                <RippleBtn
                  onClick={() => { if (logText.trim()) { logAction(logText.trim(), {}, "Note added! 📝", "📝"); setLogText(""); } }}
                  disabled={!logText.trim()}
                  className="bg-green-600 text-white px-3 rounded-lg text-sm font-semibold disabled:opacity-40"
                >
                  Add
                </RippleBtn>
              </div>
            </div>
          </>
        )}

        {tab === "advice" && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-3">💡 Personalised Recommendations</h3>
              <p className="text-xs text-gray-500 mb-3">Based on {entry.nickname} being {age} days old ({stage.name} stage)</p>
              <div className="space-y-3">
                {activeTips.map((tip, i) => (
                  <div key={i} className="flex gap-2 bg-green-50 rounded-xl p-3">
                    <span className="text-green-600 font-bold text-sm">{i + 1}</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-2">🌾 Harvest Guide</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{db.harvest}</p>
              {daysLeft > 0 && (
                <div className="mt-3 bg-amber-50 rounded-lg p-2 text-xs text-amber-700">
                  ⏳ Estimated harvest: <strong>{fmt(harvestDate)}</strong> ({daysLeft} days away)
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-2">☀️ Growing Conditions</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Light requirement</span><span className="font-semibold">{db.sunNeeds}</span></div>
                <div className="flex justify-between"><span>Water frequency</span><span className="font-semibold">Every {db.waterDays} day{db.waterDays > 1 ? "s" : ""}</span></div>
                <div className="flex justify-between"><span>Expected lifespan</span><span className="font-semibold">{db.daysToHarvest < 365 ? `${db.daysToHarvest} days` : "Perennial"}</span></div>
              </div>
            </div>
          </>
        )}

        {tab === "log" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-3">📓 Activity Log</h3>
            {(!entry.logs || entry.logs.length === 0) ? (
              <p className="text-sm text-gray-400 text-center py-4">No activities logged yet.</p>
            ) : (
              <div className="space-y-2">
                {entry.logs.map((log, i) => (
                  <div key={i} className={`flex gap-3 py-2 border-b border-gray-50 last:border-0 ${i === 0 ? "anim-fadeInDown" : ""}`}>
                    <div className="text-xs text-gray-400 whitespace-nowrap pt-0.5">{fmt(log.date)}</div>
                    <div className="text-sm text-gray-700">{log.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Fertilizer: Apply modal ──────────────────────────────────────────────────
function ApplyFertModal({ entry, db, fertilizers, onApply, onClose }) {
  const [selected, setSelected] = useState(null);

  const fert = selected ? fertilizers.find(f => f.id === selected) : null;
  const score = fert ? calcNPKScore(db.category, fert.npk) : null;
  const boost = fert ? npkHealthBoost(score) : 0;
  const newHealth = fert ? Math.min(100, (entry.health ?? 75) + boost) : null;
  const hl = fert ? healthLabel(Math.min(100, (entry.health ?? 75) + boost)) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl modal-sheet flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        <div className="px-4 pb-2 flex-shrink-0">
          <h3 className="font-bold text-gray-800">Apply Fertilizer to {entry.nickname}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Ideal for {db.name}: {(() => {
            const i = NPK_IDEAL[db.category] || NPK_IDEAL["Vegetable"];
            return `High ${i.n >= 45 ? "N (nitrogen)" : i.p >= 45 ? "P (phosphorus)" : i.k >= 45 ? "K (potassium)" : "balanced NPK"}`;
          })()}</p>
        </div>

        {fertilizers.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <div className="text-4xl mb-2">🧪</div>
            <p className="text-sm">No fertilizers saved yet.</p>
            <p className="text-xs mt-1">Add some in the Nutrients tab first.</p>
          </div>
        ) : (
          <div className="overflow-y-auto px-4 pb-6 space-y-2">
            {fertilizers.map(f => {
              const s = calcNPKScore(db.category, f.npk);
              const isSelected = selected === f.id;
              const matchColour = s >= 80 ? "text-green-600 bg-green-50 border-green-300"
                : s >= 60 ? "text-yellow-600 bg-yellow-50 border-yellow-300"
                : "text-orange-500 bg-orange-50 border-orange-200";
              return (
                <button
                  key={f.id}
                  onClick={() => setSelected(isSelected ? null : f.id)}
                  className={`w-full rounded-xl border-2 p-3 text-left transition-all ${isSelected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: f.color + "33", border: `2px solid ${f.color}` }}>
                      🧪
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.brand && `${f.brand} · `}{f.type}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs font-mono bg-blue-100 text-blue-700 px-1.5 rounded">N{f.npk.n}</span>
                        <span className="text-xs font-mono bg-green-100 text-green-700 px-1.5 rounded">P{f.npk.p}</span>
                        <span className="text-xs font-mono bg-orange-100 text-orange-700 px-1.5 rounded">K{f.npk.k}</span>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg border ${matchColour}`}>
                      {s}% match
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Preview effect */}
            {fert && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-2">
                <div className="font-semibold text-emerald-800 text-sm mb-1">Effect on {entry.nickname}</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">{healthLabel(entry.health ?? 75).icon} {entry.health ?? 75}%</span>
                  <span className="text-gray-400">→</span>
                  <span className={`font-bold ${hl.colour}`}>{hl.icon} {newHealth}%</span>
                  <span className="text-xs text-emerald-600 font-semibold ml-auto">+{boost} health</span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={newHealth} colour={hl.bar} />
                </div>
                {score < 60 && (
                  <p className="text-xs text-orange-600 mt-2">⚠️ Low NPK match for {db.name}. A more targeted fertilizer would give better results.</p>
                )}
              </div>
            )}

            <RippleBtn
              onClick={() => fert && onApply(fert)}
              disabled={!fert}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-40 mt-2"
            >
              Apply {fert ? fert.name : "fertilizer"} 🧪
            </RippleBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fertilizer: Add/Edit modal ───────────────────────────────────────────────
function AddFertilizerModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("Liquid");
  const [n, setN] = useState(10);
  const [p, setP] = useState(10);
  const [k, setK] = useState(10);
  const [color, setColor] = useState(FERT_COLOURS[0]);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const total = n + p + k;
  const pctN = total > 0 ? Math.round(n/total*100) : 0;
  const pctP = total > 0 ? Math.round(p/total*100) : 0;
  const pctK = total > 0 ? Math.round(k/total*100) : 0;

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ id: randomId(), name: name.trim(), brand: brand.trim(), type, npk: { n, p, k }, color, notes, photo, added: new Date().toISOString() });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
        <div className="p-4 space-y-4 pb-8">
          <h2 className="font-bold text-gray-800 text-lg">Add Fertilizer</h2>

          {/* Photo scan */}
          <div className="flex gap-3">
            <div
              onClick={() => fileRef.current.click()}
              className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0 ${photo ? "border-green-400" : "border-gray-300"}`}
            >
              {photo ? <img src={photo} className="w-full h-full object-cover rounded-xl" alt="" /> : <>
                <span className="text-2xl">📷</span>
                <span className="text-xs text-gray-400 mt-0.5">Scan label</span>
              </>}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
            </div>
            <div className="flex-1 space-y-2">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Fertilizer name *"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand (optional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Type</label>
            <div className="flex flex-wrap gap-2">
              {FERT_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${type === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* NPK sliders */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 text-sm">NPK Ratio</span>
              <span className="text-xs text-gray-400">from the label (e.g. 10-5-8)</span>
            </div>
            {[
              { key: "N", val: n, set: setN, colour: "bg-blue-500", label: "Nitrogen (N)", hint: "Leaf & stem growth" },
              { key: "P", val: p, set: setP, colour: "bg-green-500", label: "Phosphorus (P)", hint: "Roots & flowers" },
              { key: "K", val: k, set: setK, colour: "bg-orange-500", label: "Potassium (K)", hint: "Fruit & disease resistance" },
            ].map(({ key, val, set, colour, label, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">{label}</span>
                  <span className="text-xs text-gray-400">{hint}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => set(v => Math.max(0, v-1))} className="w-7 h-7 rounded-full bg-gray-200 font-bold hover:bg-gray-300 flex items-center justify-center text-sm">−</button>
                  <div className="flex-1">
                    <input type="range" min={0} max={50} value={val} onChange={e => set(Number(e.target.value))}
                      className="w-full accent-emerald-600" />
                  </div>
                  <button onClick={() => set(v => Math.min(50, v+1))} className="w-7 h-7 rounded-full bg-gray-200 font-bold hover:bg-gray-300 flex items-center justify-center text-sm">+</button>
                  <span className="font-bold text-gray-800 w-5 text-center text-sm">{val}</span>
                </div>
              </div>
            ))}
            {/* NPK ratio bar */}
            {total > 0 && (
              <div>
                <div className="flex rounded-full overflow-hidden h-3">
                  <div className="bg-blue-500 h-3 transition-all" style={{ width: `${pctN}%` }} />
                  <div className="bg-green-500 h-3 transition-all" style={{ width: `${pctP}%` }} />
                  <div className="bg-orange-500 h-3 transition-all" style={{ width: `${pctK}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500">
                  <span className="text-blue-600">N {pctN}%</span>
                  <span className="text-green-600">P {pctP}%</span>
                  <span className="text-orange-600">K {pctK}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Colour picker */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-2">Colour tag</label>
            <div className="flex gap-2">
              {FERT_COLOURS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-gray-600 scale-110" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />

          <button onClick={handleSave} disabled={!name.trim() || total === 0}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-40">
            Save Fertilizer 🧪
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Nutrients tab ─────────────────────────────────────────────────────────────
function NutrientsView({ fertilizers, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-lg">My Fertilizers</h2>
        <button onClick={() => setShowAdd(true)}
          className="bg-emerald-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1">
          + Add
        </button>
      </div>

      {/* NPK legend */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-700">
        <span className="flex items-center gap-1 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 inline-block"></span> N = Nitrogen (leaf)</span>
        <span className="flex items-center gap-1 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 inline-block"></span> P = Phosphorus (root/flower)</span>
        <span className="flex items-center gap-1 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 inline-block"></span> K = Potassium (fruit)</span>
      </div>

      {fertilizers.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-3">🧪</div>
          <p className="font-semibold text-gray-700 mb-1">No fertilizers yet</p>
          <p className="text-sm text-gray-400 mb-4">Scan a label or enter NPK values manually to get started.</p>
          <button onClick={() => setShowAdd(true)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold text-sm">Add Fertilizer</button>
        </div>
      ) : (
        <div className="space-y-3">
          {fertilizers.map(f => {
            const total = f.npk.n + f.npk.p + f.npk.k;
            const pN = total > 0 ? f.npk.n/total*100 : 33;
            const pP = total > 0 ? f.npk.p/total*100 : 33;
            const pK = total > 0 ? f.npk.k/total*100 : 34;
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                    style={{ background: f.color + "22", border: `2px solid ${f.color}` }}>
                    {f.photo ? <img src={f.photo} className="w-full h-full object-cover" alt="" /> : "🧪"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-800">{f.name}</div>
                        <div className="text-xs text-gray-500">{f.brand && `${f.brand} · `}{f.type}</div>
                      </div>
                      <button onClick={() => setDeleteId(f.id)} className="text-gray-300 hover:text-red-400 text-lg flex-shrink-0">🗑</button>
                    </div>
                    {/* NPK badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded whitespace-nowrap">N{f.npk.n}</span>
                      <span className="text-xs font-mono font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded whitespace-nowrap">P{f.npk.p}</span>
                      <span className="text-xs font-mono font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded whitespace-nowrap">K{f.npk.k}</span>
                    </div>
                    {/* NPK bar */}
                    <div className="flex rounded-full overflow-hidden h-2 mt-2">
                      <div className="bg-blue-500" style={{ width: `${pN}%` }} />
                      <div className="bg-green-500" style={{ width: `${pP}%` }} />
                      <div className="bg-orange-500" style={{ width: `${pK}%` }} />
                    </div>
                    {f.notes && <p className="text-xs text-gray-400 mt-1 truncate">{f.notes}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddFertilizerModal
          onSave={f => { onAdd(f); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-white w-full rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-2">Delete this fertilizer?</h3>
            <p className="text-sm text-gray-500 mb-4">It will be removed from your library.</p>
            <button onClick={() => { onDelete(deleteId); setDeleteId(null); }} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold mb-2">Delete</button>
            <button onClick={() => setDeleteId(null)} className="w-full text-gray-500 py-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Planner: compatibility helpers ───────────────────────────────────────────

/** Returns "good" | "bad" | "neutral" for two plantIds */
function getCompatibility(idA, idB) {
  if (!idA || !idB || idA === idB) return "neutral";
  const a = PLANT_DB[idA];
  const b = PLANT_DB[idB];
  if (!a || !b) return "neutral";
  const aName = a.name.toLowerCase();
  const bName = b.name.toLowerCase();
  const aComp = (a.companions || []).map(c => c.toLowerCase());
  const aAvoid = (a.avoid || []).map(c => c.toLowerCase());
  const bComp = (b.companions || []).map(c => c.toLowerCase());
  const bAvoid = (b.avoid || []).map(c => c.toLowerCase());
  const isGood = aComp.some(c => bName.includes(c) || c.includes(bName))
    || bComp.some(c => aName.includes(c) || c.includes(aName));
  const isBad = aAvoid.some(c => bName.includes(c) || c.includes(bName))
    || bAvoid.some(c => aName.includes(c) || c.includes(aName));
  if (isBad) return "bad";
  if (isGood) return "good";
  return "neutral";
}

/** Get the 4 adjacent neighbour plantIds of cell (x,y) */
function getNeighbours(cells, w, h, x, y) {
  return [[-1,0],[1,0],[0,-1],[0,1]]
    .map(([dx,dy]) => [x+dx, y+dy])
    .filter(([nx,ny]) => nx >= 0 && ny >= 0 && nx < w && ny < h)
    .map(([nx,ny]) => cells[`${nx},${ny}`])
    .filter(Boolean);
}

/** Overall compat status of a planted cell with its neighbours */
function cellCompatStatus(cells, w, h, x, y) {
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
function scorePlantAgainstNeighbours(plantId, neighbourIds) {
  let score = 0;
  for (const nId of neighbourIds) {
    const c = getCompatibility(plantId, nId);
    if (c === "good") score += 3;
    if (c === "bad") score -= 5;
  }
  return score;
}

/** Return ranked suggestions for an empty cell */
function getSuggestions(cells, w, h, x, y) {
  const nbs = getNeighbours(cells, w, h, x, y);
  const allIds = Object.keys(PLANT_DB);
  const placed = new Set(Object.values(cells));
  return allIds
    .map(id => ({ id, score: scorePlantAgainstNeighbours(id, nbs) }))
    .sort((a, b) => b.score - a.score || PLANT_DB[a.id].name.localeCompare(PLANT_DB[b.id].name))
    .slice(0, 12);
}

const COMPAT_STYLE = {
  good:    { border: "2px solid #22c55e", background: "#f0fdf4" },
  bad:     { border: "2px solid #ef4444", background: "#fef2f2" },
  neutral: { border: "2px solid #e5e7eb", background: "#ffffff" },
  empty:   { border: "2px dashed #d1d5db", background: "#f9fafb" },
};
const COMPAT_DOT = { good: "🟢", bad: "🔴", neutral: "⚪" };
const COMPAT_LABEL = { good: "Compatible", bad: "Conflict", neutral: "Neutral" };

// ── Spacing helpers ───────────────────────────────────────────────────────────
const SPACING_DEFAULTS = {
  "Vegetable": 2, "Leafy Green": 1, "Brassica": 2,
  "Herb": 1, "Herb/Perennial": 2,
  "Root Vegetable": 1, "Fruit": 1, "Berry": 1,
  "Tree Fruit": 4, "Citrus": 3,
  "Flower/Annual": 1, "Flower/Perennial": 2,
  "Bulb": 1, "Shrub": 3, "Climber": 2, "Exotic": 2,
};

function getSpacingCells(plant) {
  return plant.spacingCells || SPACING_DEFAULTS[plant.category] || 1;
}
function spacingCm(plant)     { return getSpacingCells(plant) * 30; }
function spacingInches(plant) { return getSpacingCells(plant) * 12; }

/** All cell keys a plant would occupy if placed at (ax, ay) */
function plantFootprint(ax, ay, s) {
  const keys = [];
  for (let dy = 0; dy < s; dy++)
    for (let dx = 0; dx < s; dx++)
      keys.push(`${ax + dx},${ay + dy}`);
  return keys;
}

/** True if placing plant with spacing s at (ax, ay) fits in the grid and all cells are free */
function canPlace(cells, w, h, ax, ay, s) {
  if (ax + s > w || ay + s > h) return false;
  return plantFootprint(ax, ay, s).every(k => !cells[k]);
}

/** Place plant at anchor (ax, ay), marking all footprint cells */
function doPlace(cells, ax, ay, plantId, s) {
  const next = { ...cells };
  const anchorKey = `${ax},${ay}`;
  plantFootprint(ax, ay, s).forEach((k, i) => {
    next[k] = i === 0 ? plantId : `@${anchorKey}`;
  });
  return next;
}

/** Remove plant rooted at anchorKey, clearing all its footprint cells */
function doRemove(cells, anchorKey) {
  const [ax, ay] = anchorKey.split(",").map(Number);
  const plantId = cells[anchorKey];
  if (!plantId || plantId.startsWith("@")) return cells;
  const s = getSpacingCells(PLANT_DB[plantId] || {});
  const next = { ...cells };
  plantFootprint(ax, ay, s).forEach(k => delete next[k]);
  return next;
}

/** Resolve a cell key to its anchor key (handles both anchor and occupied cells) */
function resolveAnchor(cells, key) {
  const val = cells[key];
  if (!val) return null;
  if (val.startsWith("@")) return val.slice(1);
  return key;
}

/** Get the real plantId at any cell (follows @ references) */
function plantIdAt(cells, key) {
  const anchor = resolveAnchor(cells, key);
  return anchor ? cells[anchor] : null;
}

// ── Planner: Create Planter Box modal ────────────────────────────────────────
function CreatePlanterModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(3);
  const [unit, setUnit] = useState("cells"); // cells | cm | ft
  const cellSizeCm = 30;

  const displayW = unit === "cm" ? width * cellSizeCm : unit === "ft" ? (width * cellSizeCm / 30.48).toFixed(1) : width;
  const displayH = unit === "cm" ? height * cellSizeCm : unit === "ft" ? (height * cellSizeCm / 30.48).toFixed(1) : height;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4 modal-sheet" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-gray-800 text-lg">Create Planter Box</h2>

        <div>
          <label className="text-sm font-semibold text-gray-600 block mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Raised Bed 1, Herb Pot…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Width (columns)</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setWidth(w => Math.max(1, w-1))} className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg hover:bg-gray-200">−</button>
              <span className="font-bold text-gray-800 w-6 text-center">{width}</span>
              <button onClick={() => setWidth(w => Math.min(12, w+1))} className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg hover:bg-gray-200">+</button>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Height (rows)</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setHeight(h => Math.max(1, h-1))} className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg hover:bg-gray-200">−</button>
              <span className="font-bold text-gray-800 w-6 text-center">{height}</span>
              <button onClick={() => setHeight(h => Math.min(8, h+1))} className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg hover:bg-gray-200">+</button>
            </div>
          </div>
        </div>

        {/* Unit display */}
        <div className="bg-green-50 rounded-xl p-3 text-sm text-gray-700 flex items-center gap-3">
          <span className="text-2xl">📐</span>
          <div>
            <div className="font-semibold">{width} × {height} cells</div>
            <div className="text-xs text-gray-500">{width * cellSizeCm} cm × {height * cellSizeCm} cm &nbsp;·&nbsp; {(width * cellSizeCm / 30.48).toFixed(1)} ft × {(height * cellSizeCm / 30.48).toFixed(1)} ft</div>
            <div className="text-xs text-gray-400">Each cell = 30 cm / 1 sq ft</div>
          </div>
        </div>

        {/* Grid preview */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">Preview</div>
          <div className="overflow-x-auto pb-1">
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${width}, 28px)` }}>
              {Array.from({ length: width * height }).map((_, i) => (
                <div key={i} className="w-7 h-7 rounded border-2 border-dashed border-gray-200 bg-gray-50" />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => { if (!name.trim()) return; onSave({ id: randomId(), name: name.trim(), width, height, cells: {} }); }}
          disabled={!name.trim()}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40"
        >
          Create Planter Box 🌱
        </button>
        <button onClick={onClose} className="w-full text-gray-500 text-sm py-2">Cancel</button>
      </div>
    </div>
  );
}

// ── Planner: Cell action modal ────────────────────────────────────────────────
function CellModal({ box, x, y, onPlant, onRemove, onClose }) {
  const anchorKey = resolveAnchor(box.cells, `${x},${y}`);
  const plantId = anchorKey ? box.cells[anchorKey] : null;
  const isPlanted = !!plantId && !plantId.startsWith("@");
  const db = isPlanted ? PLANT_DB[plantId] : null;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("suggest");

  // Neighbouring plantIds for the anchor cell (or target cell if empty)
  const checkX = anchorKey ? parseInt(anchorKey.split(",")[0]) : x;
  const checkY = anchorKey ? parseInt(anchorKey.split(",")[1]) : y;
  const nbs = getNeighbours(box.cells, box.width, box.height, checkX, checkY)
    .map(v => (v && v.startsWith("@")) ? box.cells[v.slice(1)] : v)
    .filter(Boolean);

  const suggestions = getSuggestions(box.cells, box.width, box.height, x, y);
  const allPlants = Object.entries(PLANT_DB).map(([id, p]) => ({ id, ...p }));
  const filtered = allPlants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );
  const nbDetails = nbs.map(nId => ({
    id: nId, plant: PLANT_DB[nId],
    compat: getCompatibility(plantId, nId),
  })).filter(n => n.plant);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl modal-sheet flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {isPlanted ? (
          /* ── Planted cell ── */
          <div className="p-4 overflow-y-auto space-y-4 pb-8">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{db.emoji}</span>
              <div>
                <div className="font-bold text-gray-800 text-lg">{db.name}</div>
                <Badge text={db.category} />
                <div className="text-xs text-gray-400 mt-0.5">
                  {getSpacingCells(db)}×{getSpacingCells(db)} cells · {spacingCm(db)} cm · {spacingInches(db)} in
                </div>
              </div>
              <button onClick={onRemove} className="ml-auto text-red-400 hover:text-red-600 text-2xl">🗑</button>
            </div>

            {nbDetails.length > 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <h3 className="font-bold text-gray-700 mb-3">Compatibility with neighbours</h3>
                <div className="space-y-2">
                  {nbDetails.map(n => (
                    <div key={n.id} className="flex items-center gap-3">
                      <span className="text-2xl">{n.plant.emoji}</span>
                      <div className="flex-1 text-sm font-semibold text-gray-700">{n.plant.name}</div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${n.compat === "good" ? "bg-green-100 text-green-700" : n.compat === "bad" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                        {COMPAT_DOT[n.compat]} {COMPAT_LABEL[n.compat]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500 text-center">No planted neighbours yet</div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <h3 className="font-bold text-gray-700 mb-2">Companion planting</h3>
              <div className="text-xs text-gray-500 mb-1">✅ Grows well with</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {(db.companions || []).map(c => <span key={c} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{c}</span>)}
              </div>
              <div className="text-xs text-gray-500 mb-1">❌ Keep away from</div>
              <div className="flex flex-wrap gap-1">
                {(db.avoid || []).map(c => <span key={c} className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{c}</span>)}
              </div>
            </div>
            <button onClick={onRemove} className="w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50">
              Remove from planter
            </button>
          </div>
        ) : (
          /* ── Empty cell: plant picker ── */
          <div className="flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-4 pt-2 pb-2 flex-shrink-0">
              <h3 className="font-bold text-gray-800">Choose a plant — cell ({x},{y})</h3>
              <p className="text-xs text-gray-400 mt-0.5">Plants sized for this spot; grey = won't fit from here</p>
            </div>
            <div className="flex border-b border-gray-200 px-4 gap-4 flex-shrink-0">
              {["suggest","browse"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`pb-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-green-600 text-green-700" : "text-gray-400"}`}>
                  {t === "suggest" ? "⭐ Best picks" : "🔍 Browse all"}
                </button>
              ))}
            </div>

            {tab === "suggest" && (
              <div className="overflow-y-auto p-4 pb-8">
                {nbs.length === 0 && (
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600 mb-3">
                    No neighbours yet — showing top compatible plants. Plant some neighbours first for personalised suggestions.
                  </div>
                )}
                <div className="plant-pick-grid">
                  {suggestions.map(({ id, score }) => {
                    const p = PLANT_DB[id];
                    const s = getSpacingCells(p);
                    const fits = canPlace(box.cells, box.width, box.height, x, y, s);
                    const compat = nbs.length > 0 ? (score > 0 ? "good" : score < 0 ? "bad" : "neutral") : "neutral";
                    return (
                      <button key={id}
                        onClick={() => fits && onPlant(id)}
                        disabled={!fits}
                        className={`rounded-xl border-2 p-2 text-center transition-all ${fits ? "hover:shadow-md cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                        style={fits ? COMPAT_STYLE[compat] : { border: "2px solid #e5e7eb", background: "#f3f4f6" }}>
                        <div className="text-3xl">{p.emoji}</div>
                        <div className="text-xs font-semibold text-gray-700 mt-1 leading-tight">{p.name}</div>
                        <div className="text-xs text-gray-400">{s}×{s} · {spacingInches(p)}"</div>
                        {nbs.length > 0 && fits && <div className="text-xs mt-0.5">{COMPAT_DOT[compat]}</div>}
                        {!fits && <div className="text-xs text-gray-400 mt-0.5">won't fit</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "browse" && (
              <div className="flex flex-col overflow-hidden flex-1 min-h-0">
                <div className="px-4 py-2 flex-shrink-0">
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search plants…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    autoFocus />
                </div>
                <div className="overflow-y-auto px-4 pb-8">
                  <div className="plant-pick-grid">
                    {filtered.map(p => {
                      const s = getSpacingCells(p);
                      const fits = canPlace(box.cells, box.width, box.height, x, y, s);
                      const compat = nbs.length > 0 ? getCompatibility(p.id, nbs[0]) : "neutral";
                      return (
                        <button key={p.id}
                          onClick={() => fits && onPlant(p.id)}
                          disabled={!fits}
                          className={`rounded-xl border-2 p-2 text-center transition-all ${fits ? "hover:shadow-md cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                          style={fits ? COMPAT_STYLE[compat] : { border: "2px solid #e5e7eb", background: "#f3f4f6" }}>
                          <div className="text-3xl">{p.emoji}</div>
                          <div className="text-xs font-semibold text-gray-700 mt-1 leading-tight">{p.name}</div>
                          <div className="text-xs text-gray-400">{s}×{s} · {spacingInches(p)}"</div>
                          {nbs.length > 0 && fits && <div className="text-xs mt-0.5">{COMPAT_DOT[compat]}</div>}
                          {!fits && <div className="text-xs text-gray-400 mt-0.5">won't fit</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Planner: Planter Box Editor ───────────────────────────────────────────────
const CELL = 60;
const GAP  = 4;

function PlanterBoxEditor({ box, onUpdate, onDelete, onBack }) {
  const [activeCell, setActiveCell] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleCellClick(x, y) {
    const val = box.cells[`${x},${y}`];
    if (val && val.startsWith("@")) {
      const [ax, ay] = val.slice(1).split(",").map(Number);
      setActiveCell({ x: ax, y: ay });
    } else {
      setActiveCell({ x, y });
    }
  }

  function handlePlant(plantId) {
    const { x, y } = activeCell;
    const s = getSpacingCells(PLANT_DB[plantId] || {});
    if (!canPlace(box.cells, box.width, box.height, x, y, s)) return;
    onUpdate({ ...box, cells: doPlace(box.cells, x, y, plantId, s) });
    setActiveCell(null);
  }

  function handleRemove() {
    const anchorKey = resolveAnchor(box.cells, `${activeCell.x},${activeCell.y}`);
    if (!anchorKey) return;
    onUpdate({ ...box, cells: doRemove(box.cells, anchorKey) });
    setActiveCell(null);
  }

  // Only anchor cells represent real plants
  const anchorEntries = Object.entries(box.cells).filter(([, v]) => v && !v.startsWith("@"));
  const plantedCount = anchorEntries.length;
  let goodPairs = 0, badPairs = 0;
  for (let i = 0; i < anchorEntries.length; i++) {
    for (let j = i + 1; j < anchorEntries.length; j++) {
      const c = getCompatibility(anchorEntries[i][1], anchorEntries[j][1]);
      if (c === "good") goodPairs++;
      if (c === "bad") badPairs++;
    }
  }
  const gridW = box.width * CELL;
  const gridH = box.height * CELL;

  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-1 min-w-0">
          <span className="font-bold text-lg flex-1 min-w-0 truncate">{box.name}</span>
          <button onClick={() => setShowDeleteConfirm(true)} className="flex-shrink-0 text-white/60 hover:text-white">🗑</button>
        </div>
        <div className="text-emerald-200 text-xs flex flex-wrap gap-x-2">
          <span>{box.width}×{box.height} cells</span>
          <span>{box.width*30}×{box.height*30} cm</span>
          <span>{box.width*12}"×{box.height*12}"</span>
        </div>
        <div className="flex gap-3 mt-3">
          {[
            { label: "Plants", val: plantedCount, icon: "🪴" },
            { label: "Good pairs", val: goodPairs, icon: "🟢" },
            { label: "Conflicts", val: badPairs, icon: "🔴" },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-white/10 rounded-xl p-2 text-center">
              <div className="text-lg">{s.icon}</div>
              <div className="font-bold">{s.val}</div>
              <div className="text-xs text-emerald-200 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pt-3 pb-1 flex flex-wrap gap-3 text-xs text-gray-500">
        <span>🟢 Compatible</span><span>🔴 Conflict</span><span>⚪ Neutral</span>
        <span className="ml-auto text-gray-400">Tap any cell to plant</span>
      </div>

      {/* ── Spacing-aware grid ── */}
      <div className="px-4 overflow-x-auto pb-3">
        <div
          className="inline-block relative bg-amber-50 border-2 border-amber-300 rounded-xl"
          style={{ width: gridW + GAP * 2, height: gridH + GAP * 2, padding: GAP }}
        >
          {/* Empty cell buttons */}
          {Array.from({ length: box.height }).map((_, y) =>
            Array.from({ length: box.width }).map((_, x) => {
              const val = box.cells[`${x},${y}`];
              return (
                <button
                  key={`${x},${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className="absolute rounded-lg flex items-center justify-center transition-all active:scale-95"
                  style={{
                    left: x * CELL, top: y * CELL,
                    width: CELL - GAP, height: CELL - GAP,
                    ...(val ? { zIndex: 0 } : { ...COMPAT_STYLE.empty, zIndex: 1 }),
                  }}
                >
                  {!val && <span className="text-gray-300 text-xl">+</span>}
                </button>
              );
            })
          )}

          {/* Plant overlays — span their spacing footprint */}
          {anchorEntries.map(([key, plantId]) => {
            const [ax, ay] = key.split(",").map(Number);
            const p = PLANT_DB[plantId];
            if (!p) return null;
            const s = getSpacingCells(p);
            const status = cellCompatStatus(box.cells, box.width, box.height, ax, ay);
            return (
              <button
                key={key}
                onClick={() => handleCellClick(ax, ay)}
                className="absolute rounded-xl flex flex-col items-center justify-center shadow-sm font-bold transition-all hover:scale-[1.03] active:scale-95"
                style={{
                  left: ax * CELL, top: ay * CELL,
                  width: s * CELL - GAP, height: s * CELL - GAP,
                  zIndex: 2,
                  ...COMPAT_STYLE[status] || COMPAT_STYLE.neutral,
                }}
              >
                <span style={{ fontSize: s >= 3 ? "2.6rem" : s >= 2 ? "2rem" : "1.6rem", lineHeight: 1 }}>
                  {p.emoji}
                </span>
                {s >= 2 && <span className="text-xs font-semibold text-gray-700 mt-0.5 leading-none">{p.name}</span>}
                <span className="text-xs text-gray-400 leading-none">{spacingInches(p)}"</span>
                {status !== "neutral" && (
                  <span className="absolute top-1 right-1 text-sm leading-none">{COMPAT_DOT[status]}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacing note */}
      <div className="mx-4 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 mb-3">
        📐 Each cell = 30 cm (12 in). Plants automatically take up their recommended space.
      </div>

      {/* Plant list */}
      {plantedCount > 0 && (
        <div className="px-4 space-y-1">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">Plants in this box</h3>
          {anchorEntries.map(([key, pId]) => {
            const p = PLANT_DB[pId];
            if (!p) return null;
            const s = getSpacingCells(p);
            const [ax, ay] = key.split(",").map(Number);
            const status = cellCompatStatus(box.cells, box.width, box.height, ax, ay);
            return (
              <div key={key} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3 py-2">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-400">{s}×{s} cells · {spacingCm(p)} cm · {spacingInches(p)} in</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${status === "good" ? "bg-green-100 text-green-700" : status === "bad" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                  {COMPAT_DOT[status]} {COMPAT_LABEL[status]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {activeCell && (
        <CellModal box={box} x={activeCell.x} y={activeCell.y}
          onPlant={handlePlant} onRemove={handleRemove}
          onClose={() => setActiveCell(null)} />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white w-full rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-2">Delete "{box.name}"?</h3>
            <p className="text-sm text-gray-500 mb-4">All plants in this planter box will be removed.</p>
            <button onClick={onDelete} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold mb-2">Delete</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="w-full text-gray-500 py-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Planner: Dashboard (list of boxes) ───────────────────────────────────────
function PlannerDashboard({ boxes, onSelect, onCreate }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-lg">My Planter Boxes</h2>
        <button onClick={onCreate}
          className="bg-emerald-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-700">
          <span>+</span> New Box
        </button>
      </div>

      {boxes.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-3">📐</div>
          <p className="font-semibold text-gray-700 mb-1">No planter boxes yet</p>
          <p className="text-sm text-gray-400 mb-4">Design your beds and check plant compatibility before you sow.</p>
          <button onClick={onCreate} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold text-sm">Create Planter Box</button>
        </div>
      ) : (
        <div className="space-y-3">
          {boxes.map(box => {
            const planted = Object.keys(box.cells).length;
            const total = box.width * box.height;
            const pct = total > 0 ? Math.round((planted / total) * 100) : 0;
            // count conflicts
            let conflicts = 0;
            const keys = Object.keys(box.cells);
            for (let i = 0; i < keys.length; i++) {
              for (let j = i+1; j < keys.length; j++) {
                const [ax,ay] = keys[i].split(",").map(Number);
                const [bx,by] = keys[j].split(",").map(Number);
                if (Math.abs(ax-bx)+Math.abs(ay-by) === 1) {
                  if (getCompatibility(box.cells[keys[i]], box.cells[keys[j]]) === "bad") conflicts++;
                }
              }
            }
            // unique plants with emojis
            const uniqIds = [...new Set(Object.values(box.cells))].slice(0, 6);
            return (
              <button key={box.id} onClick={() => onSelect(box.id)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 w-full text-left hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 rounded-xl p-2 text-xl">🌱</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800">{box.name}</div>
                    <div className="text-xs text-gray-500">{box.width}×{box.height} cells · {box.width*30}×{box.height*30} cm</div>
                    <div className="mt-2 flex items-center gap-1 text-lg">
                      {uniqIds.map(id => <span key={id}>{PLANT_DB[id]?.emoji}</span>)}
                      {Object.keys(box.cells).length === 0 && <span className="text-xs text-gray-400">Empty — tap to plan</span>}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                        <span>{planted}/{total} cells planted</span>
                        {conflicts > 0 && <span className="text-red-500 font-semibold">⚠️ {conflicts} conflict{conflicts > 1 ? "s" : ""}</span>}
                        {conflicts === 0 && planted > 0 && <span className="text-green-500 font-semibold">✅ All compatible</span>}
                      </div>
                      <ProgressBar pct={pct} colour="bg-emerald-500" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Animation system ─────────────────────────────────────────────────────────

const ANIM_CSS = `
@keyframes ripple       { 0%{transform:scale(0);opacity:.5} 100%{transform:scale(5);opacity:0} }
@keyframes pop          { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 70%{transform:scale(.93)} 100%{transform:scale(1)} }
@keyframes bounceIn     { 0%{transform:scale(.2);opacity:0} 55%{transform:scale(1.12)} 75%{transform:scale(.93)} 100%{transform:scale(1);opacity:1} }
@keyframes slideUp      { from{transform:translateY(120%);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes slideDown    { from{transform:translateY(0);opacity:1} to{transform:translateY(120%);opacity:0} }
@keyframes fadeInDown   { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
@keyframes wiggle       { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(8deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(5deg)} }
@keyframes float        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes shimmer      { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes themeSwitch  { 0%{opacity:0;transform:scale(.8) rotate(-20deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
.anim-ripple      { animation: ripple .55s ease-out forwards; }
.anim-pop         { animation: pop .3s ease-out; }
.anim-bounceIn    { animation: bounceIn .45s cubic-bezier(.17,.67,.42,1.27) forwards; }
.anim-slideUp     { animation: slideUp .3s cubic-bezier(.22,1,.36,1) forwards; }
.anim-slideDown   { animation: slideDown .3s ease-in forwards; }
.anim-fadeInDown  { animation: fadeInDown .25s ease-out; }
.anim-wiggle      { animation: wiggle .5s ease-in-out; }
.anim-float       { animation: float 2.4s ease-in-out infinite; }
.anim-themeSwitch { animation: themeSwitch .3s ease-out; }

/* ── Dark mode overrides ── */
[data-dark], [data-dark] body { color-scheme: dark; background-color: #0f172a; }

/* Neutral backgrounds */
[data-dark] .bg-white        { background-color: #1e293b !important; }
[data-dark] .bg-gray-50      { background-color: #0f172a !important; }
[data-dark] .bg-gray-100     { background-color: #1e293b !important; }
[data-dark] .bg-gray-200     { background-color: #334155 !important; }

/* Coloured tint backgrounds — *-50 */
[data-dark] .bg-amber-50     { background-color: #1c1107 !important; }
[data-dark] .bg-green-50     { background-color: #052e16 !important; }
[data-dark] .bg-blue-50      { background-color: #0c1a2e !important; }
[data-dark] .bg-emerald-50   { background-color: #022c22 !important; }
[data-dark] .bg-red-50       { background-color: #2d0707 !important; }
[data-dark] .bg-yellow-50    { background-color: #1c1500 !important; }
[data-dark] .bg-purple-50    { background-color: #1a0a2e !important; }
[data-dark] .bg-teal-50      { background-color: #041d1a !important; }
[data-dark] .bg-orange-50    { background-color: #1c0a00 !important; }
[data-dark] .bg-pink-50      { background-color: #2d0a1a !important; }
[data-dark] .bg-lime-50      { background-color: #111b00 !important; }
[data-dark] .bg-indigo-50    { background-color: #0f0a2e !important; }
[data-dark] .bg-sky-50       { background-color: #041828 !important; }
[data-dark] .bg-rose-50      { background-color: #2d0514 !important; }
[data-dark] .bg-fuchsia-50   { background-color: #2d0830 !important; }
[data-dark] .bg-cyan-50      { background-color: #041d28 !important; }
[data-dark] .bg-violet-50    { background-color: #130a2e !important; }

/* Coloured badge backgrounds — *-100 */
[data-dark] .bg-amber-100    { background-color: #291f00 !important; }
[data-dark] .bg-green-100    { background-color: #14532d !important; }
[data-dark] .bg-blue-100     { background-color: #1e3a5f !important; }
[data-dark] .bg-emerald-100  { background-color: #064e3b !important; }
[data-dark] .bg-red-100      { background-color: #450a0a !important; }
[data-dark] .bg-yellow-100   { background-color: #292000 !important; }
[data-dark] .bg-orange-100   { background-color: #431407 !important; }
[data-dark] .bg-purple-100   { background-color: #2e1065 !important; }
[data-dark] .bg-teal-100     { background-color: #042f2e !important; }
[data-dark] .bg-cyan-100     { background-color: #083344 !important; }
[data-dark] .bg-pink-100     { background-color: #500724 !important; }
[data-dark] .bg-rose-100     { background-color: #4c0519 !important; }
[data-dark] .bg-lime-100     { background-color: #1a2e05 !important; }
[data-dark] .bg-violet-100   { background-color: #2e1065 !important; }
[data-dark] .bg-fuchsia-100  { background-color: #4a044e !important; }
[data-dark] .bg-indigo-100   { background-color: #1e1b4b !important; }
[data-dark] .bg-sky-100      { background-color: #082f49 !important; }

/* Neutral text */
[data-dark] .text-gray-800   { color: #f1f5f9 !important; }
[data-dark] .text-gray-700   { color: #e2e8f0 !important; }
[data-dark] .text-gray-600   { color: #cbd5e1 !important; }
[data-dark] .text-gray-500   { color: #94a3b8 !important; }
[data-dark] .text-gray-400   { color: #64748b !important; }
[data-dark] .text-gray-300   { color: #475569 !important; }
[data-dark] .text-white      { color: #ffffff !important; }

/* Coloured text — lighten dark shades so they're readable on dark backgrounds */
[data-dark] .text-green-600  { color: #86efac !important; }
[data-dark] .text-green-700  { color: #86efac !important; }
[data-dark] .text-green-800  { color: #4ade80 !important; }
[data-dark] .text-emerald-600{ color: #6ee7b7 !important; }
[data-dark] .text-emerald-700{ color: #34d399 !important; }
[data-dark] .text-emerald-800{ color: #10b981 !important; }
[data-dark] .text-teal-700   { color: #5eead4 !important; }
[data-dark] .text-blue-500   { color: #93c5fd !important; }
[data-dark] .text-blue-600   { color: #93c5fd !important; }
[data-dark] .text-blue-700   { color: #93c5fd !important; }
[data-dark] .text-blue-800   { color: #60a5fa !important; }
[data-dark] .text-indigo-700 { color: #a5b4fc !important; }
[data-dark] .text-violet-700 { color: #c4b5fd !important; }
[data-dark] .text-purple-600 { color: #d8b4fe !important; }
[data-dark] .text-purple-700 { color: #c4b5fd !important; }
[data-dark] .text-fuchsia-700{ color: #f0abfc !important; }
[data-dark] .text-pink-700   { color: #f9a8d4 !important; }
[data-dark] .text-rose-700   { color: #fda4af !important; }
[data-dark] .text-red-500    { color: #fca5a5 !important; }
[data-dark] .text-red-600    { color: #f87171 !important; }
[data-dark] .text-red-700    { color: #f87171 !important; }
[data-dark] .text-orange-500 { color: #fdba74 !important; }
[data-dark] .text-orange-600 { color: #fb923c !important; }
[data-dark] .text-orange-700 { color: #fdba74 !important; }
[data-dark] .text-amber-600  { color: #fcd34d !important; }
[data-dark] .text-amber-700  { color: #fcd34d !important; }
[data-dark] .text-amber-800  { color: #fbbf24 !important; }
[data-dark] .text-yellow-600 { color: #fde047 !important; }
[data-dark] .text-yellow-700 { color: #facc15 !important; }
[data-dark] .text-lime-700   { color: #bef264 !important; }
[data-dark] .text-cyan-700   { color: #67e8f9 !important; }
[data-dark] .text-sky-700    { color: #7dd3fc !important; }

/* Borders */
[data-dark] .border-gray-100 { border-color: #334155 !important; }
[data-dark] .border-gray-200 { border-color: #475569 !important; }
[data-dark] .border-gray-300 { border-color: #64748b !important; }
[data-dark] .border-dashed   { border-color: #475569 !important; }
[data-dark] .border-amber-200{ border-color: #44330a !important; }
[data-dark] .border-amber-300{ border-color: #664d0f !important; }
[data-dark] .border-green-200{ border-color: #14532d !important; }
[data-dark] .border-green-300{ border-color: #166534 !important; }
[data-dark] .border-blue-200 { border-color: #1e3a5f !important; }
[data-dark] .border-blue-300 { border-color: #1d4ed8 !important; }
[data-dark] .border-red-200  { border-color: #7f1d1d !important; }
[data-dark] .border-red-300  { border-color: #991b1b !important; }
[data-dark] .border-emerald-200{ border-color: #064e3b !important; }
[data-dark] .border-emerald-300{ border-color: #065f46 !important; }
[data-dark] .border-purple-200{ border-color: #3b0764 !important; }

/* Shadows */
[data-dark] .shadow-sm  { box-shadow: 0 1px 3px rgba(0,0,0,.6) !important; }
[data-dark] .shadow-md  { box-shadow: 0 4px 12px rgba(0,0,0,.6) !important; }
[data-dark] .shadow-lg  { box-shadow: 0 8px 24px rgba(0,0,0,.7) !important; }

/* Inputs */
[data-dark] input, [data-dark] textarea, [data-dark] select {
  background-color: #334155 !important;
  color: #f1f5f9 !important;
  border-color: #475569 !important;
}
[data-dark] input::placeholder, [data-dark] textarea::placeholder { color: #64748b !important; }
[data-dark] nav  { background-color: #1e293b !important; border-color: #334155 !important; }
[data-dark] input[type=range] { accent-color: #34d399; }

/* ── Responsive / mobile tweaks ── */

/* On very narrow phones (< 380px) compress padding and font sizes */
@media (max-width: 380px) {
  .resp-p   { padding: 0.75rem !important; }
  .resp-px  { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
  .resp-gap { gap: 0.5rem !important; }
}

/* Two-column plant grid on narrow screens; stays 3-col on wider */
.plant-pick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
@media (max-width: 340px) {
  .plant-pick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* Bottom nav — shrink labels on very small screens */
@media (max-width: 360px) {
  .bottom-nav-label { font-size: 9px !important; }
}

/* Ensure long text never blows out card widths */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Make sure modals don't exceed the viewport height */
.modal-sheet {
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
}

/* Fluid emoji sizing in plant hero */
@media (max-width: 360px) {
  .hero-emoji { font-size: 3rem !important; }
}
`;

// Inject / refresh animations — always overwrite so updates take effect
if (typeof document !== "undefined") {
  let el = document.getElementById("gt-animations");
  if (!el) { el = document.createElement("style"); el.id = "gt-animations"; document.head.appendChild(el); }
  el.textContent = ANIM_CSS;
}

// ── RippleBtn ─────────────────────────────────────────────────────────────────
function RippleBtn({ children, className = "", onClick, disabled, style, type }) {
  const [ripples, setRipples] = useState([]);

  function handleClick(e) {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
    onClick?.(e);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      style={style}
      className={`relative overflow-hidden select-none active:scale-95 transition-transform ${className}`}
      onClick={handleClick}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="anim-ripple absolute rounded-full bg-white/40 pointer-events-none"
          style={{ left: r.x - 16, top: r.y - 16, width: 32, height: 32 }}
        />
      ))}
      {children}
    </button>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-20 left-0 right-0 max-w-lg mx-auto px-4 z-[90] pointer-events-none space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`anim-slideUp flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg text-white text-sm font-semibold ${
            t.type === "success" ? "bg-emerald-600" :
            t.type === "water"   ? "bg-blue-500" :
            t.type === "warn"    ? "bg-amber-500" :
            t.type === "fert"    ? "bg-purple-600" :
            "bg-gray-700"
          }`}
        >
          <span className="text-xl flex-shrink-0">{t.icon}</span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── Confetti canvas ───────────────────────────────────────────────────────────
const CONF_COLORS = ["#22c55e","#16a34a","#f59e0b","#ef4444","#8b5cf6","#ec4899","#3b82f6","#06b6d4","#f97316","#84cc16"];
const CONF_EMOJI  = ["🌱","🍅","🌸","⭐","🌿","🎉","🌾","💚"];

function Confetti({ active, onDone }) {
  const canvasRef = useRef();
  const rafRef    = useRef();
  const pieces    = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    pieces.current = Array.from({ length: 140 }, (_, i) => ({
      x:        Math.random() * W,
      y:        -20 - Math.random() * 200,
      vx:       (Math.random() - .5) * 3,
      vy:       2.5 + Math.random() * 3,
      rot:      Math.random() * Math.PI * 2,
      rotV:     (Math.random() - .5) * .18,
      w:        i < 20 ? 10 : 7 + Math.random() * 8,
      h:        i < 20 ? 10 : 4 + Math.random() * 4,
      color:    CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
      emoji:    i < 16 ? CONF_EMOJI[i % CONF_EMOJI.length] : null,
      sway:     Math.random() * Math.PI * 2,
      swayAmp:  1.5 + Math.random() * 2,
      alpha:    1,
    }));

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;
      let alive = 0;
      for (const p of pieces.current) {
        p.vy  += .06;
        p.vx  += Math.sin(frame * .03 + p.sway) * .06;
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;
        if (p.y > H - 60) p.alpha = Math.max(0, p.alpha - .04);
        if (p.y < H + 40) alive++;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.emoji) {
          ctx.font = `${p.w + 8}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (alive > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        onDone?.();
      }
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 200 }}
    />
  );
}


// ── Bottom Tab Bar ────────────────────────────────────────────────────────────
function BottomNav({ tab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex z-40">
      {[
        { id: "garden",    label: "My Garden", icon: "🌱" },
        { id: "planner",   label: "Planner",   icon: "📐" },
        { id: "nutrients", label: "Nutrients",  icon: "🧪" },
      ].map(t => (
        <button key={t.id} onClick={() => onTabChange(t.id)}
          className={`relative flex-1 py-2.5 flex flex-col items-center gap-0.5 font-semibold transition-colors ${tab === t.id ? "text-green-700" : "text-gray-400 hover:text-gray-600"}`}>
          <span className="text-xl leading-none">{t.icon}</span>
          <span className="bottom-nav-label text-xs leading-tight">{t.label}</span>
          {tab === t.id && <div className="absolute bottom-0 inset-x-3 h-0.5 bg-green-600 rounded-full" />}
        </button>
      ))}
    </nav>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Persistent state — load from localStorage, fall back to defaults ──────
  const [plants, setPlants] = useState(() => {
    try { const s = localStorage.getItem("gt-plants"); return s ? JSON.parse(s) : INITIAL; }
    catch { return INITIAL; }
  });
  const [fertilizers, setFertilizers] = useState(() => {
    try { const s = localStorage.getItem("gt-fertilizers"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [tab, setTab] = useState("garden");
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("gt-darkmode") === "true"; }
    catch { return false; }
  });

  // Apply dark attribute to <html> so every element on the page is covered,
  // including fixed-position modals that escape any child container.
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.setAttribute("data-dark", "1");
    else root.removeAttribute("data-dark");
    return () => root.removeAttribute("data-dark");
  }, [darkMode]);

  // Animation state
  const [toasts, setToasts]           = useState([]);
  const [confettiOn, setConfettiOn]   = useState(false);
  const [celebrated, setCelebrated]   = useState(() => {
    try { const s = localStorage.getItem("gt-celebrated"); return s ? new Set(JSON.parse(s)) : new Set(); }
    catch { return new Set(); }
  });
  const toastTimers = useRef({});

  function pushToast(message, icon = "✅", type = "success", duration = 2800) {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, icon, type }]);
    toastTimers.current[id] = setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, duration);
  }

  // Watch for plants hitting 100% — fire confetti once each
  useEffect(() => {
    const today = new Date();
    plants.forEach(p => {
      const db = PLANT_DB[p.plantId];
      if (!db) return;
      const pct = overallProgress(db, daysBetween(new Date(p.plantedDate), today));
      if (pct >= 100 && !celebrated.has(p.id)) {
        setCelebrated(prev => new Set([...prev, p.id]));
        setConfettiOn(true);
        pushToast(`${db.emoji} ${p.nickname} is ready to harvest! 🎉`, "🎉", "success", 4000);
      }
    });
  }, [plants]); // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState("dashboard"); // dashboard | add | profile
  const [selectedId, setSelectedId] = useState(null);

  // Planner state
  const [planterBoxes, setPlanterBoxes] = useState(() => {
    try { const s = localStorage.getItem("gt-planterboxes"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [showCreatePlanter, setShowCreatePlanter] = useState(false);
  const [plannerView, setPlannerView] = useState("list"); // list | box

  // ── Persist all user data to localStorage on every change ─────────────────
  useEffect(() => { try { localStorage.setItem("gt-plants",      JSON.stringify(plants));      } catch {} }, [plants]);
  useEffect(() => { try { localStorage.setItem("gt-fertilizers", JSON.stringify(fertilizers)); } catch {} }, [fertilizers]);
  useEffect(() => { try { localStorage.setItem("gt-planterboxes",JSON.stringify(planterBoxes));} catch {} }, [planterBoxes]);
  useEffect(() => { try { localStorage.setItem("gt-darkmode",    String(darkMode));             } catch {} }, [darkMode]);
  useEffect(() => { try { localStorage.setItem("gt-celebrated",  JSON.stringify([...celebrated])); } catch {} }, [celebrated]);

  // ── Auto-watering engine: runs on mount + whenever plants change ──────────
  useEffect(() => {
    const today = new Date();
    setPlants(prev => prev.map(plant => {
      if (!plant.autoWater?.enabled) return plant;
      const freq = plant.autoWater.frequencyDays || PLANT_DB[plant.plantId]?.waterDays || 2;
      const daysAgo = daysBetween(new Date(plant.lastWatered), today);
      if (daysAgo < freq) return plant; // not due yet
      // Calculate how many complete cycles have elapsed, roll lastWatered forward
      const cyclesBehind = Math.floor(daysAgo / freq);
      const newLastWatered = addDays(new Date(plant.lastWatered), cyclesBehind * freq);
      // Add a log entry for each missed cycle (cap at 3 to avoid noise)
      const newLogs = [];
      for (let i = 0; i < Math.min(cyclesBehind, 3); i++) {
        const d = addDays(new Date(plant.lastWatered), (i + 1) * freq);
        newLogs.push({ date: d.toISOString(), text: "💦 Auto-watered by sprinkler." });
      }
      return {
        ...plant,
        lastWatered: newLastWatered.toISOString(),
        logs: [...newLogs, ...(plant.logs || [])],
      };
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addPlant(entry) {
    setPlants(prev => [...prev, entry]);
    setView("dashboard");
    const db = PLANT_DB[entry.plantId];
    pushToast(`${db?.emoji || "🌱"} ${entry.nickname} added to your garden!`, "🌱", "success");
  }
  function updatePlant(entry) { setPlants(prev => prev.map(p => p.id === entry.id ? entry : p)); }
  function deletePlant() {
    setPlants(prev => prev.filter(p => p.id !== selectedId));
    setView("dashboard");
  }

  function createBox(box) {
    setPlanterBoxes(prev => [...prev, box]);
    setShowCreatePlanter(false);
    setSelectedBoxId(box.id);
    setPlannerView("box");
  }
  function updateBox(box) { setPlanterBoxes(prev => prev.map(b => b.id === box.id ? box : b)); }
  function deleteBox() {
    setPlanterBoxes(prev => prev.filter(b => b.id !== selectedBoxId));
    setSelectedBoxId(null);
    setPlannerView("list");
  }
  function addFertilizer(f) { setFertilizers(prev => [...prev, f]); }
  function deleteFertilizer(id) { setFertilizers(prev => prev.filter(f => f.id !== id)); }

  const selected = plants.find(p => p.id === selectedId);
  const selectedBox = planterBoxes.find(b => b.id === selectedBoxId);

  // Back logic
  function handleBack() {
    if (view === "add" || view === "profile") { setView("dashboard"); return; }
    if (plannerView === "box") { setPlannerView("list"); setSelectedBoxId(null); return; }
  }

  const showBack = view !== "dashboard" || (tab === "planner" && plannerView === "box");
  const showAddBtn = tab === "garden" && view === "dashboard";
  const showNewBoxBtn = tab === "planner" && plannerView === "list";

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        {showBack && (
          <button onClick={handleBack} className="text-white/80 hover:text-white text-xl leading-none">←</button>
        )}
        <span className="text-2xl">🌱</span>
        <h1 className="font-bold text-lg flex-1 min-w-0 truncate">
          {tab === "planner" && plannerView === "box" && selectedBox ? selectedBox.name : "Garden Tracker"}
        </h1>
        {showAddBtn && (
          <RippleBtn onClick={() => setView("add")}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
            <span>+</span> Add Plant
          </RippleBtn>
        )}
        {showNewBoxBtn && (
          <RippleBtn onClick={() => setShowCreatePlanter(true)}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
            <span>+</span> New Box
          </RippleBtn>
        )}
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(d => !d)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          <span key={darkMode ? "moon" : "sun"} className="anim-themeSwitch text-lg leading-none">
            {darkMode ? "☀️" : "🌙"}
          </span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16">
        {tab === "garden" && (
          <>
            {view === "dashboard" && (
              <Dashboard plants={plants} onSelect={id => { setSelectedId(id); setView("profile"); }} onAdd={() => setView("add")} />
            )}
            {view === "add" && (
              <AddPlant onSave={addPlant} onCancel={() => setView("dashboard")} />
            )}
            {view === "profile" && selected && (
              <PlantProfile
                entry={selected}
                onUpdate={updatePlant}
                onDelete={deletePlant}
                fertilizers={fertilizers}
                onToast={pushToast}
              />
            )}
          </>
        )}

        {tab === "nutrients" && (
          <NutrientsView
            fertilizers={fertilizers}
            onAdd={addFertilizer}
            onDelete={deleteFertilizer}
          />
        )}

        {tab === "planner" && (
          <>
            {plannerView === "list" && (
              <PlannerDashboard
                boxes={planterBoxes}
                onSelect={id => { setSelectedBoxId(id); setPlannerView("box"); }}
                onCreate={() => setShowCreatePlanter(true)}
              />
            )}
            {plannerView === "box" && selectedBox && (
              <PlanterBoxEditor
                box={selectedBox}
                onUpdate={updateBox}
                onDelete={deleteBox}
                onBack={() => { setPlannerView("list"); setSelectedBoxId(null); }}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav tab={tab} onTabChange={t => { setTab(t); }} />

      {/* Create planter modal */}
      {showCreatePlanter && (
        <CreatePlanterModal onSave={createBox} onClose={() => setShowCreatePlanter(false)} />
      )}

      {/* ── Celebration overlay ── */}
      {confettiOn && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center z-[180] pointer-events-none"
        >
          <div className="anim-bounceIn rounded-3xl px-8 py-6 shadow-2xl text-center pointer-events-auto mx-4"
            style={{ background: darkMode ? "rgba(30,41,59,.95)" : "rgba(255,255,255,.95)", backdropFilter: "blur(12px)" }}>
            <div className="anim-wiggle text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Harvest Time!</h2>
            <p className="text-gray-500 text-sm mb-4">One of your plants is ready to pick 🌾</p>
            <RippleBtn
              onClick={() => setConfettiOn(false)}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold"
            >
              Woohoo! 🌱
            </RippleBtn>
          </div>
        </div>
      )}
      <Confetti active={confettiOn} onDone={() => {}} />

      {/* ── Toast stack ── */}
      <ToastStack toasts={toasts} />
    </div>
  );
}
