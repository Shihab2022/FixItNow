/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { CATEGORY_ICONS } from "@/mock/categoryIconsData";
import { getAllCategories } from "@/service/publicApi";
import Link from "next/link";

const DEFAULT_CATEGORIES: Array<{
  id: string;
  title: string;
  count: string;
  icon: any;
  techniciansCount?: number;
}> = [
  { id: "1", title: "Electrical", count: "120+ Techs", icon: Zap },
  { id: "2", title: "Plumbing", count: "95+ Techs", icon: Droplet },
  { id: "3", title: "Cleaning", count: "210+ Techs", icon: Sparkles },
  { id: "4", title: "Painting", count: "80+ Techs", icon: Paintbrush },
  { id: "5", title: "AC Repair", count: "110+ Techs", icon: Wind },
  { id: "6", title: "Carpentry", count: "65+ Techs", icon: Hammer },
  { id: "7", title: "Appliance Repair", count: "75+ Techs", icon: Tv },
  { id: "8", title: "Pest Control", count: "45+ Techs", icon: Bug },
];

export function PopularCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAllCategories();
      if (res?.data?.data) {
        const catData = res.data.data.map((cat: any) => ({
          id: cat._id || cat.id,
          title: cat.name,
          count: `${Math.floor(Math.random() * 90) + 10}+ Techs`,
          techniciansCount: cat.techniciansCount,
          icon: CATEGORY_ICONS[cat.name] || Droplet,
        }));
        setCategories(catData);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  return (
    <section className="py-20 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
            Popular Categories
          </h2>
          <p className="mt-3 text-slate-600">
            Find top-rated technicians for every household need.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          <AnimatePresence>
            {categories
              .sort((a, b) => b.count.localeCompare(a.count))
              .slice(0, 8)
              .map((cat, index) => {
                const IconComponent = cat.icon;
                                return (
                  <Link href={`/category/${cat.id ?? index}`} key={`${cat.title + index}-link`} className="block">
                    <motion.div
                      key={cat.title + index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-xs transition hover:border-blue-300 hover:shadow-lg cursor-pointer"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base">
                        {cat.title}
                      </h3>
                      <span className="mt-1 text-xs text-slate-500 font-medium">
                        {cat.techniciansCount != null
                          ? `${cat.techniciansCount} Techs`
                          : cat.count}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
          </AnimatePresence>
        </div>

        {categories.length > 8 && (
          <div className="mt-10 text-center">
            <Link href="/category">
              <button
                disabled={isLoading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl text-sm font-bold text-blue-700 "
              >
                <>
                  Show All Categories ({categories.length}){" "}
                  <FaArrowRight className="h-4 w-4" />
                </>
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
