// Garden state: plants, beds and fertilizer products, persisted to localStorage,
// plus the actions screens use. Screens read it with useGarden().
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PLANT_DB, registerCustomPlant } from "./plantDb";
import { loadJSON, saveJSON } from "./storage";
import {
  INITIAL, addDays, buildFallbackPlant, calcNPKScore, currentHealth, daysBetween, npkHealthBoost, randomId,
} from "./garden";

const GardenContext = createContext(null);
export const useGarden = () => useContext(GardenContext);

// Log entry types drive the watering strip and history; older logs only had text
export function logType(log) {
  if (log.type) return log.type;
  if (/water/i.test(log.text)) return "water";
  if (/fed|feed|fertili[sz]|applied/i.test(log.text)) return "feed";
  return "note";
}
// Pre-redesign log text started with an emoji; strip it for display
export const logText = log => log.text.replace(/^[\p{Extended_Pictographic}️‍\s]+/u, "");

function catchUpSprinklers(plants) {
  // Roll lastWatered forward for missed sprinkler cycles since the last visit
  const today = new Date();
  return plants.map(plant => {
    if (!plant.autoWater?.enabled) return plant;
    const freq = plant.autoWater.frequencyDays || PLANT_DB[plant.plantId]?.waterDays || 2;
    const daysAgo = daysBetween(new Date(plant.lastWatered), today);
    if (daysAgo < freq) return plant;
    const cycles = Math.floor(daysAgo / freq);
    const logs = [];
    for (let i = 0; i < Math.min(cycles, 3); i++) {
      logs.push({ date: addDays(new Date(plant.lastWatered), (i + 1) * freq).toISOString(), text: "Watered by sprinkler.", type: "water" });
    }
    return {
      ...plant,
      lastWatered: addDays(new Date(plant.lastWatered), cycles * freq).toISOString(),
      logs: [...logs.reverse(), ...(plant.logs || [])],
    };
  });
}

export function GardenProvider({ children }) {
  const [plants, setPlants] = useState(() => {
    const loaded = loadJSON("gt-plants", INITIAL);
    // Never crash on an entry whose plant type is missing — give it generic defaults
    loaded.forEach(p => { if (!PLANT_DB[p.plantId]) registerCustomPlant(p.plantId, buildFallbackPlant(p.nickname || "Plant")); });
    return catchUpSprinklers(loaded);
  });
  const [fertilizers, setFertilizers] = useState(() => loadJSON("gt-fertilizers", []));
  const [beds, setBeds] = useState(() => loadJSON("gt-planterboxes", []));
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  useEffect(() => saveJSON("gt-plants", plants), [plants]);
  useEffect(() => saveJSON("gt-fertilizers", fertilizers), [fertilizers]);
  useEffect(() => saveJSON("gt-planterboxes", beds), [beds]);
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  const toast = useCallback((message, { icon = "check", accent = "moss" } = {}) => {
    const id = randomId();
    setToasts(t => [...t, { id, message, icon, accent }]);
    timers.current[id] = setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);

  const getPlant = id => plants.find(p => p.id === id);
  const updatePlant = entry => setPlants(prev => prev.map(p => (p.id === entry.id ? entry : p)));

  // Apply a change to a plant, optionally adding a log entry. Returns the previous
  // entry so callers (e.g. task checkboxes) can undo.
  function changePlant(id, updates, log) {
    const prev = getPlant(id);
    if (!prev) return null;
    setPlants(list => list.map(p => {
      if (p.id !== id) return p;
      const logs = log ? [{ date: new Date().toISOString(), ...log }, ...(p.logs || [])] : p.logs;
      return { ...p, ...updates, logs };
    }));
    return prev;
  }

  const actions = {
    toast,
    getPlant,
    updatePlant,
    restorePlant: updatePlant,

    addPlant(entry) {
      const full = {
        id: randomId(),
        lastWatered: new Date().toISOString(),
        lastFed: addDays(new Date(), -7).toISOString(),
        health: 75,
        notes: "",
        logs: [{ date: new Date().toISOString(), text: "Added to the garden.", type: "note" }],
        ...entry,
      };
      setPlants(prev => [...prev, full]);
      return full;
    },
    deletePlant(id) {
      setPlants(prev => prev.filter(p => p.id !== id));
    },

    logWater(id, amount) {
      const qty = amount ? ` ${amount} gal.` : "";
      return changePlant(id, { lastWatered: new Date().toISOString() }, { text: `Watered.${qty}`, type: "water", amount: amount || null });
    },
    /** Feed with a product (boosts health by N-P-K match) or without one */
    logFeed(id, fertId, amount) {
      const p = getPlant(id);
      if (!p) return null;
      const fert = fertilizers.find(f => f.id === fertId);
      const health = currentHealth(p);
      let updates = { lastFed: new Date().toISOString() };
      let text = "Fed.";
      if (fert) {
        const score = calcNPKScore(PLANT_DB[p.plantId]?.category, fert.npk);
        const next = Math.min(100, health + npkHealthBoost(score));
        updates = { ...updates, health: next, fertId: fert.id };
        text = `Fed ${fert.name} (${fert.npk.n}-${fert.npk.p}-${fert.npk.k}). N-P-K match ${score}%. Health ${health}% → ${next}%.`;
      }
      if (amount) text += ` ${amount}.`;
      return changePlant(id, updates, { text, type: "feed", fertId: fert?.id || null });
    },
    logHarvest(id) {
      return changePlant(id, { harvestedAt: new Date().toISOString() }, { text: "Harvested.", type: "harvest" });
    },
    logNote(id, text) {
      return changePlant(id, {}, { text, type: "note" });
    },
    setAutoWater(id, autoWater) {
      const p = getPlant(id);
      const turningOn = autoWater.enabled && !p.autoWater?.enabled;
      const turningOff = !autoWater.enabled && p.autoWater?.enabled;
      return changePlant(
        id,
        { autoWater: { ...p.autoWater, ...autoWater }, ...(turningOn ? { lastWatered: new Date().toISOString() } : {}) },
        turningOn ? { text: "Sprinkler turned on.", type: "note" } : turningOff ? { text: "Sprinkler turned off.", type: "note" } : null,
      );
    },

    addBed(bed) {
      const full = { id: randomId(), cells: {}, ...bed };
      setBeds(prev => [...prev, full]);
      return full;
    },
    updateBed: bed => setBeds(prev => prev.map(b => (b.id === bed.id ? bed : b))),
    deleteBed(id) {
      setBeds(prev => prev.filter(b => b.id !== id));
      setPlants(prev => prev.map(p => (p.bedId === id ? { ...p, bedId: null } : p)));
    },

    addFertilizer(f) {
      const full = { id: randomId(), added: new Date().toISOString(), ...f };
      setFertilizers(prev => [...prev, full]);
      return full;
    },
    deleteFertilizer: id => setFertilizers(prev => prev.filter(f => f.id !== id)),
  };

  return (
    <GardenContext.Provider value={{ plants, fertilizers, beds, toasts, ...actions }}>
      {children}
    </GardenContext.Provider>
  );
}
