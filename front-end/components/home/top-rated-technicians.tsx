"use client";

import Image from "next/image";
import { Star, ShieldCheck, Briefcase } from "lucide-react";
import { Technician } from "@/types";

// Static demo data matching the Technician interface
const DEMO_TECHNICIANS: Technician[] = [
  {
    id: "tech-1",
    name: "Alex Rivera",
    profession: "Master Plumber",
    rating: 4.9,
    completedJobs: 240,
    experienceYears: 8,
    startingPrice: 65,
    isVerified: true,
    isAvailable: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
  },
  {
    id: "tech-2",
    name: "Marcus Vance",
    profession: "Certified Electrician",
    rating: 4.95,
    completedJobs: 310,
    experienceYears: 10,
    startingPrice: 75,
    isVerified: true,
    isAvailable: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop",
  },
  {
    id: "tech-3",
    name: "Elena Rostova",
    profession: "HVAC Specialist",
    rating: 4.88,
    completedJobs: 180,
    experienceYears: 6,
    startingPrice: 70,
    isVerified: true,
    isAvailable: false,
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop",
  },
];

export function TopRatedTechnicians() {
  return (
    <section id="technicians" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
            Top-Rated Technicians
          </h2>
          <p className="mt-2 text-slate-600">
            Vetted experts ready to help you today.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_TECHNICIANS.map((tech) => (
            <div
              key={tech.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-blue-200 hover:shadow-lg"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-50 shrink-0">
                    <Image
                      src={tech.avatarUrl}
                      alt={tech.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-bold text-slate-900 text-lg">
                      <span>{tech.name}</span>
                      {tech.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-600">
                      {tech.profession}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />{" "}
                        {tech.rating}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />{" "}
                        {tech.completedJobs} Jobs
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Rate
                  </span>
                  <span className="font-bold text-slate-900 text-base">
                    ${tech.startingPrice}/hr
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer">
                    Profile
                  </button>
                  <button className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer">
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
