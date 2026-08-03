/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiEye,
  FiXCircle,
  FiUser,
  FiRefreshCw,
  FiCreditCard,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { getAllBookingsApi } from "@/service/publicApi";
import { createPayment } from "@/service/payment";

interface ApiBooking {
  id: string;
  status: string; // "REQUESTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number;
  customerAddress: string;
  notes?: string;
  paymentStatus: string; // "PAID", "PENDING", "FAILED"
  customerId: string;
  technicianId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    status: boolean;
    category?: {
      id: string;
      name: string;
    };
    technician?: {
      id: string;
      experience: number;
      isAvailable: boolean;
      user?: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
}

export default function CustomerBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cancellation Modal state
  const [selectedBookingForCancel, setSelectedBookingForCancel] =
    useState<ApiBooking | null>(null);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);

  const getBooking = async () => {
    setLoading(true);
    try {
      const res = await getAllBookingsApi();
      if (res?.data?.success) {
        setBookings(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBooking();
  }, []);
  const confirmPayment = async (bookingId: string) => {
    const bookingRes = await createPayment({ bookingId });

    if (bookingRes?.data?.success) {
      localStorage.setItem("bookingId", bookingId);
      const paymentUrl = bookingRes.data.data.paymentUrl;
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
    }
  };
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const serviceTitle = booking.service?.title || "";
      const techName = booking.service?.technician?.user?.name || "";
      const bookingId = booking.id || "";
      const address = booking.customerAddress || "";

      const matchesSearch =
        serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        techName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        booking.status?.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Handle Action Trigger for Cancellation
  const handleInitiateCancel = (booking: ApiBooking) => {
    const isCompleted = booking.status?.toUpperCase() === "COMPLETED";
    const isPaid = booking.paymentStatus?.toUpperCase() === "PAID";

    if (isCompleted && isPaid) {
      setCancelNotice(
        "This service has been completed and payment has been processed. Completed bookings cannot be cancelled.",
      );
      setSelectedBookingForCancel(booking);
      return;
    }

    if (isCompleted) {
      setCancelNotice(
        "This service is already marked as completed and cannot be cancelled.",
      );
      setSelectedBookingForCancel(booking);
      return;
    }

    setCancelNotice(null);
    setSelectedBookingForCancel(booking);
  };

  const handleConfirmCancel = () => {
    if (!selectedBookingForCancel) return;

    // Execute cancellation state update locally (replace with your cancel booking API call)
    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBookingForCancel.id
          ? { ...b, status: "CANCELLED" }
          : b,
      ),
    );
    setSelectedBookingForCancel(null);
  };

  // Status Badge Rendering
  const getStatusBadge = (status: string) => {
    const formattedStatus = status?.toUpperCase() || "PENDING";

    const styles: Record<string, string> = {
      REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
      IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
      COMPLETED:
        "bg-emerald-50 text-emerald-800 border-emerald-300 bg-emerald-100/60",
      CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
    };

    const labels: Record<string, string> = {
      REQUESTED: "Requested",
      PENDING: "Pending Approval",
      CONFIRMED: "Confirmed",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
          styles[formattedStatus] ||
          "bg-slate-100 text-slate-700 border-slate-200"
        }`}
      >
        {labels[formattedStatus] || formattedStatus}
      </span>
    );
  };

  // Payment Badge & Actions Rendering
  const getPaymentBadge = (booking: ApiBooking) => {
    const paymentStatus = booking.paymentStatus?.toUpperCase() || "PENDING";

    if (paymentStatus === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <FiCheckCircle className="text-xs" /> {paymentStatus}
        </span>
      );
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          {paymentStatus}
        </span>
        {booking.status?.toUpperCase() !== "CANCELLED" && (
          <button
            onClick={() => confirmPayment(booking.id)}
            className="inline-flex  cursor-pointer items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline mt-0.5"
          >
            <FiCreditCard className="text-xs" /> Make Payment
          </button>
        )}
      </div>
    );
  };

  const filterTabs = [
    { key: "all", label: "All Requests" },
    { key: "REQUESTED", label: "Requested" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track, manage, and review all your scheduled home service requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={getBooking}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Refresh Bookings"
          >
            <FiRefreshCw
              className={`text-sm ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <Link
            href="/services"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 w-fit"
          >
            + Book New Service
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by service, technician, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <FiFilter className="text-slate-400 text-sm mr-1 hidden sm:block shrink-0" />
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter.toUpperCase() === tab.key.toUpperCase()
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-xs font-medium text-slate-500">
            Loading your bookings...
          </p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            <FiCalendar />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No bookings found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {`  You currently have no bookings that match your search or filter criteria. Explore our services to schedule your first home service request.`}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Service & Location</th>
                  <th className="py-4 px-6">Technician</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Amount & Payment</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.map((booking) => {
                  const techName =
                    booking.service?.technician?.user?.name || "Unassigned Pro";

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Service & ID & Address */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <Link
                            href={`/customer/bookings/${booking.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                          >
                            {booking.service?.title || "Home Service Request"}
                          </Link>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400">
                              #{booking.id.slice(0, 8)}...
                            </span>
                            {booking.service?.category?.name && (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                                {booking.service.category.name}
                              </span>
                            )}
                          </div>

                          {booking.customerAddress && (
                            <p className="flex items-center gap-1 text-xs text-slate-500 capitalize">
                              <FiMapPin className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-xs">
                                {booking.customerAddress}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Assigned Technician */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Image
                            src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90) + 10}.jpg`}
                            height={36}
                            width={36}
                            alt={techName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                              {techName}
                            </p>
                            <span className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5">
                              <FiUser className="text-[10px]" /> Verified
                              Specialist
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <FiCalendar className="text-blue-600 shrink-0" />
                            {new Date(booking.scheduledDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <FiClock className="shrink-0" />{" "}
                            {booking.scheduledTime || "Flexible Time"}
                          </p>
                        </div>
                      </td>

                      {/* Pricing & Payment Status */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">
                            ${booking.totalPrice}
                          </p>
                          {getPaymentBadge(booking)}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {getStatusBadge(booking.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/booking/customer/${booking.id}`}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="text-lg" />
                          </Link>

                          {booking.status?.toUpperCase() !== "CANCELLED" && (
                            <button
                              onClick={() => handleInitiateCancel(booking)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Booking"
                            >
                              <FiXCircle className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation & Policy Notice Modal */}
      <AnimatePresence>
        {selectedBookingForCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-5"
            >
              {cancelNotice ? (
                // Non-cancellable Notice Modal
                <>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl mx-auto">
                    <FiAlertTriangle />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Cannot Cancel Booking
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {cancelNotice}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedBookingForCancel(null)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
                    >
                      Understand & Close
                    </button>
                  </div>
                </>
              ) : (
                // Cancellation Confirmation Modal
                <>
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xl mx-auto">
                    <FiXCircle />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Cancel Service Request?
                    </h3>
                    <p className="text-sm text-slate-500">
                      Are you sure you want to cancel booking{" "}
                      <span className="font-mono font-bold text-slate-700">
                        #{selectedBookingForCancel.id.slice(0, 8)}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setSelectedBookingForCancel(null)}
                      className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer"
                    >
                      Confirm Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
