"use client";

import { mockAdminStats } from "@/mock/data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Admin Control Center
        </h1>
        <p className="text-sm text-slate-500">
          Platform-wide activity monitoring and user moderation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockAdminStats.map((stat, i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2"
          >
            <p className="text-xs font-bold uppercase text-slate-400">
              {stat.title}
            </p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <span className="inline-block text-xs font-bold text-teal-600">
              {stat.change} vs last month
            </span>
          </div>
        ))}
      </div>

      {/* User Moderation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Recent Registrations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-bold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Marcus Vance
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                    Technician
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-teal-600 font-bold text-xs">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-xs text-red-600 font-bold hover:underline">
                    Suspend
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
