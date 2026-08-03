// app/admin/overview/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiGrid,
  FiShield,
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardOverview } from "@/service/admin";

interface OverviewData {
  metrics: {
    totalVolume: number;
    volumeGrowth: number;
    activeTechnicians: number;
    pendingTechnicians: number;
    totalBookings: number;
    successRate: number;
    platformCommission: number;
  };
  chartData: Array<{
    month: string;
    revenue: number;
    commission: number;
  }>;
}

const OverviewPage = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await getDashboardOverview();
        if (response.data.success) {
          const result = await response.data.data;
          setData(result);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const metrics = data?.metrics;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform management, real-time stats, and system oversight.
          </p>
        </div>
        <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200 flex items-center gap-1">
          <FiShield /> Super Admin Mode
        </span>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Volume */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">
              Marketplace Volume
            </span>
            <FiDollarSign className="text-slate-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            $
            {metrics?.totalVolume.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }) || "0.00"}
          </p>
          <p
            className={`text-xs font-semibold ${metrics && metrics.volumeGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {metrics && metrics.volumeGrowth >= 0
              ? `+${metrics.volumeGrowth}%`
              : `${metrics?.volumeGrowth}%`}{" "}
            vs last month
          </p>
        </div>

        {/* Active Technicians */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">
              Active Technicians
            </span>
            <FiUsers className="text-slate-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics?.activeTechnicians || 0} Pros
          </p>
          <p className="text-xs text-slate-500">
            {metrics?.pendingTechnicians || 0} pending verification
          </p>
        </div>

        {/* Bookings */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Bookings</span>
            <FiCheckCircle className="text-slate-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics?.totalBookings.toLocaleString() || 0}
          </p>
          <p className="text-xs font-semibold text-blue-600">
            {metrics?.successRate || "0.0"}% success rate
          </p>
        </div>

        {/* Commission */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">
              Platform Commission
            </span>
            <FiTrendingUp className="text-slate-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            $
            {metrics?.platformCommission.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }) || "0.00"}
          </p>
          <p className="text-xs text-slate-500">15% platform take rate</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Revenue & Commission Growth
            </h2>
            <p className="text-xs text-slate-500">
              Monthly financial performance breakdown
            </p>
          </div>
        </div>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.chartData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(val) => `$${val}`}
              />
              {/* <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                }}
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  "Amount",
                ]}
              /> */}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Marketplace Volume"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/admin/categories"
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
          href="/dashboard/admin/technicians"
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
};

export default OverviewPage;
