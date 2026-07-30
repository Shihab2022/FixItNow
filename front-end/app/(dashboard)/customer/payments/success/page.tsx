"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiDownload,
  FiArrowRight,
} from "react-icons/fi";
import { mockBookings } from "@/mock/data";

export default function PaymentSuccessPage() {
  const booking = mockBookings[0];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
          <FiCheckCircle />
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          Payment Authorized!
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Your booking has been confirmed. A receipt and appointment summary
          have been sent to your email.
        </p>
      </motion.div>

      {/* Invoice Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-5"
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Order Ref
            </span>
            <p className="font-mono font-bold text-slate-800 text-sm">
              #{booking.id}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
            Paid in Full
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">
            {booking.serviceTitle}
          </h2>
          <p className="text-xs text-slate-500">
            Assigned Professional:{" "}
            <span className="font-semibold text-slate-700">
              {booking.technicianName}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <FiCalendar className="text-blue-600" /> Date & Time
            </span>
            <p className="font-bold text-slate-800">{booking.bookingDate}</p>
            <p className="text-slate-500">{booking.timeSlot}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <FiMapPin className="text-rose-500" /> Service Address
            </span>
            <p className="font-bold text-slate-800 line-clamp-2">
              {booking.address}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 text-sm font-bold text-slate-900">
          <span>Amount Paid</span>
          <span className="text-xl text-blue-600">${booking.amount}.00</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/customer/bookings/${booking.id}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          View Booking Details <FiArrowRight />
        </Link>
        <button
          onClick={() => alert("Downloading official receipt PDF...")}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <FiDownload /> Download Receipt
        </button>
      </div>
    </div>
  );
}
