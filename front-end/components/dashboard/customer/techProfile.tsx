"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Star,
  Briefcase,
  Clock,
  CalendarCheck,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Award,
  ArrowLeft,
  Wrench,
  MapPin,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getSingleTechnician } from "@/service/publicApi";

type TimeSlot = {
  start: string;
  end: string;
};

type AvailabilityMap = Record<string, TimeSlot[] | null | undefined>;

interface Service {
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
}

interface Technician {
  id: string;
  userId: string;
  bio: string | null;
  skills: string[];
  experience: number;
  completedJobs: number;
  isAvailable: boolean;
  hourlyRate: number | null;
  availability: AvailabilityMap | string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  rating?: number;
  services?: Service[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hoursStr, minutes] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

const getUniqueSlots = (slots: TimeSlot[]) => {
  const seen = new Set<string>();
  return slots.filter((slot) => {
    const key = `${slot.start}-${slot.end}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getAvatarUrl = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imgNum = (hash % 70) + 1;
  return `https://i.pravatar.cc/300?img=${imgNum}`;
};

export default function TechProfile({
  technicianId,
}: {
  technicianId: string;
}) {
  const router = useRouter();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const res = await getSingleTechnician(technicianId);
        if (res?.data?.success && isMounted) {
          setTechnician(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching technician data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (technicianId) {
      fetchProfileData();
    }

    return () => {
      isMounted = false;
    };
  }, [technicianId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            Loading technician profile...
          </p>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">
          Technician Not Found
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The requested profile could not be loaded.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const name = technician.user?.name ?? "Technician";
  const avatar = technician.avatarUrl ?? getAvatarUrl(technician.id);
  const rate = technician.hourlyRate ?? 45;
  const experienceYears = technician.experience ?? 0;
  const rating = technician.rating ?? 4.9;
  const availability = technician.availability ?? null;
  const services = technician.services ?? [];
  const hasSkills =
    Array.isArray(technician.skills) && technician.skills.length > 0;
  const currentDayName = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const isObjectAvailability =
    availability &&
    typeof availability === "object" &&
    !Array.isArray(availability);

  const handleSelectService = (serviceId: string) => {
    // Navigates to booking page passing serviceId and technicianId
    router.push(`/booking/${serviceId}?technicianId=${technician.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Home
          </Link>
        </div>

        {/* Profile Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* User Info */}
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-100 shadow-inner sm:h-28 sm:w-28">
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                  {technician.status && (
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  )}
                </div>

                <p className="mt-1 text-xs font-semibold text-blue-600">
                  {hasSkills
                    ? technician.skills[0]
                    : "General Technical Specialist"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      technician.isAvailable
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        technician.isAvailable
                          ? "animate-pulse bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {technician.isAvailable
                      ? "Available Now"
                      : "Currently Busy"}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center sm:self-center">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full cursor-pointer rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
              >
                Book Technician
              </button>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Star className="h-5 w-5 fill-amber-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Rating</p>
                <p className="text-sm font-bold text-slate-900">
                  {rating} / 5.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  Completed
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {technician.completedJobs} Jobs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  Experience
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {experienceYears} {experienceYears === 1 ? "Year" : "Years"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  Hourly Rate
                </p>
                <p className="text-sm font-bold text-slate-900">${rate}/hr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Offered Services Section */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Wrench className="h-5 w-5 text-blue-600" /> Offered Services
                </h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {services.length} Available
                </span>
              </div>

              {services.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition hover:border-blue-300 hover:bg-blue-50/20 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600">
                            {service.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {service.location}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-slate-200/60 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                        <span className="text-lg font-extrabold text-slate-900">
                          ${service.price}
                        </span>
                        <button
                          onClick={() => handleSelectService(service.id)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
                        >
                          Book Service <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No specific services listed at the moment.
                </p>
              )}
            </div>

            {/* About Section */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">About Me</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {technician.bio ||
                  `Hello! I'm ${name}, a dedicated technician with over ${experienceYears} years of experience delivering high-quality repairs and maintenance services.`}
              </p>
            </div>

            {/* Skills & Expertise */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">
                Skills & Expertise
              </h2>

              {hasSkills ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {technician.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2 text-xs font-semibold text-blue-700"
                    >
                      <Wrench className="h-3.5 w-3.5 text-blue-600" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  General Technical Specialist
                </p>
              )}
            </div>

            {/* Working Hours */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Working Hours
                </h2>
              </div>

              {isObjectAvailability ? (
                <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50 p-2 sm:p-4">
                  {DAYS_ORDER.map((day) => {
                    const rawSlots = (availability as AvailabilityMap)[day];
                    const slots = Array.isArray(rawSlots)
                      ? getUniqueSlots(rawSlots)
                      : [];
                    const isToday = currentDayName === day;
                    const hasSlots = slots.length > 0;

                    return (
                      <div
                        key={day}
                        className={`flex flex-col gap-1.5 rounded-xl px-3 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                          isToday ? "border border-blue-100 bg-blue-50/70" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold capitalize text-slate-800">
                            {day}
                          </span>
                          {isToday && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 sm:justify-end">
                          {hasSlots ? (
                            slots.map((slot, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs"
                              >
                                <CalendarCheck className="h-3 w-3 shrink-0 text-emerald-600" />
                                {formatTime(slot.start)} –{" "}
                                {formatTime(slot.end)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              Unavailable / Off
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="h-5 w-5 shrink-0 text-slate-400" />
                  <span>
                    {typeof availability === "string" && availability
                      ? availability
                      : "Mon - Sat: 8:00 AM - 6:00 PM"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
              <h3 className="text-base font-bold text-slate-900">
                Contact Information
              </h3>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-medium text-slate-400">
                      Email
                    </p>
                    <p className="truncate font-semibold text-slate-800">
                      {technician.user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400">
                      Phone
                    </p>
                    <p className="font-semibold text-slate-800">
                      {technician.user?.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400">
                      Member Since
                    </p>
                    <p className="font-semibold text-slate-800">
                      {new Date(technician.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Service Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Sparkles className="h-5 w-5 text-blue-600" /> Choose a
                  Service
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select a service provided by {name} to proceed with booking.
                </p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Services List inside Modal */}
            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleSelectService(service.id)}
                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:border-blue-500 hover:bg-blue-50/30 hover:shadow-sm"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600">
                        {service.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {service.description}
                      </p>
                      <span className="inline-block text-xs font-semibold text-blue-600">
                        ${service.price}
                      </span>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <p className="text-sm font-medium">No services found</p>
                  <p className="text-xs text-slate-400">
                    {` This technician hasn't listed any services yet.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
