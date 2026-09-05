/* eslint-disable react-hooks/purity */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  User,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Briefcase,
  Phone,
  Mail,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createBookingApi, getTechnicianAvailableSlots } from "@/service/publicApi";
import { createPayment } from "@/service/payment";
import { showToast } from "../toast/toast";
import { toastTypes } from "@/app/constant";

export interface ApiResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: boolean;
  technicianId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  technician: {
    id: string;
    bio: string;
    experience: number;
    completedJobs: number;
    hourlyRate: number;
    isAvailable: boolean;
    availability?: Record<string, Array<{ start: string; end: string }>>;
    skills?: string[];
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      role: string;
    };
  };
  _count?: {
    bookings: number;
  };
}

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  technicianId: z.string().min(1, "Technician ID is required"),
  scheduledDate: z.string().min(1, "Please select a scheduled date"),
  scheduledTime: z.string().min(1, "Please select an available time range"),
  totalPrice: z.number().positive(),
  customerAddress: z.string().min(5, "Please enter a valid service address"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface CreateBookingProps {
  response: ApiResponse;
}

const formatTo12Hr = (time24: string) => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const adjustedHours = h % 12 || 12;
  return `${adjustedHours.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")} ${period}`;
};

// Helper: Formats { start: "08:00", end: "16:00" } -> "08:00 AM - 04:00 PM"
const formatSlotRange = (slot: { start: string; end: string }) => {
  return `${formatTo12Hr(slot.start)} - ${formatTo12Hr(slot.end)}`;
};

export function CreateBookingForm({
  response,
  //   onSubmitBooking,
}: CreateBookingProps) {
  const serviceData = response;
  const {
    id: serviceId,
    title,
    description,
    price,
    location,
    category,
    technician,
  } = serviceData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId,
      technicianId: technician.id,
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "",
      totalPrice: price,
      customerAddress: "",
      notes: "",
    },
  });

  const selectedDate = useWatch({ control, name: "scheduledDate" });
  const selectedTime = useWatch({ control, name: "scheduledTime" });

  // Get selected day name (e.g., "friday")
  const selectedDayName = useMemo(() => {
    if (!selectedDate) return "";
    const dateObj = new Date(selectedDate + "T00:00:00");
    return dateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  }, [selectedDate]);

  const [liveSlots, setLiveSlots] = useState<
    Array<{ start: string; end: string }> | null
  >(null);

  // Fetch REAL availability for the selected date (already-booked slots are
  // excluded by the backend: GET /bookings/availability?technicianId&date)
  useEffect(() => {
    if (!selectedDate) return;
    let active = true;
    getTechnicianAvailableSlots(technician.id, selectedDate)
      .then((res) => {
        if (!active) return;
        if (res?.data?.success) {
          setLiveSlots(res.data.data || []);
        } else {
          setLiveSlots(null); // fall back to the static weekly schedule
        }
      })
      .catch(() => {
        if (active) setLiveSlots(null);
      });
    return () => {
      active = false;
    };
  }, [selectedDate, technician.id]);

  // Live slots win over the static weekly schedule when available
  const staticDayAvailability = technician.availability?.[selectedDayName];

  // For TODAY's date, hide slots that have already started (e.g. at 4:00 PM
  // the customer cannot book slots starting before 4:00 PM anymore)
  const todayKey = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  const isToday = selectedDate === todayKey;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const dayAvailability = (
    liveSlots ??
    staticDayAvailability ??
    []
  ).filter((slot) => {
    if (!isToday) return true;
    const [h, m] = slot.start.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return true;
    const startMinutes = h * 60 + m;
    return startMinutes >= nowMinutes; // slot time is gone for today otherwise
  });
  const isTechnicianAvailableOnDay =
    Boolean(dayAvailability && dayAvailability.length > 0) &&
    technician.isAvailable;

  // Render availability ranges directly from database array
  const availableTimeRanges = useMemo(() => {
    if (!dayAvailability || dayAvailability.length === 0) return [];
    return dayAvailability.map((slot) => formatSlotRange(slot));
  }, [dayAvailability]);

  const onSubmit = async (formData: BookingFormValues) => {
    if (!isTechnicianAvailableOnDay) return;

    try {
      setIsSubmitting(true);

      const payload = {
        serviceId: formData.serviceId,
        technicianId: formData.technicianId,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),

        scheduledTime: formData.scheduledTime,
        totalPrice: formData.totalPrice,
        customerAddress: formData.customerAddress,
        notes: formData.notes,
      };
      const res = await createBookingApi(payload);

      if (res?.data?.success) {
        const bookingId = res?.data?.data?.id;
        if (bookingId) {
          const bookingRes = await createPayment({ bookingId });
          if (bookingRes?.data?.success) {
            localStorage.setItem("bookingId", bookingId);
            const paymentUrl = bookingRes.data.data.paymentUrl;
            window.open(paymentUrl, "_blank", "noopener,noreferrer");
            setIsSuccess(true);
          }
        }
      }
    } catch (error) {
      showToast(toastTypes.FAILED, "Booking failed. Please try again.");
      console.error("Booking Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg my-12"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Booking Confirmed!
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Please confirm your payment in the new tab to complete the booking
          process.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left text-xs text-slate-600 space-y-2 border border-slate-100">
          <p>
            <strong className="text-slate-800">Technician:</strong>{" "}
            {technician.user.name} ({technician.user.phone})
          </p>
          <p>
            <strong className="text-slate-800">Scheduled Date:</strong>{" "}
            {selectedDate}
          </p>
          <p>
            <strong className="text-slate-800">Time Range:</strong>{" "}
            {selectedTime}
          </p>
          <p>
            <strong className="text-slate-800">Total Price:</strong> ${price}
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Make another booking
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header & Navigation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Book Appointment
          </h1>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          Verified Service Request
        </span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12"
      >
        {/* Left Column: Service & Technician Profile */}
        <div className="space-y-6 lg:col-span-5">
          {/* Service Info */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <Wrench className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {category.name}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {location}
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                ${price}
              </span>
            </div>
          </div>

          {/* Technician Info */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <User className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Technician Profile
                </span>
              </div>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  technician.isAvailable
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {technician.isAvailable ? "Active" : "Unavailable"}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-50 shrink-0">
                <Image
                  src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90) + 10}.jpg`}
                  alt={technician.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {technician.user.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-slate-400" />
                    {technician.experience} yrs exp.
                  </span>
                  <span>•</span>
                  <span>{technician.completedJobs} jobs</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {`"${technician.bio}"`}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Rate: <strong>${technician.hourlyRate}/hr</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{technician.user.phone}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 text-slate-600 truncate">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{technician.user.email}</span>
              </div>
            </div>

            {technician.skills && technician.skills.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5 items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-400" /> Specializations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {technician.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Working Days:
              </span>
              <p className="text-xs text-slate-500 capitalize">
                {technician.availability
                  ? Object.keys(technician.availability).join(", ")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Form Controls */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Select Schedule & Location
            </h3>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  {...register("scheduledDate", {
                    onChange: () => setValue("scheduledTime", ""),
                  })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            {/* Availability Warning or Time Range Selector */}
            {!isTechnicianAvailableOnDay ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-amber-800"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    {staticDayAvailability && staticDayAvailability.length > 0
                      ? "All Slots Are Booked For This Date"
                      : "Technician Not Available"}
                  </p>
                  <p>
                    {technician.user.name} does not work on{" "}
                    <strong className="capitalize">{selectedDayName}</strong>.
                    Please pick a day from their schedule (
                    <span className="capitalize">
                      {technician.availability
                        ? Object.keys(technician.availability).join(", ")
                        : "N/A"}
                    </span>
                    ).
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Display Available Ranges */
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Available Shift Ranges for{" "}
                  <span className="capitalize text-blue-600">
                    {selectedDayName}
                  </span>
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {availableTimeRanges.map((rangeStr) => {
                    const isSelected = selectedTime === rangeStr;
                    return (
                      <button
                        type="button"
                        key={rangeStr}
                        onClick={() => setValue("scheduledTime", rangeStr)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-600 shadow-xs ring-1 ring-blue-600"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        {rangeStr}
                      </button>
                    );
                  })}
                </div>
                {errors.scheduledTime && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.scheduledTime.message}
                  </p>
                )}
              </div>
            )}

            {/* Address Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Service Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter complete street address..."
                  {...register("customerAddress")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
              {errors.customerAddress && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.customerAddress.message}
                </p>
              )}
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Special Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  rows={3}
                  placeholder="Gate code, entry instructions..."
                  {...register("notes")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isTechnicianAvailableOnDay || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-98 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : !isTechnicianAvailableOnDay ? (
              "Technician Unavailable on Selected Date"
            ) : (
              `Confirm Booking ($${price})`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
