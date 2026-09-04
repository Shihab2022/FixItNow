/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Briefcase, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryTechnicians } from "@/service/publicApi";

export interface CategoryTechnician {
  id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  bio?: string | null;
  skills?: string[];
  experience?: number;
  completedJobs?: number;
  isAvailable?: boolean;
  hourlyRate?: number | null;
  rating?: number;
  avatarUrl?: string;
}

const AVATAR_FALLBACKS = [
  "https://images.unsplash.com/photo-1507003213385-1df5e85c6fe5?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1519085360777-6d8a88663e7b?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1573496359044-2c86d7e1f1dc?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003213385-1df5e85c6fe5?auto=format&fit=crop&w=200&q=80",
];

export default function CategoryTechniciansPage({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName?: string;
}) {
  const [technicians, setTechnicians] = useState<CategoryTechnician[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState(categoryName || "");

  const fetchTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCategoryTechnicians(categoryId);
      const raw = res?.data?.data?.data || res?.data?.data || [];
      const techList: CategoryTechnician[] = raw.map((t: any, i: number) => ({
        id: t.id,
        user: t.user,
        bio: t.bio,
        skills: Array.isArray(t.skills) ? t.skills : [],
        experience: t.experience || 0,
        completedJobs: t.completedJobs || 0,
        isAvailable: t.isAvailable !== false,
        hourlyRate: t.hourlyRate || null,
        avatarUrl: t.avatarUrl,
      }));
      setTechnicians(techList);
    } catch (err) {
      console.error("Error fetching technicians:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const filtered = technicians.filter((tech) =>
    (tech.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/category"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Categories
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {categoryTitle || "Category Technicians"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {filtered.length} verified {categoryTitle || "technician"}
              {filtered.length !== 1 ? "s" : ""} available in this category
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search technicians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>

        {/* Technician Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hide"
            animate="show"
            variants={{
              show: {
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {filtered.map((tech, i) => {
              const name = tech.user?.name || "Technician";
              const avatarUrl =
                tech.avatarUrl || AVATAR_FALLBACKS[i % AVATAR_FALLBACKS.length];
              const skills = tech.skills || [];
              const rating = tech.rating ?? 4.8;
              const hourlyRate = tech.hourlyRate ?? 45;

              return (
                <Link
                  key={tech.id}
                  href={`/technicians/${tech.id}`}
                  className="block"
                >
                  <motion.div
                    variants={{ show: { opacity: 1, y: 0 } }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group flex flex-col h-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-blue-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-50 shrink-0">
                        <Image
                          src={avatarUrl}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 font-bold text-slate-900 text-lg">
                          <span>{name}</span>
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-xs font-semibold text-blue-600 mt-1">
                          {skills.length > 0
                            ? skills.join(", ")
                            : "General Specialist"}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400" />{" "}
                            {rating}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />{" "}
                            {tech.completedJobs} Jobs
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 flex-1">
                      {tech.bio || "Professional service provider."}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="font-bold text-slate-900 text-base">
                        ${hourlyRate}/hr
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/technicians/${tech.id}`;
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Book Now
                      </button>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              No technicians found for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
