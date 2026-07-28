"use client";

import Image from "next/image";
import { Star, Clock } from "lucide-react";
import { Service } from "@/types";

// Static demo data mirroring the API payload
const DEMO_SERVICES: Service[] = [
  {
    id: "srv-1",
    name: "Full Home Electrical Inspection",
    category: "Electrical",
    startingPrice: 89,
    duration: "1 - 2 hrs",
    rating: 4.9,
    reviewCount: 128,
    imageUrl:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "srv-2",
    name: "Emergency Leak Repair",
    category: "Plumbing",
    startingPrice: 110,
    duration: "1 hr",
    rating: 4.8,
    reviewCount: 94,
    imageUrl:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "srv-3",
    name: "Deep Apartment Cleaning",
    category: "Cleaning",
    startingPrice: 150,
    duration: "3 - 4 hrs",
    rating: 5.0,
    reviewCount: 210,
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "srv-4",
    name: "AC Unit Tune-Up & Cleaning",
    category: "AC Repair",
    startingPrice: 99,
    duration: "1.5 hrs",
    rating: 4.9,
    reviewCount: 165,
    imageUrl:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop",
  },
];

export function FeaturedServices() {
  return (
    <section id="services" className="bg-slate-100/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
              Featured Services
            </h2>
            <p className="mt-2 text-slate-600">
              Explore our highest-rated professional home services.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_SERVICES.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-xl"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-md">
                    {service.category}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />{" "}
                      {service.rating} ({service.reviewCount})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {service.duration}
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900 text-lg">
                    {service.name}
                  </h3>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Starting at
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    ${service.startingPrice}
                  </span>
                </div>
                <button className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 cursor-pointer">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
