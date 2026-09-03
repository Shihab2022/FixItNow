/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { getAllBookings } from "@/service/admin";
import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiUser,
  FiTool,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

// Enums / Types matching your Prisma & API payload
export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Booking {
  id: string;
  status: BookingStatus;
  scheduledDate: string;
  totalPrice: number;
  customerAddress: string | null;
  notes: string | null;
  paymentStatus: PaymentStatus;
  customerId: string;
  technicianId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
}

export const BookingTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const getBooking = async () => {
    const res = await getAllBookings();
    if (res?.data?.success) {
      setAllBookings(res.data.data);
    }
  };
  useEffect(() => {
    getBooking();
  }, []);
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Accepted
          </span>
        );
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FiClock className="w-3.5 h-3.5 text-blue-500" />
            Requested
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FiCheckCircle className="w-3.5 h-3.5 text-purple-500" />
            Completed
          </span>
        );
      case "REJECTED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <FiAlertCircle className="w-3.5 h-3.5 text-rose-500" />
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus: PaymentStatus) => {
    return paymentStatus === "COMPLETED" ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
        Pending
      </span>
    );
  };

  const filteredBookings = allBookings.filter(
    (booking) =>
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.technicianId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header & Search Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Bookings Overview
          </h2>
          <p className="text-sm text-slate-500">
            View booking status, schedule dates, pricing, and payment states.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by ID or Reference..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Booking Reference
              </th>
              <th scope="col" className="px-6 py-3.5">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5">
                Scheduled Date
              </th>
              <th scope="col" className="px-6 py-3.5">
                Amount
              </th>
              <th scope="col" className="px-6 py-3.5">
                Payment
              </th>
              <th scope="col" className="px-6 py-3.5">
                Customer & Tech IDs
              </th>
              <th scope="col" className="px-6 py-3.5">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const scheduled = new Date(booking.scheduledDate);
                const created = new Date(booking.createdAt);

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Booking ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200">
                        #{booking.id.slice(0, 8)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <FiTool className="w-3 h-3" /> Svc:{" "}
                        {booking.serviceId.slice(0, 8)}...
                      </div>
                    </td>

                    {/* Booking Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>

                    {/* Scheduled Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                        {scheduled.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 pl-5">
                        {scheduled.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                      <span className="inline-flex items-center text-slate-900">
                        <FiDollarSign className="w-3.5 h-3.5 text-slate-500" />
                        {booking.totalPrice.toLocaleString()}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </td>

                    {/* Customer & Technician IDs */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-1 text-slate-700">
                        <FiUser className="w-3.5 h-3.5 text-slate-400" />
                        Cust:{" "}
                        <span className="font-mono">
                          {booking.customerId.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 mt-1">
                        <FiTool className="w-3.5 h-3.5 text-slate-400" />
                        Tech:{" "}
                        <span className="font-mono">
                          {booking.technicianId.slice(0, 8)}...
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {created.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">1</span> to{" "}
          <span className="font-medium text-slate-700">
            {filteredBookings.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {filteredBookings.length}
          </span>{" "}
          entries
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
