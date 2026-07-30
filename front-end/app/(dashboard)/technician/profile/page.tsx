"use client";

import Image from "next/image";
import { FiCheckCircle, FiStar } from "react-icons/fi";
import { mockTechnicians } from "@/mock/data";

export default function TechnicianProfilePage() {
  const tech = mockTechnicians[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Public Profile & Verification
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage public profile details and verification credentials.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Image
            src={tech.avatar}
            alt={tech.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-600 shadow-md"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">{tech.name}</h2>
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-200 flex items-center gap-1">
                <FiCheckCircle /> Verified Pro
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{tech.title}</p>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-amber-500 font-bold pt-1">
              <FiStar className="fill-amber-400" /> {tech.rating} (
              {tech.reviewCount} Reviews)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              readOnly
              value="marcus.vance@pro.fixit.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              readOnly
              value="+1 (555) 234-5678"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            Bio / Overview
          </label>
          <textarea
            rows={3}
            defaultValue={tech.bio}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={() => alert("Profile updated successfully!")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Save Profile Changes
          </button>
        </div>
      </div>
    </div>
  );
}
