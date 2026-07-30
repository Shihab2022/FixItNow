"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMessageSquare,
  FiDownload,
} from "react-icons/fi";
import { mockBookings, mockTechnicians } from "@/mock/data";

export default function CustomerBookingDetailsPage() {
  const params = useParams();
  const bookingId = params.id as string;

  // Find target booking or fall back to default demo
  const booking =
    mockBookings.find((b) => b.id === bookingId) || mockBookings[0];
  const technician = mockTechnicians[0];

  const timelineSteps = [
    { title: "Booking Requested", date: booking.createdAt, completed: true },
    { title: "Technician Assigned", date: booking.createdAt, completed: true },
    {
      title: "Service Confirmed",
      date: booking.bookingDate,
      completed: booking.status !== "pending",
    },
    {
      title: "Service Completed",
      date: "Pending completion",
      completed: booking.status === "completed",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/customer/bookings"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <FiArrowLeft /> Back to Bookings
        </Link>
        <span className="text-xs font-mono bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold">
          ID: {booking.id}
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Banner Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                  Confirmed Booking
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-1">
                  {booking.serviceTitle}
                </h1>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                {booking.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <FiCalendar className="text-blue-600 text-base" />
                <div>
                  <p className="font-semibold text-slate-800">Scheduled Date</p>
                  <p className="text-slate-500">{booking.bookingDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <FiClock className="text-blue-600 text-base" />
                <div>
                  <p className="font-semibold text-slate-800">Time Window</p>
                  <p className="text-slate-500">{booking.timeSlot}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Service Status Progress
            </h2>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-2 my-4">
              {timelineSteps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-7.75 top-0.5 w-4 h-4 rounded-full border-2 bg-white ${
                      step.completed
                        ? "border-teal-600 bg-teal-600"
                        : "border-slate-300"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        step.completed ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {step.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Instructions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              Service Location
            </h2>
            <div className="flex items-start gap-3 text-xs text-slate-600">
              <FiMapPin className="text-rose-500 text-lg shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">
                  {booking.address}
                </p>
                <p className="text-slate-400 mt-1">
                  Note: Please ensure clear access to the main water turn-off
                  valve.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Technician & Payment Summary */}
        <div className="space-y-6">
          {/* Assigned Technician Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Assigned Professional
            </h3>

            <div className="flex items-center gap-4">
              <img
                src={technician.avatar}
                alt={technician.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {technician.name}
                </h4>
                <p className="text-xs text-slate-500">{technician.title}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 font-bold rounded text-[10px]">
                  ★ {technician.rating} ({technician.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => alert(`Calling ${technician.name}...`)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FiPhone /> Call
              </button>
              <button
                onClick={() => alert(`Opening chat with ${technician.name}...`)}
                className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FiMessageSquare /> Chat
              </button>
            </div>
          </div>

          {/* Payment & Receipt Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Payment Summary
            </h3>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Base Hourly Rate</span>
                <span>${booking.amount - 20}.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service & Trust Fee</span>
                <span>$20.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Total Paid</span>
              <span className="text-lg text-blue-600">
                ${booking.amount}.00
              </span>
            </div>

            <button
              onClick={() => alert("Downloading receipt PDF...")}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FiDownload /> Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
