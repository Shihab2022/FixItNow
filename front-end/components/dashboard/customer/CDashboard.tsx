"use client";

import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiArrowRight,
  FiStar,
  FiMapPin,
} from "react-icons/fi";
import Link from "next/link";

const CDashboard = () => {
  const stats = [
    {
      label: "Upcoming Services",
      value: "1 Service",
      icon: FiCalendar,
      color: "text-blue-600 bg-blue-50",
      change: "+2 this week",
    },
    {
      label: "Completed Jobs",
      value: "12 Services",
      icon: FiCheckCircle,
      color: "text-emerald-600 bg-emerald-50",
      change: "100% success",
    },
    {
      label: "Total Spent",
      value: "$1,420",
      icon: FiDollarSign,
      color: "text-amber-600 bg-amber-50",
      change: "This month",
    },
    {
      label: "Saved Favorites",
      value: "3 Techs",
      icon: FiStar,
      color: "text-purple-600 bg-purple-50",
      change: "Quick book",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, Sarah 👋
          </h1>
          <p className="text-sm text-slate-500">
            Here is what is happening with your home service requests.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Upcoming Booking Focus */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Next Scheduled Service</h2>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase border border-emerald-500/30">
              Confirmed
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Emergency Pipe Leak Repair</h3>
              <p className="text-sm text-slate-300 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5" />
                Aug 15, 2026 • 02:30 PM
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <FiMapPin className="w-3.5 h-3.5" />
                742 Evergreen Terrace, San Francisco, CA
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-300">$170.00</p>
                <p className="text-xs text-slate-400">Technician: Marcus Vance</p>
              </div>
              <Link
                href="/customer/bookings"
                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
              >
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/category"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Book a Service</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Browse categories and find a technician
                </p>
              </div>
              <FiArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
          <Link
            href="/customer/payments/history"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Payment History</h3>
                <p className="text-xs text-slate-500 mt-1">
                  View your past transactions and receipts
                </p>
              </div>
              <FiArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default CDashboard;
