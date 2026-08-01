"use client";

import React, { useState } from "react";
import {
  FiCheck,
  FiX,
  FiCheckCircle,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";

export type BookingStatus = "REQUESTED" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: string;
  status: BookingStatus;
  scheduledDate: string;
  totalPrice: number;
  paymentStatus: "PENDING" | "COMPLETED";
  customerId: string;
  serviceId: string;
  createdAt: string;
}

const initialBookings: Booking[] = [
  {
    id: "49a0992f-4756-4a11-9c27-2a9242157c06",
    status: "REQUESTED",
    scheduledDate: "2026-08-15T14:30:00.000Z",
    totalPrice: 500,
    paymentStatus: "PENDING",
    customerId: "aed43669-4aed-41ce-970c-2d876da9116b",
    serviceId: "3728988d-e769-4277-bf85-adbe356255f0",
    createdAt: "2026-07-09T09:40:03.150Z",
  },
  {
    id: "002ee3c9-b4c1-47dd-b915-9a2025b9b07f",
    status: "ACCEPTED",
    scheduledDate: "2026-08-15T14:30:00.000Z",
    totalPrice: 500,
    paymentStatus: "COMPLETED",
    customerId: "aed43669-4aed-41ce-970c-2d876da9116b",
    serviceId: "3728988d-e769-4277-bf85-adbe356255f0",
    createdAt: "2026-07-08T09:03:30.269Z",
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-sm text-slate-500">
            Accept incoming service requests or mark accepted jobs as completed.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Scheduled Date</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map((booking) => {
                const date = new Date(booking.scheduledDate);
                return (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">
                      #{booking.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-900 font-medium">
                        <FiCalendar className="text-slate-400" />
                        {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ${booking.totalPrice}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : booking.status === "REQUESTED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : booking.status === "COMPLETED"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {booking.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      {booking.status === "REQUESTED" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateStatus(booking.id, "ACCEPTED")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <FiCheck className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, "REJECTED")}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <FiX className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      )}

                      {booking.status === "ACCEPTED" && (
                        <button
                          onClick={() => updateStatus(booking.id, "COMPLETED")}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}

                      {booking.status === "COMPLETED" && (
                        <span className="text-xs text-slate-400 italic">Job Finished</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}