"use client";

import React, { useState } from "react";
import {
  FiClock,
  FiPlus,
  FiTrash2,
  FiSave,
} from "react-icons/fi";

type TimeSlot = { start: string; end: string };
type DaySchedule = { enabled: boolean; slots: TimeSlot[] };

type AvailabilityState = Record<string, DaySchedule>;

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<AvailabilityState>({
    monday: {
      enabled: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "18:00" },
      ],
    },
    tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    wednesday: { enabled: true, slots: [{ start: "10:00", end: "16:00" }] },
    thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    friday: { enabled: true, slots: [{ start: "09:00", end: "15:00" }] },
    saturday: { enabled: true, slots: [{ start: "10:00", end: "14:00" }] },
    sunday: { enabled: false, slots: [] },
  });

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const addSlot = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeSlot = (day: string, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Weekly Availability Scheduler
          </h1>
          <p className="text-sm text-slate-500">
            Define your working slots so customers can book according to your
            schedule.
          </p>
        </div>
        <button
          onClick={() => alert("Availability saved!")}
          className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5"
        >
          <FiSave className="w-4 h-4" /> Save Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {DAYS.map((day) => {
          const config = schedule[day];
          return (
            <div
              key={day}
              className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              {/* Day Toggle */}
              <div className="flex items-center gap-3 w-36">
                <input
                  type="checkbox"
                  id={`toggle-${day}`}
                  checked={config.enabled}
                  onChange={() => toggleDay(day)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`toggle-${day}`}
                  className="font-semibold text-sm capitalize text-slate-900"
                >
                  {day}
                </label>
              </div>

              {/* Time Slots */}
              <div className="flex-1 space-y-2">
                {config.enabled ? (
                  config.slots.length > 0 ? (
                    config.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
                          <FiClock className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="time"
                            value={slot.start}
                            readOnly
                            className="bg-transparent focus:outline-none"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={slot.end}
                            readOnly
                            className="bg-transparent focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlot(day, idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      No slots added
                    </span>
                  )
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Unavailable on {day}s
                  </span>
                )}
              </div>

              {/* Add Slot Button */}
              {config.enabled && (
                <button
                  type="button"
                  onClick={() => addSlot(day)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add Slot
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
