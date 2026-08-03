/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createPayment, getPaymentHistory } from "@/service/payment";
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
  const handleDownloadReceipt = (item: PaymentItem) => {
    const isPaid = ["PAID", "COMPLETED"].includes(item.status?.toUpperCase());
    if (!isPaid) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to view and print receipt.");
      return;
    }

    // Clean HTML design without box-shadow, using website branding & logo
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${item.transactionId}</title>
          <style>
            @media print {
              body { padding: 0; }
              .receipt-box { border: none !important; }
            }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 40px; background-color: #ffffff; }
            .receipt-box { max-width: 750px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .logo-container { display: flex; align-items: center; gap: 10px; }
            .logo-img { height: 40px; width: auto; object-fit: contain; }
            .brand-name1 { font-size: 20px; font-weight: 800; color: #0f172a;  letter-spacing: -0.5px; }
            .brand-name2 { font-size: 20px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: -0.5px; }
            .receipt-title { font-size: 22px; font-weight: 800; color: #2563eb; text-align: right; }
            .receipt-id { font-size: 12px; font-mono: true; color: #64748b; margin-top: 4px; }
            .details-grid { margin-top: 28px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .detail-card { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
            .value { font-size: 14px; color: #0f172a; font-weight: 600; }
            .table-container { margin-top: 28px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background-color: #f1f5f9; padding: 12px 16px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; }
            td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total-box { margin-top: 24px; padding: 16px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #dbeafe; display: flex; justify-content: space-between; align-items: center; }
            .total-title { font-size: 14px; font-weight: 700; color: #1e40af; }
            .total-amount { font-size: 20px; font-weight: 800; color: #1e40af; }
            .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: #dcfce7; color: #166534; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="logo-container">
                <!-- Replace src with your official website logo URL -->
                <img src="/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
               
                 <span class="brand-name1">
            FixIt<span class="brand-name2">Now</span>
          </span>
              </div>
              <div>
                <div class="receipt-title">PAYMENT RECEIPT</div>
                <div class="receipt-id">Txn: ${item.transactionId}</div>
              </div>
            </div>

            <div class="details-grid">
              <div class="detail-card">
                <div class="label">Date & Time</div>
                <div class="value">${
                  item.paidAt
                    ? new Date(item.paidAt).toLocaleString()
                    : new Date(item.createdAt).toLocaleString()
                }</div>
              </div>
              <div class="detail-card">
                <div class="label">Status</div>
                <div class="value"><span class="status-badge">${item.status}</span></div>
              </div>
              <div class="detail-card">
                <div class="label">Booking ID</div>
                <div class="value">${item.bookingId}</div>
              </div>
              <div class="detail-card">
                <div class="label">Payment Method</div>
                <div class="value">Online / Card Payment</div>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Service Details</th>
                    <th>Location</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: #0f172a;">${
                        item.booking?.service?.title || "Service Request"
                      }</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                        ${item.booking?.service?.description || ""}
                      </div>
                    </td>
                    <td style="color: #475569;">${
                      item.booking?.service?.location || "N/A"
                    }</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">
                      $${item.amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-box">
              <span class="total-title">Total Amount Paid</span>
              <span class="total-amount">$${item.amount.toFixed(2)}</span>
            </div>

            <div class="footer">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">Thank you for choosing FixItNow!</p>
              <p style="margin: 0;">For inquiries regarding this invoice, please reach out to support@fixitnow.com</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

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
