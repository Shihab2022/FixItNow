/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getAllTechnicians } from "@/service/publicApi";
import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiAward,
  FiPhone,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

// Types matching your nested JSON structure
export interface TechnicianUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AvailabilitySchedule {
  monday?: Array<string | { start: string; end: string }>;
  tuesday?: Array<string | { start: string; end: string }>;
  wednesday?: Array<string | { start: string; end: string }>;
  thursday?: Array<string | { start: string; end: string }>;
  friday?: Array<string | { start: string; end: string }>;
  saturday?: Array<string | { start: string; end: string }>;
  sunday?: Array<string | { start: string; end: string }>;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  bio: string | null;
  skills: string[];
  experience: number;
  completedJobs: number;
  isAvailable: boolean;
  hourlyRate: number | null;
  availability: AvailabilitySchedule | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  user: TechnicianUser;
}

interface TechnicianTableProps {
  data?: TechnicianProfile[];
}

export const TechnicianTable: React.FC<TechnicianTableProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allTechnicians, setAllTechnicians] = useState<any>([]);
  const getTech = async () => {
    const res = await getAllTechnicians();
    if (res?.data?.success) {
      setAllTechnicians(res?.data?.data?.data);
    }
  };

  useEffect(() => {
    getTech();
  }, []);
  const filteredTechnicians = allTechnicians?.filter(
    (tech: TechnicianProfile) => {
      const term = searchTerm.toLowerCase();
      return (
        tech.user.name.toLowerCase().includes(term) ||
        tech.user.email.toLowerCase().includes(term) ||
        tech.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    },
  );

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Search */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Technician Directory
          </h2>
          <p className="text-sm text-slate-500">
            Manage profiles, hourly rates, skills, and availability.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, or skill..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Technician
              </th>
              <th scope="col" className="px-6 py-3.5">
                Contact
              </th>
              <th scope="col" className="px-6 py-3.5">
                Skills
              </th>
              <th scope="col" className="px-6 py-3.5">
                Experience
              </th>
              <th scope="col" className="px-6 py-3.5">
                Completed Jobs
              </th>
              <th scope="col" className="px-6 py-3.5">
                Hourly Rate
              </th>
              <th scope="col" className="px-6 py-3.5">
                Availability
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTechnicians.map((tech: TechnicianProfile) => (
              <tr
                key={tech.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {/* Technician Profile Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm">
                      {tech.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {tech.user.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {tech.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email & Phone */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <FiMail className="w-3.5 h-3.5 text-slate-400" />
                      {tech.user.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                      {tech.user.phone}
                    </span>
                  </div>
                </td>

                {/* Skills as Chips */}
                <td className="px-6 py-4 max-w-xs">
                  {tech.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tech.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      No skills added
                    </span>
                  )}
                </td>

                {/* Experience */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                    <FiClock className="w-3.5 h-3.5 text-slate-400" />
                    {tech.experience} {tech.experience === 1 ? "year" : "years"}
                  </span>
                </td>

                {/* Completed Jobs */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FiAward className="w-3.5 h-3.5 text-emerald-600" />
                    {tech.completedJobs} Jobs
                  </span>
                </td>

                {/* Hourly Rate */}
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                  {tech.hourlyRate !== null ? (
                    <span className="inline-flex items-center gap-0.5 text-slate-900">
                      <FiDollarSign className="w-3.5 h-3.5 text-slate-500" />
                      {tech.hourlyRate}
                      <span className="text-xs text-slate-400 font-normal">
                        /hr
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">N/A</span>
                  )}
                </td>

                {/* Availability Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {tech.isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Unavailable
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">1</span> to{" "}
          <span className="font-medium text-slate-700">
            {filteredTechnicians.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {filteredTechnicians.length}
          </span>{" "}
          profiles
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianTable;
