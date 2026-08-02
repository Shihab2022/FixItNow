/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { confirmPayment, getSinglePaymentHistory } from "@/service/payment";

// 1. Define the UI configuration for each status
const STATUS_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100",
    title: "Payment Successful!",
    description: "Thank you for your payment. Your booking has been confirmed.",
    primaryAction: { label: "Go to Dashboard", href: "/dashboard", icon: null },
    secondaryAction: { label: "Back to Home", href: "/", icon: ArrowLeft },
  },
  failed: {
    icon: XCircle,
    iconColor: "text-rose-600",
    bgColor: "bg-rose-100",
    title: "Payment Failed",
    description:
      "We couldn't process your payment. Please check your payment details and try again.",
    primaryAction: { label: "Try Again", href: "/dashboard/customer/payments/history", icon: RefreshCcw },
    secondaryAction: { label: "Back to Home", href: "/", icon: ArrowLeft },
  },
  cancel: {
    icon: AlertCircle,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
    title: "Payment Cancelled",
    description:
      "You have cancelled the checkout process. No charges were made to your account.",
    primaryAction: {
      label: "Return to Checkout",
      href: "/checkout",
      icon: RefreshCcw,
    },
    secondaryAction: { label: "Back to Home", href: "/", icon: ArrowLeft },
  },
  // Fallback if URL is accessed without a valid status
  unknown: {
    icon: AlertCircle,
    iconColor: "text-slate-600",
    bgColor: "bg-slate-100",
    title: "Unknown Status",
    description: "We couldn't determine the status of your payment.",
    primaryAction: { label: "Go to Home", href: "/", icon: null },
    secondaryAction: null,
  },
} as const;

type StatusType = keyof typeof STATUS_CONFIG;

// 2. The inner component that reads search params
function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const statusQuery = searchParams.get("status");
  const bookingId = localStorage.getItem("bookingId");
  const getPaymentDetails = async () => {
    const res = await getSinglePaymentHistory(bookingId!);
    if (res?.data?.success) {
      const transactionId = res.data.data.transactionId;
      if (transactionId) {
        const confirmRes = await confirmPayment({ transactionId });

        if (confirmRes?.data?.success) {
          localStorage.removeItem("bookingId");
        }
      }
    }
  };
  useEffect(() => {
    if (bookingId && statusQuery === "success") {
      getPaymentDetails();
    }
  }, [bookingId, statusQuery]);
  const currentStatus: StatusType =
    statusQuery && Object.keys(STATUS_CONFIG).includes(statusQuery)
      ? (statusQuery as StatusType)
      : "unknown";
  const config = STATUS_CONFIG[currentStatus];
  const Icon = config.icon;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/40"
      >
        {/* Animated Icon Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${config.bgColor} ${config.iconColor}`}
        >
          <Icon className="h-10 w-10" />
        </motion.div>

        {/* Text Content */}
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900">
          {config.title}
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-600">
          {config.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href={config.primaryAction.href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
          >
            {config.primaryAction.icon && (
              <config.primaryAction.icon className="h-4 w-4" />
            )}
            {config.primaryAction.label}
          </Link>

          {config.secondaryAction && (
            <Link
              href={config.secondaryAction.href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
            >
              <config.secondaryAction.icon className="h-4 w-4" />
              {config.secondaryAction.label}
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// 3. The Default Export wrapped in Suspense
export default function PaymentPage() {
  return (
    // Suspense is required by Next.js when using useSearchParams in a client component
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
