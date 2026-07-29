"use client";

import React from "react";
import { mockBookings } from "@/mock/data";
import { FiMapPin } from "react-icons/fi";

export default function TechnicianDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Technician Portal</h1>
        <p className="text-sm text-slate-500">
          Manage your upcoming jobs and service earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">{`Today's Jobs`}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">3 Bookings</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">
            Monthly Revenue
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">$4,850.00</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">
            Completion Score
          </p>
          <p className="text-2xl font-black text-teal-600 mt-1">99.2%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Assigned Jobs</h2>
        <div className="divide-y divide-slate-100">
          {mockBookings.map((job) => (
            <div
              key={job.id}
              className="py-4 flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
              <div>
                <h3 className="font-bold text-slate-900">{job.serviceTitle}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <FiMapPin /> {job.address}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {job.timeSlot}
                </span>
                <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs">
                  Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
