import { MapPin, Radar, ClipboardList, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const MAP_FEATURES = [
  {
    icon: Radar,
    title: "Nearest-Match Radar",
    desc: "Set your location and a 1–50 km radius to instantly see technicians or open tasks around you, sorted by distance.",
  },
  {
    icon: UserCheck,
    title: "Availability-Aware",
    desc: "Technicians appear on the map only during their working slots — once their shift ends, they're hidden until back on duty.",
  },
  {
    icon: ClipboardList,
    title: "Post a Task & Get Hired",
    desc: "Customers drop a task on the map, nearby technicians apply, and accepting one application instantly creates a booking.",
  },
  {
    icon: MapPin,
    title: "Bangladesh-First Search",
    desc: "Location search is tuned for Bangladesh — find local areas fast, from Dhanmondi and Uttara to Chattogram and Sylhet.",
  },
];

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

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MAP_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
          >
            Open the Live Map <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}