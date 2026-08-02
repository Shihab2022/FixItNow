/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { ShieldCheck, Star, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllTechnicians } from "@/service/publicApi";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
export default function TopRatedTechnicians() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const fetchTopRatedTechnicians = async () => {
    try {
      const response = await getAllTechnicians();
      if (response.data.success) {
        setTechnicians(response.data.data.data);
      }
    } catch (err) {
      console.error("Error fetching top-rated technicians:", err);
    }
  };
  useEffect(() => {
    fetchTopRatedTechnicians();
  }, []);
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
          {technicians.slice(0, 6).map((tech, i) => {
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
                        Profile
                      </button>
                    </Link>
                    <button className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer">
                      Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {technicians.length > 6 && (
        <div className="mt-10 text-center">
          <Link href="/technicians">
            <button className="inline-flex cursor-pointer items-center gap-2 rounded-2xl text-sm font-bold text-blue-700 ">
              <>
                Show All Technicians ({technicians.length}){" "}
                <FaArrowRight className="h-4 w-4" />
              </>
            </button>
          </Link>
        </div>
      )}
    </section>
  );
}
