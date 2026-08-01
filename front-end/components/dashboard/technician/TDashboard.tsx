"use client";

import React from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiArrowUpRight,
  FiArrowRight,
} from "react-icons/fi";

export default function DashboardPage() {
  const stats = [
    {
      label: "Total Earnings",
      value: "$2,500",
      icon: FiDollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Completed Jobs",
      value: "100",
      icon: FiCheckCircle,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending Requests",
      value: "3",
      icon: FiClock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Hours Worked",
      value: "142 hrs",
      icon: FiCalendar,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, Robert!
        </h1>
        <p className="text-sm text-slate-500">
          Here is your operational snapshot for this week.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {s.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action & Upcoming Requests Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Recent Service Requests
            </h2>
            <Link
              href="/technician/bookings"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All Bookings <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-900">
                  Circuit Repair & Power Backup
                </p>
                <p className="text-xs text-slate-500">
                  Scheduled: Aug 15, 2026 • 02:30 PM
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                $500.00
              </span>
            </div>
            <div className="py-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-900">
                  Ceiling Fan Installation
                </p>
                <p className="text-xs text-slate-500">
                  Scheduled: Aug 16, 2026 • 10:00 AM
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                $120.00
              </span>
            </div>
          </div>
        </div>

        {/* Quick Profile Health */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">
              Profile Status
            </span>
            <h3 className="text-lg font-bold mt-1">6 Years Experience</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your profile is verified and active with 5 published skills and
              configured hourly rates.
            </p>
          </div>
          <Link
            href="/technician/profile"
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold transition-colors"
          >
            Edit Profile & Services <FiArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
