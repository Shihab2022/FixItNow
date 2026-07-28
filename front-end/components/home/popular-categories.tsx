"use client";

import {
  Zap,
  Droplet,
  Sparkles,
  Paintbrush,
  Wind,
  Hammer,
  Tv,
  Bug,
} from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { title: "Electrical", count: "120+ Techs", icon: Zap },
  { title: "Plumbing", count: "95+ Techs", icon: Droplet },
  { title: "Cleaning", count: "210+ Techs", icon: Sparkles },
  { title: "Painting", count: "80+ Techs", icon: Paintbrush },
  { title: "AC Repair", count: "110+ Techs", icon: Wind },
  { title: "Carpentry", count: "65+ Techs", icon: Hammer },
  { title: "Appliance Repair", count: "75+ Techs", icon: Tv },
  { title: "Pest Control", count: "45+ Techs", icon: Bug },
];

export function PopularCategories() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
            Popular Categories
          </h2>
          <p className="mt-3 text-slate-600">
            Find top-rated technicians for every household need.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {CATEGORIES.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-xs transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <IconComponent className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">
                  {cat.title}
                </h3>
                <span className="mt-1 text-xs text-slate-500 font-medium">
                  {cat.count}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
