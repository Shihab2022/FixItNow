"use client";

import { motion } from "framer-motion";
import { mockBookings } from "@/mock/data";
import { FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, Sarah 👋
        </h1>
        <p className="text-sm text-slate-500">
          Here is what’s happening with your home service requests.
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FiCalendar className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Upcoming Services
            </p>
            <p className="text-xl font-bold text-slate-900">1 Service</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <FiCheckCircle className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Completed Jobs
            </p>
            <p className="text-xl font-bold text-slate-900">12 Services</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiClock className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Spent
            </p>
            <p className="text-xl font-bold text-slate-900">$1,420.00</p>
          </div>
        </div>
      </div>

      {/* Upcoming Booking Focus */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">
            Next Scheduled Service
          </h2>
          <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase">
            Confirmed
          </span>
        </div>

        {mockBookings.slice(0, 1).map((booking) => (
          <div
            key={booking.id}
            className="flex flex-col md:flex-row justify-between md:items-center gap-4 pt-2"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">
                {booking.serviceTitle}
              </h3>
              <p className="text-sm text-slate-500">
                Technician:{" "}
                <span className="font-semibold text-slate-700">
                  {booking.technicianName}
                </span>
              </p>
              <p className="text-xs text-slate-400">{booking.address}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-semibold text-blue-600">
                {booking.bookingDate}
              </p>
              <p className="text-xs text-slate-500">{booking.timeSlot}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
