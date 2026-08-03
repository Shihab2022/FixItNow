/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createPayment, getPaymentHistory } from "@/service/payment";
import { handleDownloadReceipt } from "@/utils/downPaymentReceipt";
import { useEffect, useState } from "react";
import {
  FiSearch,
  FiDollarSign,
  FiDownload,
  FiCreditCard,
  FiCheckCircle,
  FiLoader,
  FiUser,
} from "react-icons/fi";

interface PaymentItem {
  id: string;
  amount: number;
  paymentGatewayData: any;
  status: "PENDING" | "PAID" | "COMPLETED" | "FAILED" | "REFUNDED" | string;
  paidAt: string;
  transactionId: string;
  bookingId: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    totalPrice: number;
    status: string;
    serviceId: string;
    service?: {
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
    };
    technician?: {
      id: string;
      userId: string;
      bio: string;
      skills: string[];
      experience: number;
      completedJobs: number;
      isAvailable: boolean;
      hourlyRate: number;
      status: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getHistory = async () => {
    setLoading(true);
    try {
      const response = await getPaymentHistory();
      if (response?.data?.success) {
        setPayments(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);
  const confirmPayment = async (bookingId: string) => {
    const bookingRes = await createPayment({ bookingId });

    if (bookingRes?.data?.success) {
      localStorage.setItem("bookingId", bookingId);
      const paymentUrl = bookingRes.data.data.paymentUrl;
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
    }
  };
  const totalLifetimeSpent = payments.reduce((acc, p) => {
    const isPaidStatus = ["PAID", "COMPLETED"].includes(
      p.status?.toUpperCase(),
    );
    return isPaidStatus ? acc + (p.amount || 0) : acc;
  }, 0);

  const completedInvoicesCount = payments.filter((p) =>
    ["PAID", "COMPLETED"].includes(p.status?.toUpperCase()),
  ).length;

  // Filter Search
  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    const serviceTitle = p.booking?.service?.title || "";
    const transactionId = p.transactionId || "";
    const id = p.id || "";
    const status = p.status || "";

    return (
      serviceTitle.toLowerCase().includes(query) ||
      transactionId.toLowerCase().includes(query) ||
      id.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Payment & Invoices
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your transaction history and download official receipts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Total Lifetime Spent
            </p>
            <p className="text-xl font-bold text-slate-900">
              ${totalLifetimeSpent.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Paid Invoices
            </p>
            <p className="text-xl font-bold text-slate-900">
              {completedInvoicesCount} Complete
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-xl">
            <FiCreditCard />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Payment Gateway
            </p>
            <p className="text-sm font-bold text-slate-800">
              Online / Card Payment
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by transaction ID, service, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Service</th>
                <th className="py-4 px-6">Technician</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-lg" />
                      Loading payment history...
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item) => {
                  const isPaid = ["PAID", "COMPLETED"].includes(
                    item.status?.toUpperCase(),
                  );
                  const isPending = item.status?.toUpperCase() === "PENDING";
                  const techSkills = item.booking?.technician?.skills ?? [];

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-800 text-xs">
                        <div
                          className="truncate max-w-40"
                          title={item.transactionId}
                        >
                          {item.transactionId}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">
                          {item.booking?.service?.title || "Service Order"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.booking?.service?.location || "N/A"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 text-slate-600 rounded-full">
                            <FiUser className="text-xs" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">
                              {techSkills.length > 0
                                ? techSkills[0]
                                : "Field Specialist"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {item.booking?.technician?.experience ?? 0}+ yrs
                              exp
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPending
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {item.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isPaid ? (
                          <button
                            onClick={() => handleDownloadReceipt(item)}
                            title="Download Receipt PDF"
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                          >
                            <FiDownload /> PDF
                          </button>
                        ) : isPending ? (
                          <button
                            onClick={() => confirmPayment(item.bookingId)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            Make Payment
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            N/A
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
