/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { ShieldCheck, Star, Briefcase, Search, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllTechnicians } from "@/service/publicApi";

export default function AllTechniciansSection() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchTopRatedTechnicians = async () => {
    try {
      const response = await getAllTechnicians();
      if (response?.data?.success) {
        setTechnicians(response.data.data.data);
      }
    } catch (err) {
      console.error("Error fetching top-rated technicians:", err);
    }
  };
  useEffect(() => {
    fetchTopRatedTechnicians();
  }, []);
  const filteredCategories = technicians.filter((cat) =>
    cat?.user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
  );
  return (
    <section id="technicians" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                Top-Rated Technicians
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Vetted experts ready to help you today.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((tech, i) => {
            const name = tech.user?.name || "Technician";
            const avatarUrl =
              tech.avatarUrl ||
              `https://randomuser.me/api/portraits/men/${i + 10}.jpg`;
            return (
              <div
                key={tech.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-blue-200 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-50 shrink-0">
                      <Image
                        src={avatarUrl}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-900 text-lg">
                        <span>{name}</span>
                        {tech.status && (
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-blue-600">
                        {tech.skills?.length > 0
                          ? tech.skills.join(", ")
                          : "General Specialist"}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />{" "}
                          {tech.rating ?? "5.0"}
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
                      ${tech.hourlyRate ?? 45}/hr
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/technicians/${tech.id}`}>
                      <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer">
                        View Profile
                      </button>
                    </Link>

                    <Link href={`/technicians/${tech.id}`}>
                      <button className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer">
                        Book
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
