// App shell: routes, layout column and the floating tab bar.
//   /            Today        /beds[/:id]   Bed planner    /plants/:id  Plant care
//   /plants      Plants       /feeding      Feeding        /identify    Identify (full-bleed)
//   /design      Component sheet (light + dark), not linked in the UI
import { GardenProvider, useGarden } from "./lib/store";
import { match, usePath } from "./lib/router";
import { TabBar, Toasts, cn } from "./components/ui";
import Today from "./screens/Today";
import Plants from "./screens/Plants";
import PlantCare from "./screens/PlantCare";
import Beds from "./screens/Beds";
import Feeding from "./screens/Feeding";
import Identify from "./screens/Identify";
import Design from "./screens/Design";

function resolve(path) {
  let m;
  if (path === "/") return { tab: "today", el: <Today /> };
  if (path === "/plants") return { tab: "plants", el: <Plants /> };
  if ((m = match("/plants/:id", path))) return { detail: true, el: <PlantCare key={m.id} id={m.id} /> };
  if (path === "/beds") return { tab: "beds", el: <Beds /> };
  if ((m = match("/beds/:id", path))) return { tab: "beds", el: <Beds id={m.id} /> };
  if (path === "/feeding") return { tab: "feeding", el: <Feeding /> };
  if (path === "/identify") return { bleed: true, el: <Identify /> };
  if (path === "/design") return { wide: true, el: <Design /> };
  return { tab: "today", el: <Today /> }; // unknown path → home
}

function Shell() {
  const path = usePath().replace(/\/+$/, "") || "/";
  const { toasts } = useGarden();
  const route = resolve(path);

  if (route.bleed) return <>{route.el}<Toasts toasts={toasts} /></>;
  return (
    <>
      {/* Phones: 480px column (390 design frame). Tablet/desktop: wider layouts built from
          the same system — the handoff doesn't design these yet. */}
      <main className={cn("mx-auto min-h-[100dvh] w-full px-5", route.detail ? "max-w-[480px] md:max-w-3xl" : route.wide ? "max-w-6xl" : "max-w-[480px] md:max-w-5xl md:px-8")}>
        {route.el}
      </main>
      {route.tab && <TabBar active={route.tab} />}
      <Toasts toasts={toasts} withTabBar={!!route.tab} />
    </>
  );
}

export default function Root() {
  return (
    <GardenProvider>
      <Shell />
    </GardenProvider>
  );
}
