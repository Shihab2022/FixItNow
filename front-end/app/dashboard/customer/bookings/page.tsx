"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiEye,
  FiXCircle,
  FiChevronRight,
} from "react-icons/fi";
import { mockBookings } from "@/mock/data";
import { BookingStatus } from "@/types";

export default function CustomerBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter logic
  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.technicianName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-teal-50 text-teal-700 border-teal-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };

    const labels = {
      pending: "Pending Approval",
      confirmed: "Confirmed",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track, manage, and review all your scheduled home service requests.
          </p>
        </div>
        <Link
          href="/services"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 w-fit"
        >
          + Book New Service
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by service, technician, or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <FiFilter className="text-slate-400 text-sm mr-1 hidden sm:block" />
          {["all", "confirmed", "in_progress", "completed", "cancelled"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab === "all"
                  ? "All Requests"
                  : tab.replace("_", " ").toUpperCase()}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Bookings List Table / Cards */}
      {filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            <FiCalendar />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No bookings found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {` We couldn't find any service requests matching your criteria.`}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Clear Search & Filters
          </button>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Service / ID</th>
                  <th className="py-4 px-6">Technician</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Service & ID */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <Link
                          href={`/customer/bookings/${booking.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                        >
                          {booking.serviceTitle}
                        </Link>
                        <span className="text-xs font-mono text-slate-400">
                          #{booking.id}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Technician */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.technicianAvatar}
                          alt={booking.technicianName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">
                            {booking.technicianName}
                          </p>
                          <span className="text-[10px] text-teal-600 font-bold">
                            Verified Pro
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5 font-medium text-slate-800">
                          <FiCalendar className="text-blue-600" />{" "}
                          {booking.bookingDate}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400">
                          <FiClock /> {booking.timeSlot}
                        </p>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">
                        ${booking.amount}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-teal-600">
                        {booking.paymentStatus}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {getStatusBadge(booking.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customer/bookings/${booking.id}`}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye className="text-lg" />
                        </Link>
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() =>
                              alert(`Cancel request sent for ${booking.id}`)
                            }
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Booking"
                          >
                            <FiXCircle className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
