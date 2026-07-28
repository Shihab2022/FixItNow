"use client";

import { Search, MapPin, Calendar, Wrench } from "lucide-react";

export function SearchBookingCard() {
  return (
    <div id="search" className="relative mx-auto -mt-12 max-w-5xl px-4 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl sm:p-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Category Input */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
            <Wrench className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex flex-col w-full">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Service
              </label>
              <select className="bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer">
                <option>All Services</option>
                <option>Electrical Repairs</option>
                <option>Plumbing Solutions</option>
                <option>Home Cleaning</option>
                <option>AC Repair & Maintenance</option>
              </select>
            </div>
          </div>

          {/* Location Input */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
            <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex flex-col w-full">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter Zip or City"
                className="bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Date Preferred */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
            <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex flex-col w-full">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Date
              </label>
              <input
                type="date"
                className="bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 px-6 font-semibold text-white transition hover:bg-blue-700 shadow-md"
          >
            <Search className="h-5 w-5" />
            <span>Search Pros</span>
          </button>
        </form>
      </div>
    </div>
  );
}
