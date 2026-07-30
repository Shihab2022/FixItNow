"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiStar,
  FiClock,
  FiMapPin,
  FiArrowUpRight,
  FiPhone,
} from "react-icons/fi";
import { mockBookings } from "@/mock/data";

export default function TechnicianDashboardOverview() {
  const upcomingJobs = mockBookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress",
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-800 to-blue-950 p-6 md:p-8 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">
            Technician Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-black pt-2">
            Welcome back, Marcus!
          </h1>
          <p className="text-sm text-slate-300">
            You have{" "}
            <span className="font-bold text-amber-400">
              2 jobs scheduled today
            </span>
            .
          </p>
        </div>
        <Link
          href="/technician/calendar"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 w-fit"
        >
          View Calendar Schedule
        </Link>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase text-slate-400">
              Total Monthly Earnings
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FiDollarSign className="text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">$3,420.00</p>
          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <FiArrowUpRight /> +14.2% from last month
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase text-slate-400">
              Jobs Completed
            </span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiCheckCircle className="text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">48</p>
          <p className="text-xs font-semibold text-slate-500">
            98% Completion Rate
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase text-slate-400">
              Customer Rating
            </span>
            <div className="p-2 bg-amber-50 rounded-lg">
              <FiStar className="text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">4.9 / 5.0</p>
          <p className="text-xs font-semibold text-slate-500">
            Based on 124 reviews
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold uppercase text-slate-400">
              Hours Billed
            </span>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FiClock className="text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">112 hrs</p>
          <p className="text-xs font-semibold text-slate-500">This Month</p>
        </div>
      </div>

      {/* Upcoming Jobs Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">
            Upcoming Job Assignments
          </h2>
          <Link
            href="/technician/calendar"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {upcomingJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                    {job.status.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    #{job.id}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {job.serviceTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <FiCalendar className="text-blue-600" /> {job.bookingDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock /> {job.timeSlot}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin className="text-rose-500" /> {job.address}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                <button
                  onClick={() => alert(`Calling customer for ${job.id}`)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FiPhone /> Call Customer
                </button>
                <button
                  onClick={() => alert(`Updating job status for ${job.id}`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Mark Complete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
