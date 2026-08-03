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
  FiTool,
  FiStar,
  FiBriefcase,
  FiArrowRight,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardOverview } from "@/service/admin";

interface DashboardData {
  metrics: {
    totalVolume: number;
    volumeGrowth: number;
    activeTechnicians: number;
    pendingTechnicians: number;
    totalBookings: number;
    successRate: number;
    platformCommission: number;
    totalCustomers: number;
    avgBookingValue: number;
    totalServices: number;
    averageRating: number;
  };
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  bookingStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  categoryPerformance: Array<{
    name: string;
    bookingsCount: number;
  }>;
  recentBookings: Array<{
    id: string;
    serviceTitle: string;
    customerName: string;
    technicianName: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#10b981",
  ACCEPTED: "#3b82f6",
  IN_PROGRESS: "#8b5cf6",
  REQUESTED: "#f59e0b",
  CANCELLED: "#ef4444",
};

const OverviewPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await getDashboardOverview();
        if (response?.data?.success) {
          const result = response.data.data;
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
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
            Platform management, stats, and system oversight.
          </p>
        </div>
        <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200 flex items-center gap-1">
          <FiShield /> Super Admin Mode
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Volume */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase text-slate-400">
              Total Marketplace Volume
            </span>
            <FiDollarSign className="text-slate-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            $
            {metrics?.totalVolume.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
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
            <span className="text-xs font-bold uppercase text-slate-400">
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

        {/* Customer Bookings */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase text-slate-400">
              Total Customer Bookings
            </span>
            <FiCheckCircle className="text-slate-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics?.totalBookings.toLocaleString() || 0}
          </p>
          <p className="text-xs font-semibold text-blue-600">
            {metrics?.successRate || "0.0"}% success rate
          </p>
        </div>

        {/* Platform Commission */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase text-slate-400">
              Platform Commission
            </span>
            <FiTrendingUp className="text-slate-400 text-base" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            $
            {metrics?.platformCommission.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
          <p className="text-xs text-slate-500">15% platform take rate</p>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4   bg-white rounded-2xl border border-slate-200 shadow-sm ">
        <div className="flex items-center gap-3 p-2">
          <div className="p-3 border rounded-xl text-blue-400 text-xl">
            <FiUsers />
          </div>
          <div>
            <p className="text-xs  font-medium">Total Customers</p>
            <p className="text-lg font-bold">{metrics?.totalCustomers || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <div className="p-3 border rounded-xl text-emerald-400 text-xl">
            <FiBriefcase />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">
              Avg Order Value
            </p>
            <p className="text-lg font-bold">
              ${metrics?.avgBookingValue?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <div className="p-3 border rounded-xl text-purple-400 text-xl">
            <FiTool />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">
              Listed Services
            </p>
            <p className="text-lg font-bold">{metrics?.totalServices || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <div className="p-3 border rounded-xl text-amber-400 text-xl">
            <FiStar />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">
              Avg Platform Rating
            </p>
            <p className="text-lg font-bold">
              {metrics?.averageRating
                ? `${metrics.averageRating} / 5.0`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Booking Trends (Area Chart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Revenue & Marketplace Growth
              </h2>
              <p className="text-xs text-slate-500">
                Gross revenue generated across all completed transactions
              </p>
            </div>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyTrends || []}>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                  }}
                  formatter={(value: unknown) => [
                    `$${typeof value === "number" ? value.toFixed(2) : "0.00"}`,
                    "Amount",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Gross Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Breakdown (Pie Chart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Booking Status
            </h2>
            <p className="text-xs text-slate-500">
              Distribution of all system bookings
            </p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.bookingStatusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {(data?.bookingStatusBreakdown || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || "#cbd5e1"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {(data?.bookingStatusBreakdown || []).map((item) => (
              <div
                key={item.status}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: STATUS_COLORS[item.status] || "#cbd5e1",
                  }}
                ></span>
                <span className="font-medium capitalize">
                  {item.status.toLowerCase().replace("_", " ")}:
                </span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance (Bar Chart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Top Categories
            </h2>
            <p className="text-xs text-slate-500">
              Most requested service categories
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.categoryPerformance || []}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#475569", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="bookingsCount"
                  fill="#0d9488"
                  radius={[0, 8, 8, 0]}
                  name="Bookings"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings Activity Feed */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Bookings
              </h2>
              <p className="text-xs text-slate-500">
                Latest activity across the platform
              </p>
            </div>
            <Link
              href="/dashboard/admin/bookings"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Technician</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recentBookings || []).map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 font-semibold text-slate-900">
                      {booking.serviceTitle}
                    </td>
                    <td className="py-3 text-slate-600">
                      {booking.customerName}
                    </td>
                    <td className="py-3 text-slate-600">
                      {booking.technicianName}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      ${booking.amount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{
                          backgroundColor: `${STATUS_COLORS[booking.status]}15`,
                          color: STATUS_COLORS[booking.status] || "#475569",
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
