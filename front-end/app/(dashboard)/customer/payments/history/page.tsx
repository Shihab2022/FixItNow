"use client";

import { useState } from "react";
import {
  FiSearch,
  FiDollarSign,
  FiDownload,
  FiCreditCard,
  FiCheckCircle,
} from "react-icons/fi";

const mockPaymentHistory = [
  {
    id: "INV-2026-001",
    serviceTitle: "Emergency Pipe Leak Repair",
    technicianName: "Marcus Vance",
    amount: 170.0,
    status: "paid",
    date: "2026-07-28",
    method: "•••• 4242",
  },
  {
    id: "INV-2026-002",
    serviceTitle: "AC Unit Tune-up & Filter Clean",
    technicianName: "Sarah Jenkins",
    amount: 120.0,
    status: "paid",
    date: "2026-06-14",
    method: "PayPal",
  },
  {
    id: "INV-2026-003",
    serviceTitle: "Smart Light Switch Installation",
    technicianName: "David Miller",
    amount: 95.0,
    status: "refunded",
    date: "2026-05-02",
    method: "•••• 8819",
  },
];

export default function PaymentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = mockPaymentHistory.filter(
    (p) =>
      p.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technicianName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Payment & Invoices
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your transaction history and download official tax receipts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Total Lifetime Spent
            </p>
            <p className="text-xl font-bold text-slate-900">$385.00</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Paid Invoices
            </p>
            <p className="text-xl font-bold text-slate-900">2 Complete</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-xl">
            <FiCreditCard />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Default Method
            </p>
            <p className="text-sm font-bold text-slate-800">
              Visa ending in 4242
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by invoice ID, service name, or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Invoice ID</th>
                <th className="py-4 px-6">Service</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPayments.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-6 font-mono font-bold text-slate-800 text-xs">
                    {item.id}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">
                      {item.serviceTitle}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.technicianName}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    {item.date}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                    {item.method}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    ${item.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() =>
                        alert(`Downloading ${item.id} receipt PDF...`)
                      }
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <FiDownload /> PDF
                    </button>
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
