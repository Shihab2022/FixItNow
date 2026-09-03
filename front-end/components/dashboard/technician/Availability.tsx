/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { toastTypes } from "@/app/constant";
import { showToast } from "@/components/toast/toast";
import { getSlot, updateSlot } from "@/service/technician";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FiClock,
  FiPlus,
  FiTrash2,
  FiSave,
  FiCheckCircle,
} from "react-icons/fi";

// The exact JSON structure your backend expects per request
export interface TimeSlot {
  start: string;
  end: string;
}

export interface DayPayload {
  day: string;
  slots: TimeSlot[];
}

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
function DayAvailabilityCard({
  day,
  initialSlots,
}: {
  day: string;
  initialSlots: TimeSlot[];
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const { register, control, handleSubmit } = useForm<DayPayload>({
    defaultValues: {
      day: day,
      slots: initialSlots,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slots",
  });
  const onSubmit = async (data: DayPayload) => {
    setIsUpdating(true);
    try {
      const res = await updateSlot(data);
      if (res?.data?.success) {
        showToast(toastTypes.SUCCESS, "Availability updated successfully");
      }

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (error) {
      console.error(`Failed to update ${day}:`, error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors hover:bg-slate-50/50"
    >
      {/* Day Title */}
      <div className="md:w-36 shrink-0 pt-2">
        <h3 className="font-semibold text-sm capitalize text-slate-900">
          {day}
        </h3>
        <input type="hidden" {...register("day")} value={day} />
      </div>

      {/* Time Slots Area */}
      <div className="flex-1 space-y-3">
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <FiClock className="w-3.5 h-3.5 text-slate-400" />

                {/* Start Time Input */}
                <input
                  type="time"
                  {...register(`slots.${index}.start` as const, {
                    required: true,
                  })}
                  className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                />

                <span className="text-xs text-slate-400 font-medium">to</span>

                {/* End Time Input */}
                <input
                  type="time"
                  {...register(`slots.${index}.end` as const, {
                    required: true,
                  })}
                  className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Remove Slot */}
              <button
                type="button"
                onClick={() => remove(index)}
                title="Remove Slot"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic pt-2">
            No active time slots set for {day}.
          </p>
        )}

        {/* Add New Slot Action */}
        <div>
          <button
            type="button"
            onClick={() => append({ start: "09:00", end: "17:00" })}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 mt-1"
          >
            <FiPlus className="w-3.5 h-3.5" /> Add Slot
          </button>
        </div>
      </div>

      {/* Per-Day Update Button */}
      <div className="shrink-0 flex items-center gap-2 pt-1">
        {successMsg && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            <FiCheckCircle className="w-3.5 h-3.5" /> Updated!
          </span>
        )}
        <button
          type="submit"
          disabled={isUpdating}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <FiSave className="w-3.5 h-3.5" />
          {isUpdating ? "Saving..." : "Update Slots"}
        </button>
      </div>
    </form>
  );
}

export default function AvailabilityPage() {
  const [availabilityData, setAvailabilityData] = useState<
    Record<string, TimeSlot[]>
  >({});
  const [loading, setLoading] = useState(true);
  const getAvailability = async () => {
    try {
      const res = await getSlot({});
      if (res?.data?.success) {
        setAvailabilityData(res.data.data || {});
      }
    } catch (error) {
      console.error("Error fetching availability data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getAvailability();
  }, []);
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Weekly Availability Scheduler
        </h1>
        <p className="text-sm text-slate-500">
          {` Manage your working hours per day. Click "Update Slots" on any day to send the payload to your backend.`}
        </p>
      </div>

      {!loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {WEEKDAYS.map((day) => (
            <DayAvailabilityCard
              key={day}
              day={day}
              initialSlots={availabilityData[day] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
