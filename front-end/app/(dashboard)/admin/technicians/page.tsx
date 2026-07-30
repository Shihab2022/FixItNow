"use client";

import Image from "next/image";
import { FiCheck, FiX, FiShield } from "react-icons/fi";
import { mockTechnicians } from "@/mock/data";

export default function AdminTechniciansPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Technician Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review pro background checks, verify credentials, and grant platform
          access.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">Technician</th>
              <th className="py-4 px-6">Specialization</th>
              <th className="py-4 px-6">Rating</th>
              <th className="py-4 px-6">Verification</th>
              <th className="py-4 px-6 text-right">Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {mockTechnicians.map((tech) => (
              <tr key={tech.id} className="hover:bg-slate-50/50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Image
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {tech.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ID: #{tech.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                  {tech.title}
                </td>
                <td className="py-4 px-6 text-xs text-amber-500 font-bold">
                  ★ {tech.rating}
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <FiShield /> Background Clear
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => alert(`Approved ${tech.name}`)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => alert(`Suspended ${tech.name}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <FiX /> Suspend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
