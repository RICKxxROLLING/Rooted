// Identify — photograph a plant, get a confident ID, add it to a bed (spec §2).
// Uses the device camera via a capture file input (no live <video>): works in every
// browser, needs no camera permission, and sends Pl@ntNet a full-resolution photo.
import { useEffect, useState } from "react";
import { PLANT_DB } from "../lib/plantDb";
import { NPK_IDEAL } from "../lib/garden";
import { compressImage } from "../lib/storage";
import { fetchCustomPlantData, matchPlantNetResults } from "../lib/api";
import { goBack, navigate } from "../lib/router";
import { Icon } from "../components/Icon";
import { Button, Eyebrow, Mono, cn } from "../components/ui";
import { AddPlantSheet, PlantPickerSheet } from "../components/sheets";

const params = () => new URLSearchParams(location.search);

export default function Identify() {
  const [photo, setPhoto] = useState(null);
  const [state, setState] = useState("idle"); // idle | identifying | result | error
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [pick, setPick] = useState(0);
  const [userPicked, setUserPicked] = useState(false); // chose a low-confidence match themselves
  const [care, setCare] = useState({}); // name → plant data from Perenual (for non-library matches)
  const [sheet, setSheet] = useState(null); // { type: "add", choice } | { type: "search", q }
  const preset = { bedId: params().get("bed"), cell: params().get("cell") };

  async function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setPhoto(null);
    compressImage(file).then(setPhoto).catch(() => {});
    setState("identifying");
    setPick(0);
    setUserPicked(false);
    try {
      const form = new FormData();
      form.append("images", file);
      form.append("organs", "auto");
      const res = await fetch("/api/plantnet/identify", { method: "POST", body: form });
      if (res.status === 404) throw new Error("No plant found in that photo. Try a closer shot of a leaf or flower.");
      if (res.status === 401 || res.status === 403) throw new Error("Plant ID isn't set up (check the PLANTNET_KEY setting).");
      if (res.status === 429) throw new Error("Too many identifications — wait a minute and try again.");
      if (!res.ok) throw new Error("Couldn't identify the plant. Try again, or search by name.");
      const { results = [] } = await res.json();
      if (!results.length) throw new Error("No match found. Try another angle, or search by name.");
      setCandidates(results.slice(0, 4).map(r => ({
        name: r.species?.commonNames?.[0] || r.species?.scientificNameWithoutAuthor || "Unknown plant",
        latin: r.species?.scientificNameWithoutAuthor || null,
        score: r.score ?? 0,
        plantId: matchPlantNetResults([{ ...r, score: 1 }]), // library match for this candidate
      })));
      setState("result");
    } catch (err) {
      setError(err instanceof TypeError ? "Couldn't reach the identification service." : err.message);
      setState("error");
    }
  }

  const current = candidates[pick];
  // Non-library match → fetch care basics from Perenual once per name
  useEffect(() => {
    if (state !== "result" || !current || current.plantId || care[current.name]) return;
    setCare(c => ({ ...c, [current.name]: { loading: true } }));
    fetchCustomPlantData(current.name).then(r => setCare(c => ({ ...c, [current.name]: r.plant })));
  }, [state, current]); // eslint-disable-line react-hooks/exhaustive-deps

  const careData = current && (current.plantId ? PLANT_DB[current.plantId] : care[current.name]);
  // <50%: don't present a single answer until the user picks one (spec confidence rules)
  const confident = !!current && (current.score >= 0.5 || userPicked);

  function addCurrent() {
    const choice = current.plantId ? { plantId: current.plantId } : { plant: { ...careData, name: current.name, latin: current.latin } };
    setSheet({ type: "add", choice: { ...choice, name: current.name, photo, latin: current.latin, idScore: current.score } });
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-[480px] flex-col bg-camera-bg md:my-6 md:min-h-[calc(100dvh-48px)] md:overflow-hidden md:rounded-sheet">
      {/* 1. Camera area — chrome stays light in both themes */}
      <div className="relative h-[430px] shrink-0 overflow-hidden">
        {photo && <img src={photo} alt="Your plant photo" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute left-1/2 top-[110px] size-60 -translate-x-1/2" aria-hidden>
          {["left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-2xl", "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-2xl",
            "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl", "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl"].map(c => (
            <span key={c} className={cn("absolute size-9 border-camera-chrome", c)} />
          ))}
        </div>
        {state === "idle" && !photo && (
          <p className="absolute inset-x-0 top-[222px] text-center font-mono text-xs text-camera-chrome opacity-80">Fill the frame with one plant</p>
        )}
        <button type="button" aria-label="Close" onClick={() => goBack("/")}
          className="absolute left-5 top-[calc(16px+env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-camera-scrim text-camera-chrome md:top-5">
          <Icon name="close" size={20} />
        </button>
        <div className="absolute right-5 top-[calc(24px+env(safe-area-inset-top))] flex h-7 items-center rounded-full bg-camera-scrim px-3 text-xs font-semibold text-camera-chrome md:top-7">
          {state === "identifying" ? "Identifying…" : photo ? "1 photo" : "Leaf · flower · fruit"}
        </div>
      </div>

      {/* 2. Sheet */}
      <div className="relative -mt-7 flex flex-1 flex-col gap-4 rounded-t-sheet bg-ground px-5 pb-[calc(28px+env(safe-area-inset-bottom))] pt-3">
        <div className="h-[5px] w-10 self-center rounded-full bg-line-strong" aria-hidden />

        {state === "idle" && (
          <>
            <div className="flex flex-col gap-1">
              <Eyebrow>Identify</Eyebrow>
              <h1 className="font-display text-[30px] font-medium leading-[1.05] tracking-[-0.01em]">Point at a leaf.</h1>
              <p className="text-body-sm text-muted">A clear photo of one leaf, flower or fruit gives the most confident match.</p>
            </div>
            <PhotoButtons onFile={handleFile} />
            <Button variant="text" className="self-center" onClick={() => setSheet({ type: "search", q: "" })}>Search by name instead</Button>
          </>
        )}

        {state === "identifying" && (
          <div className="flex flex-1 flex-col gap-3" aria-live="polite">
            <Eyebrow>Identifying</Eyebrow>
            <div className="h-8 w-2/3 animate-pulse rounded-chip bg-sunken" />
            <div className="h-4 w-1/2 animate-pulse rounded-chip bg-sunken" />
            <div className="mt-2 grid grid-cols-3 gap-2">{[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-input bg-sunken" />)}</div>
          </div>
        )}

        {state === "error" && (
          <>
            <div className="flex flex-col gap-2" role="alert">
              <Eyebrow>No match</Eyebrow>
              <p className="text-body">{error}</p>
            </div>
            <PhotoButtons onFile={handleFile} retake />
            <Button variant="text" className="self-center" onClick={() => setSheet({ type: "search", q: "" })}>Search by name instead</Button>
          </>
        )}

        {state === "result" && current && (
          <>
            {confident ? (
              <div className="flex items-start gap-3.5">
                <div className="size-[72px] shrink-0 overflow-hidden rounded-tile bg-moss-tint text-moss">
                  {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Icon name="sprout" size={32} /></div>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Eyebrow>{current.score >= 0.85 ? "Likely match" : current.score >= 0.5 ? "Possible match" : "Your pick"}</Eyebrow>
                  <h1 className="font-display text-[30px] font-medium leading-[1.05] tracking-[-0.01em]">{current.name}</h1>
                  {current.latin && <p className="font-display text-base italic text-muted">{current.latin}</p>}
                </div>
                <span className={cn("flex h-[30px] shrink-0 items-center rounded-chip px-2.5 font-mono text-[13px] font-medium",
                  current.score >= 0.85 ? "bg-moss-tint text-moss-deep" : "bg-ochre-tint text-ochre-deep")}>
                  <span className="sr-only">Confidence </span>{Math.round(current.score * 100)}%
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Eyebrow>Not sure yet</Eyebrow>
                <h1 className="font-display text-[30px] font-medium leading-[1.05]">Try another angle.</h1>
                <p className="text-body-sm text-muted">These are the closest matches — pick one if you recognise it.</p>
              </div>
            )}

            {confident && <CareBasics data={careData} />}

            <div className="flex flex-col">
              <Eyebrow className="pb-1.5">{confident ? "Could also be" : "Closest matches"}</Eyebrow>
              {candidates.map((c, i) => (confident && i === pick) ? null : (
                <button key={c.name + i} type="button" onClick={() => { setPick(i); if (!confident) setUserPicked(true); }}
                  className="flex min-h-[44px] items-center justify-between border-t border-line py-2.5 text-left last:border-b">
                  <span className="text-row">{c.name}{c.latin && c.latin !== c.name && <span className="ml-1.5 font-display text-caption italic text-muted">{c.latin}</span>}</span>
                  <Mono value={`${Math.round(c.score * 100)}%`} className="text-caption text-muted" />
                </button>
              ))}
            </div>

            <div className="mt-auto flex gap-2.5 pt-2">
              {confident ? (
                <>
                  <Button variant="secondary" size="lg" onClick={() => setSheet({ type: "search", q: current.name })}>Not it</Button>
                  <Button size="lg" icon="plus" className="flex-1" disabled={!careData || careData.loading} onClick={addCurrent}>
                    {preset.bedId ? "Add to bed" : "Add to a bed"}
                  </Button>
                </>
              ) : (
                <>
                  <label className="inline-flex h-[52px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-moss px-[22px] text-[15px] font-semibold text-on-accent">
                    <Icon name="scan" size={18} />Try again
                    <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFile} />
                  </label>
                  <Button variant="secondary" size="lg" onClick={() => setSheet({ type: "search", q: current.name })}>Search</Button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {sheet?.type === "add" && (
        <AddPlantSheet choice={sheet.choice} preset={preset} onClose={() => setSheet(null)}
          onAdded={entry => navigate(preset.bedId ? `/beds/${preset.bedId}` : `/plants/${entry.id}`, { replace: true })} />
      )}
      {sheet?.type === "search" && (
        <PlantPickerSheet initialQuery={sheet.q} title="Find your plant" onClose={() => setSheet(null)}
          onPick={choice => setSheet({ type: "add", choice: { ...choice, photo } })} />
      )}
    </div>
  );
}

function PhotoButtons({ onFile, retake }) {
  return (
    <div className="flex gap-2.5">
      <label className="inline-flex h-[52px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-moss px-[22px] text-[15px] font-semibold text-on-accent transition-transform duration-150 active:scale-[0.98] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-moss">
        <Icon name="scan" size={18} />{retake ? "Retake photo" : "Take photo"}
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={onFile} />
      </label>
      <label className="inline-flex h-[52px] cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface px-[22px] text-[15px] font-semibold text-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-moss">
        Library
        <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
      </label>
    </div>
  );
}

const SUN_HOURS = { "Full Sun": "6–8 h", "Partial Sun": "3–6 h", "Partial Shade": "3–6 h", Shade: "Under 3 h" };
function feedingStyle(category) {
  const i = NPK_IDEAL[category] || NPK_IDEAL.Vegetable;
  return i.n >= 45 ? "Nitrogen-rich" : i.p >= 45 ? "Phosphorus-rich" : i.k >= 40 ? "Potassium-rich" : "Balanced feed";
}

function CareBasics({ data }) {
  const tiles = data && !data.loading ? [
    { icon: "sun", tone: "text-ochre", title: data.sunNeeds, value: SUN_HOURS[data.sunNeeds] || "Daily sun" },
    { icon: "droplet", tone: "text-rain", title: "Water", value: `Every ${data.waterDays} d` },
    { icon: "fertilizer", tone: "text-ochre", title: feedingStyle(data.category), value: "Every 14 d" },
  ] : null;
  return (
    <div className="grid grid-cols-3 gap-2" aria-busy={!tiles}>
      {tiles ? tiles.map(t => (
        <div key={t.icon + t.title} className="flex flex-col gap-1 rounded-input border border-line bg-surface px-3 py-2.5">
          <span className={t.tone}><Icon name={t.icon} size={18} /></span>
          <span className="text-caption font-semibold leading-tight">{t.title}</span>
          <span className="text-xs text-muted">{t.value}</span>
        </div>
      )) : [0, 1, 2].map(i => <div key={i} className="h-[88px] animate-pulse rounded-input bg-sunken" />)}
    </div>
  );
}
