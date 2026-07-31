"use client";

import Link from "next/link";
import { FiUsers, FiGrid, FiShield } from "react-icons/fi";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform management, stats, and system oversight.
          </p>
        </div>
        <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200 flex items-center gap-1">
          <FiShield /> Super Admin Mode
        </span>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            Total Marketplace Volume
          </span>
          <p className="text-2xl font-black text-slate-900">$124,500.00</p>
          <p className="text-xs font-semibold text-emerald-600">
            +22% vs last month
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            Active Technicians
          </span>
          <p className="text-2xl font-black text-slate-900">142 Pros</p>
          <p className="text-xs text-slate-500">12 pending verification</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            Total Customer Bookings
          </span>
          <p className="text-2xl font-black text-slate-900">1,890</p>
          <p className="text-xs font-semibold text-blue-600">
            99.2% success rate
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            Platform Commission
          </span>
          <p className="text-2xl font-black text-slate-900">$18,675.00</p>
          <p className="text-xs text-slate-500">15% platform take rate</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/categories"
          className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FiGrid />
            </div>
            <span className="text-xs font-bold text-blue-600">
              Manage Categories →
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-4">
            Service Categories
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Add, update, or remove service offerings and base pricing rules.
          </p>
        </Link>

        <Link
          href="/admin/technicians"
          className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl text-2xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <FiUsers />
            </div>
            <span className="text-xs font-bold text-teal-600">
              Manage Technicians →
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-4">
            Technician Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review credentials, background checks, and active registrations.
          </p>
        </Link>
      </div>
    </div>
  );
}
