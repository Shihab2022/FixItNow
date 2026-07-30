"use client";

import React, { useState } from "react";
import {
  FiClock,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";

export default function TechnicianCalendarPage() {
  const [selectedDate, setSelectedDate] = useState("2026-08-02");

  const scheduleEvents = [
    {
      id: "EV-101",
      time: "09:00 AM - 11:00 AM",
      title: "Emergency Pipe Leak Repair",
      customer: "Alex Johnson",
      address: "742 Evergreen Terrace, Springfield",
      status: "confirmed",
    },
    {
      id: "EV-102",
      time: "01:30 PM - 03:00 PM",
      title: "Water Heater Diagnostic",
      customer: "Sarah Connor",
      address: "101 Ocean Drive, Suite 400",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Work Schedule & Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your daily appointments and availability slots.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <FiChevronLeft />
          </button>
          <span className="text-xs font-bold text-slate-800 px-3">
            August 2026
          </span>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Picker Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Select Date
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isSelected = day === 2;
              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDate(`2026-08-${day < 10 ? "0" + day : day}`)
                  }
                  className={`h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Schedule for{" "}
                <span className="text-blue-600">{selectedDate}</span>
              </h2>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full">
                {scheduleEvents.length} Appointments
              </span>
            </div>

            <div className="space-y-4">
              {scheduleEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <FiClock /> {evt.time}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">
                        {evt.title}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-full border border-emerald-200">
                      {evt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pl-2 pt-2 border-t border-slate-200">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <FiUser className="text-slate-400" /> {evt.customer}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <FiMapPin className="text-rose-500" /> {evt.address}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
