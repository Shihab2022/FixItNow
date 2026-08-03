/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { toastTypes } from "@/app/constant";
import { showToast } from "@/components/toast/toast";
import { updateBookingStatus } from "@/service/technician";
import { useState } from "react";
import {
  FiCheck,
  FiX,
  FiCheckCircle,
  FiCalendar,
  FiSearch,
  FiClock,
  FiUser,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiPhone,
  FiPlay,
  FiAlertTriangle,
} from "react-icons/fi";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Service {
  id: string;
  title: string;
  price: number;
  description: string;
  location: string;
  status: boolean;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime?: string;
  totalPrice: number;
  customerAddress?: string;
  notes?: string;
  paymentStatus: "PENDING" | "COMPLETED";
  customerId: string;
  technicianId?: string;
  serviceId: string;
  createdAt: string;
  updatedAt?: string;
  customer?: Customer;
  service?: Service;
}

export default function BookingsPage({ bookingsData }: any) {
  const [bookings, setBookings] = useState<Booking[]>(bookingsData || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [declineBookingId, setDeclineBookingId] = useState<string | null>(null);

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    const res = await updateBookingStatus({ id, status: newStatus });
    if (res.data.success) {
      showToast(toastTypes.SUCCESS, `Booking status updated to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
      );
    }
  };

  const handleConfirmDecline = () => {
    if (declineBookingId) {
      updateStatus(declineBookingId, "CANCELLED");
      setDeclineBookingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.id.toLowerCase().includes(term) ||
      b.customer?.name.toLowerCase().includes(term) ||
      b.customer?.email.toLowerCase().includes(term) ||
      b.service?.title.toLowerCase().includes(term) ||
      b.customerAddress?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "REQUESTED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACCEPTED":
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "COMPLETED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DECLINED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Booking Management
          </h1>
          <p className="text-sm text-slate-500">
            Review service requests, manage job statuses, and monitor scheduling
            details.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search ID, customer, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Reference & Service</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Work Location</th>
                <th className="px-6 py-3.5">Schedule</th>
                <th className="px-6 py-3.5">Amount & Payment</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map((booking) => {
                const date = new Date(booking.scheduledDate);
                const isExpanded = expandedId === booking.id;
                const locationAddress =
                  booking.customerAddress ||
                  booking.customer?.address ||
                  "Address unavailable";

                return (
                  <tr
                    key={booking.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Reference & Service */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpand(booking.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? (
                            <FiChevronUp className="w-4 h-4" />
                          ) : (
                            <FiChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <span className="font-mono text-xs font-semibold text-slate-900 block">
                            #{booking.id.slice(0, 8)}
                          </span>
                          <span className="text-xs font-medium text-slate-700 block mt-0.5">
                            {booking.service?.title || "Custom Service"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
                          <FiUser className="text-slate-400 shrink-0" />
                          {booking.customer?.name || "N/A"}
                        </div>
                        {booking.customer?.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <FiPhone className="text-slate-400 shrink-0" />
                            {booking.customer.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Work Location */}
                    <td className="px-6 py-4 align-top max-w-xs">
                      <div className="flex items-start gap-1.5 text-xs text-slate-700">
                        <FiMapPin className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2" title={locationAddress}>
                          {locationAddress}
                        </span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
                          <FiCalendar className="text-slate-400 shrink-0" />
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        {booking.scheduledTime && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <FiClock className="text-slate-400 shrink-0" />
                            {booking.scheduledTime}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Amount & Payment Status */}
                    <td className="px-6 py-4 align-top">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          ${booking.totalPrice}
                        </span>
                        <span
                          className={`inline-block text-[10px] font-semibold uppercase mt-0.5 ${
                            booking.paymentStatus === "COMPLETED"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    {/* Lifecycle Action Buttons */}
                    <td className="px-6 py-4 align-top text-right">
                      {booking.status === "REQUESTED" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateStatus(booking.id, "ACCEPTED")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <FiCheck className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => setDeclineBookingId(booking.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <FiX className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      )}

                      {booking.status === "ACCEPTED" && (
                        <button
                          onClick={() =>
                            updateStatus(booking.id, "IN_PROGRESS")
                          }
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <FiPlay className="w-3.5 h-3.5" /> Start Job
                        </button>
                      )}

                      {booking.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => updateStatus(booking.id, "COMPLETED")}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" /> Complete Job
                        </button>
                      )}

                      {booking.status === "COMPLETED" && (
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                          Finished
                        </span>
                      )}

                      {booking.status === "DECLINED" && (
                        <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          Declined
                        </span>
                      )}

                      {booking.status === "CANCELLED" && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Decline Action */}
      {declineBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-full shrink-0">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Decline Service Booking?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to decline this booking (Ref: #
                  {declineBookingId.slice(0, 8)})? This action will notify the
                  customer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeclineBookingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
