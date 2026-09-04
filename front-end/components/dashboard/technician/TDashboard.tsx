"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiArrowUpRight,
  FiArrowRight,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

export default function DashboardPage() {
  const stats = [
    {
      label: "Total Earnings",
      value: "$2,500",
      icon: FiDollarSign,
      color: "text-emerald-600 bg-emerald-50",
      trend: "+12%",
    },
    {
      label: "Completed Jobs",
      value: "100",
      icon: FiCheckCircle,
      color: "text-blue-600 bg-blue-50",
      trend: "+5%",
    },
    {
      label: "Pending Requests",
      value: "3",
      icon: FiClock,
      color: "text-amber-600 bg-amber-50",
      trend: "Action needed",
    },
    {
      label: "Hours Worked",
      value: "142 hrs",
      icon: FiCalendar,
      color: "text-purple-600 bg-purple-50",
      trend: "This month",
    },
  ];

  const recentRequests = [
    {
      id: "1",
      service: "Circuit Repair & Power Backup",
      customer: "John Smith",
      date: "Aug 15, 2026",
      time: "02:30 PM",
      price: "$500.00",
      status: "ACCEPTED",
    },
    {
      id: "2",
      service: "Ceiling Fan Installation",
      customer: "Emily Davis",
      date: "Aug 16, 2026",
      time: "10:00 AM",
      price: "$120.00",
      status: "REQUESTED",
    },
    {
      id: "3",
      service: "Lighting Installation",
      customer: "Michael Brown",
      date: "Aug 17, 2026",
      time: "09:00 AM",
      price: "$85.00",
      status: "REQUESTED",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <FiTrendingUp className="w-3 h-3" />
                  {s.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {s.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Action & Upcoming Requests Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Recent Service Requests
            </h2>
            <Link
              href="/technician/bookings"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{req.service}</p>
                  <p className="text-xs text-slate-500">
                    {req.customer} • {req.date} • {req.time}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      req.status === "ACCEPTED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {req.status === "ACCEPTED" ? "Accepted" : "Pending"}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {req.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Profile Health */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">
              Profile Status
            </span>
            <h3 className="text-lg font-bold mt-1">6 Years Experience</h3>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
              ))}
              <span className="text-xs text-slate-400 ml-1">5.0 rating</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your profile is verified and active with 5 published skills and
              configured hourly rates.
            </p>
          </div>
          <Link
            href="/technician/profile"
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold transition-colors"
          >
            Edit Profile & Services <FiArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
