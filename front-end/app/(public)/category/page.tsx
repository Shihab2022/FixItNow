/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplet, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { CATEGORY_ICONS } from "@/mock/categoryIconsData";
import { getAllCategories } from "@/service/publicApi";

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllCategories();
      if (res?.data?.data) {
        const catData = res.data.data.map((cat: any) => ({
          id: cat._id || cat.id,
          title: cat.name,
          description:
            cat.description || "Top-rated services by certified professionals.",
          count: `${Math.floor(Math.random() * 90) + 10}+ Techs`,
          icon: CATEGORY_ICONS[cat.name] || Droplet,
        }));
        setCategories(catData);
      }
    } catch (err) {
      console.error("Error fetching all categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                All Service Categories
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Browse our full list of verified repair, maintenance, and home
                services.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-3xl bg-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {filteredCategories
              .sort((a, b) => b.count.localeCompare(a.count))
              .map((cat, index) => {
                const IconComponent = cat.icon;
                return (
                  <motion.div
                    key={cat.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ y: -6 }}
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
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              {`  No categories found matching "${searchTerm}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
