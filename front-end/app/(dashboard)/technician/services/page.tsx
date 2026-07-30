"use client";

import { useState } from "react";
import { FiTool, FiPlus, FiDollarSign } from "react-icons/fi";

export default function TechnicianServicesPage() {
  const [services, setServices] = useState([
    {
      id: "1",
      title: "Plumbing Repair & Pipe Unclogging",
      rate: 85,
      enabled: true,
    },
    {
      id: "2",
      title: "Water Heater Diagnostic & Servicing",
      rate: 120,
      enabled: true,
    },
    { id: "3", title: "Main Line Leak Patching", rate: 150, enabled: false },
  ]);

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Offered Services
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enable skills and customize your hourly rates.
          </p>
        </div>
        <button
          onClick={() => alert("Add new service modal opened")}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 w-fit flex items-center gap-2"
        >
          <FiPlus /> Add Specialty
        </button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">
                <FiTool />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                  <FiDollarSign className="text-emerald-600" /> ${service.rate}
                  .00 / hour
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <span
                className={`text-xs font-bold ${service.enabled ? "text-emerald-600" : "text-slate-400"}`}
              >
                {service.enabled ? "Active Listing" : "Disabled"}
              </span>
              <button
                onClick={() => toggleService(service.id)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  service.enabled ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    service.enabled ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
