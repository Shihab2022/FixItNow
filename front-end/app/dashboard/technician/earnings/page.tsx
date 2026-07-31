"use client";

import React from "react";
import { FiDownload } from "react-icons/fi";

export default function TechnicianEarningsPage() {
  const payoutHistory = [
    {
      id: "PAY-8801",
      date: "Jul 31, 2026",
      amount: 850.0,
      status: "completed",
      method: "Direct Deposit (•••• 4012)",
    },
    {
      id: "PAY-8802",
      date: "Jul 24, 2026",
      amount: 920.0,
      status: "completed",
      method: "Direct Deposit (•••• 4012)",
    },
    {
      id: "PAY-8803",
      date: "Jul 17, 2026",
      amount: 780.0,
      status: "completed",
      method: "Direct Deposit (•••• 4012)",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Earnings & Payouts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track payouts, weekly earnings, and bank account settings.
          </p>
        </div>
        <button
          onClick={() => alert("Requesting instant payout transfer...")}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 w-fit"
        >
          Request Instant Payout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            Available Balance
          </span>
          <p className="text-3xl font-black text-slate-900">$870.00</p>
          <p className="text-xs text-slate-500">Scheduled for Friday payout</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            Total Billed This Month
          </span>
          <p className="text-3xl font-black text-slate-900">$3,420.00</p>
          <p className="text-xs font-semibold text-emerald-600">+18% vs June</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">
            Average Job Value
          </span>
          <p className="text-3xl font-black text-slate-900">$142.50</p>
          <p className="text-xs text-slate-500">Across 24 jobs</p>
        </div>
      </div>

      {/* Payout Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-900 text-base">
            Payout Statements
          </h2>
          <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
            <FiDownload /> Download Tax Forms (1099)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Payout Reference</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {payoutHistory.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-mono font-bold text-slate-800 text-xs">
                    {p.id}
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-xs">{p.date}</td>
                  <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                    {p.method}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    ${p.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
