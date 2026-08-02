"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  Briefcase,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Award,
  ArrowLeft,
  Wrench,
} from "lucide-react";
import { getSingleTechnician } from "@/service/publicApi";

// Helper to generate unique avatar URL based on ID
const getAvatarUrl = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imgNum = (hash % 70) + 1;
  return `https://i.pravatar.cc/300?img=${imgNum}`;
};

interface TechnicianProfileProps {
  technician: {
    id: string;
    userId: string;
    bio: string | null;
    skills: string[];
    experience: number;
    completedJobs: number;
    isAvailable: boolean;
    hourlyRate: number | null;
    availability: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    avatarUrl?: string;
    rating?: number;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default function TechProfile({
  technicianId,
}: {
  technicianId: string;
}) {
  const [technician, setTechnician] = useState<
    TechnicianProfileProps["technician"] | null
  >(null);
  const [loading, setLoading] = useState(true);

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
  const hasSkills =
    Array.isArray(technician.skills) && technician.skills.length > 0;

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
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-100 shadow-inner sm:h-28 sm:w-28 shrink-0">
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
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        technician.isAvailable
                          ? "bg-emerald-500 animate-pulse"
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

            {/* Primary Action */}
            <div className="flex items-center sm:self-center">
              <button className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 sm:w-auto cursor-pointer">
                Book Technician
              </button>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
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
            {/* About Section */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">About Me</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {technician.bio ||
                  `Hello! I'm ${name}, a dedicated technician with over ${experienceYears} years of experience delivering high-quality repairs and maintenance services. I take pride in clear communication, attention to detail, and getting the job done right on time.`}
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
              <h2 className="text-lg font-bold text-slate-900">
                Working Hours
              </h2>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                <span>
                  {technician.availability || "Mon - Sat: 8:00 AM - 6:00 PM"}
                </span>
              </div>
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shrink-0">
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400">
                      Phone
                    </p>
                    <p className="font-semibold text-slate-800">
                      {technician.user?.phone
                        ? `+${technician.user.phone}`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shrink-0">
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
    </div>
  );
}
