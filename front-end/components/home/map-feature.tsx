"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Radar,
  ClipboardList,
  UserCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

/**
 * The live map preview is loaded client-side only (it needs WebGL), with a
 * lightweight spinner shown until the tiles are ready.
 */
const MapPreview = dynamic(() => import("./map-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  ),
});

const MAP_FEATURES = [
  {
    icon: Radar,
    title: "Nearest-Match Radar",
    desc: "Set a 1–50 km radius and instantly see technicians or open tasks around you, sorted by real distance.",
  },
  {
    icon: UserCheck,
    title: "Availability-Aware",
    desc: "Technicians appear only during their working slots — when their shift ends, they're hidden until back on duty.",
  },
  {
    icon: ClipboardList,
    title: "Post a Task & Get Hired",
    desc: "Customers drop a task on the map, technicians apply, and accepting one creates a booking instantly.",
  },
  {
    icon: MapPin,
    title: "Bangladesh-First Search",
    desc: "Location search is tuned for Bangladesh — find local areas fast, from Dhanmondi to Chattogram.",
  },
];

const HIGHLIGHTS = ["1–50 km radius", "Live availability", "BD-wide coverage"];

export function MapFeature() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
            <MapPin className="h-3.5 w-3.5" /> Live Service Map
          </span>
          <h2 className="mt-4 font-bold text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Everything Happens on the Map
          </h2>
          <p className="mt-3 text-slate-600">
            FixItNow&apos;s interactive map connects customers and technicians
            in real time — search your area, filter by category, and get help
            fast.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
          {/* Live map preview */}
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-slate-200 shadow-lg sm:h-[440px] lg:col-span-3">
            <MapPreview />
          </div>

          {/* Related information */}
          <div className="flex flex-col rounded-3xl border border-slate-100 bg-slate-50 p-7 sm:p-8 lg:col-span-2">
            <h3 className="font-bold text-xl text-slate-900">See it in action</h3>
            <p className="mt-1.5 text-xs text-slate-500">
              A live preview of the FixItNow map — drag it around, then jump
              into the real thing.
            </p>

            <ul className="mt-6 space-y-5">
              {MAP_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {feature.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {feature.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {HIGHLIGHTS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-7">
              <Link
                href="/map"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
              >
                Open the Live Map <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}