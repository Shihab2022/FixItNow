/* eslint-disable react-hooks/purity */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiFileText,
  FiTool,
  FiShield,
  FiHelpCircle,
  FiDollarSign,
  FiAlertCircle,
} from "react-icons/fi";
import { getSingleBookingApi } from "@/service/publicApi";
import { createPayment } from "@/service/payment";
import { handleDownloadReceipt } from "@/utils/downPaymentReceipt";
import { formatBookingDataForPdf } from "@/utils/formatData";

// Interface reflecting your JSON structure
interface BookingDetails {
  id: string;
  status: string;
  scheduledDate: string;
  totalPrice: number;
  customerAddress: string;
  notes?: string;
  scheduledTime: string;
  paymentStatus: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    status: boolean;
    category?: {
      id: string;
      name: string;
      description: string;
      status: boolean;
    };
    technician?: {
      id: string;
      experience: number;
      isAvailable: boolean;
      bio: string;
      skills: string[];
      hourlyRate: number;
      completedJobs: number;
      user?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
      };
    };
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const res = await getSingleBookingApi(params.id as string);
        if (res?.data?.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching booking detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [params.id]);
  const confirmPayment = async (bookingId: string) => {
    const bookingRes = await createPayment({ bookingId });

    if (bookingRes?.data?.success) {
      localStorage.setItem("bookingId", bookingId);
      const paymentUrl = bookingRes.data.data.paymentUrl;
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
    }
  };
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Loading booking details...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <FiAlertCircle className="text-4xl text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Booking Not Found</h2>
        <p className="text-sm text-slate-500">
          {`We couldn't retrieve the requested booking details.`}
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  const techUser = booking.service?.technician?.user;
  const technician = booking.service?.technician;

  // Progress Pipeline Steps
  const steps = ["REQUESTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];
  const currentStepIndex = steps.indexOf(booking.status.toUpperCase());
  const isPaymentComplete = ["COMPLETED", "PAID"].includes(
    booking.paymentStatus?.toUpperCase(),
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-8 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <FiArrowLeft className="text-sm" /> Back to My Bookings
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            ID: {booking.id}
          </span>
        </div>
      </div>

      {/* Main Header & Progress Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {booking.service?.category?.name || "Service"}
              </span>
              <span className="text-xs text-slate-400">
                Created: {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              {booking.service?.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Payment Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isPaymentComplete
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <FiCheckCircle /> {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Pipeline */}
        <div>
          <p className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">
            Booking Progress
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((step, idx) => {
              const isDone = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                    isCurrent
                      ? "bg-blue-50/70 border-blue-300 text-blue-900 shadow-2xs"
                      : isDone
                        ? "bg-slate-50 border-slate-200 text-slate-700"
                        : "bg-slate-50/40 border-slate-100 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isDone
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight uppercase">
                      {step.replace("_", " ")}
                    </p>
                    <p className="text-[10px] opacity-75">
                      {isCurrent
                        ? "Active state"
                        : isDone
                          ? "Completed"
                          : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Schedule & Delivery Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FiCalendar className="text-blue-600" /> Appointment Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white text-blue-600 rounded-xl shadow-2xs">
                  <FiCalendar className="text-lg" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    Scheduled Date
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(booking.scheduledDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white text-blue-600 rounded-xl shadow-2xs">
                  <FiClock className="text-lg" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    Time Window
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {booking.scheduledTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-slate-400 text-lg mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Service Address
                  </p>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {booking.customerAddress}
                  </p>
                </div>
              </div>

              {booking.notes && (
                <div className="flex items-start gap-3 pt-2">
                  <FiFileText className="text-slate-400 text-lg mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Customer Instructions
                    </p>
                    <p className="text-sm text-slate-600 italic bg-amber-50/50 border border-amber-100 p-3 rounded-xl mt-1">
                      {`"${booking.notes}"`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Technician Profile Card */}
          {techUser && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FiUser className="text-blue-600" /> Assigned Specialist
                </h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <FiShield /> Verified Pro
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <Image
                  src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90) + 10}.jpg`}
                  width={64}
                  height={64}
                  alt={techUser.name}
                  className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 object-cover shrink-0"
                />

                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {techUser.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {technician?.experience} Years Experience •{" "}
                      {technician?.completedJobs} Completed Jobs
                    </p>
                  </div>

                  {technician?.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {technician.bio}
                    </p>
                  )}

                  {technician?.skills && technician.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {technician.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <a
                  href={`tel:${techUser.phone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all"
                >
                  <FiPhone className="text-blue-600 text-sm" />
                  <span>{techUser.phone}</span>
                </a>
                <a
                  href={`mailto:${techUser.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all truncate"
                >
                  <FiMail className="text-blue-600 text-sm shrink-0" />
                  <span className="truncate">{techUser.email}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Price Summary & Support */}
        <div className="space-y-8">
          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FiCreditCard className="text-blue-600" /> Payment Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Service Rate</span>
                <span className="font-semibold text-slate-800">
                  ${booking.service?.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Processing Fee</span>
                <span className="font-semibold text-slate-800">$0.00</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-blue-600">
                  ${booking.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dynamic Payment State & Action Button */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Payment Status
                  </p>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    {isPaymentComplete ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <FiCheckCircle /> Completed
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <FiDollarSign /> Pending Payment
                      </span>
                    )}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isPaymentComplete
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>

              {/* Conditional Action Button */}
              <div className="pt-2 border-t border-slate-200/60">
                {isPaymentComplete ? (
                  <button
                    onClick={() =>
                      handleDownloadReceipt(formatBookingDataForPdf(booking))
                    }
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <FiFileText className="text-sm" /> Download Receipt
                  </button>
                ) : (
                  <button
                    onClick={() => confirmPayment(params.id as string)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-98"
                  >
                    <FiCreditCard className="text-sm" /> Make Payment Now ($
                    {booking.totalPrice})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Service Specs Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FiTool className="text-blue-600" /> Service Information
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {booking.service?.description}
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Primary Location
              </p>
              <p className="text-xs font-medium text-slate-700">
                {booking.service?.location}
              </p>
            </div>
          </div>

          {/* Need Assistance Block */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <FiHelpCircle /> Need Assistance?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have any questions or need to modify your booking time,
              please contact customer support.
            </p>
            <Link
              href="/support"
              className="inline-block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
