"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiRefreshCw, FiHelpCircle } from "react-icons/fi";

export default function PaymentCancelPage() {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-3"
      >
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          <FiAlertTriangle />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Payment Canceled</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          The transaction was not completed. Your payment method was not
          charged, and your time slot is on hold temporarily.
        </p>
      </motion.div>

      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 text-left space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <FiHelpCircle /> Need Assistance?
        </p>
        <p>
          If you experienced an error with your card, please check your card
          details or try a different payment method.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          href="/customer/payments/pay"
          className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
        >
          <span className="flex items-center justify-center gap-2">
            <FiRefreshCw /> Retry Payment
          </span>
        </Link>
        <Link
          href="/customer/bookings"
          className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
        >
          Return to My Bookings
        </Link>
      </div>
    </div>
  );
}
