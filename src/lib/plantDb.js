// Plant database (250 plants). Custom plants from the online lookup are added at
// runtime via registerCustomPlant and persisted so saved entries still resolve.

// ── Plant database (250 plants) ─────────────────────────────────────────────
export const PLANT_DB = {
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

// ── Custom plants (from online lookup) persist separately so saved garden
// entries that reference them still resolve after a reload.
export const CUSTOM_PLANTS_KEY = "gt-customplants";
try { Object.assign(PLANT_DB, JSON.parse(localStorage.getItem(CUSTOM_PLANTS_KEY) || "{}")); } catch {}

export function registerCustomPlant(key, plant) {
  PLANT_DB[key] = plant;
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_PLANTS_KEY) || "{}");
    saved[key] = plant;
    localStorage.setItem(CUSTOM_PLANTS_KEY, JSON.stringify(saved));
  } catch (err) { console.warn("Could not save custom plant", err); }
}
