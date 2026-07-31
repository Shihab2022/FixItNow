/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiCreditCard,
  FiLock,
  FiShield,
  FiCheck,
  FiTag,
  FiArrowLeft,
  FiDollarSign,
} from "react-icons/fi";
import { mockBookings } from "@/mock/data";

const paymentSchema = z.object({
  cardHolder: z.string().min(2, "Cardholder name is required"),
  cardNumber: z
    .string()
    .regex(/^[0-9]{16}$/, "Must be a valid 16-digit card number"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Use MM/YY format"),
  cvv: z.string().regex(/^[0-9]{3,4}$/, "3 or 4 digit CVV"),
  saveCard: z.boolean().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentPayPage() {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "apple_pay" | "paypal"
  >("card");

  const booking = mockBookings[0]; // Demo binding
  const basePrice = booking.amount;
  const serviceFee = 15;
  const totalPrice = Math.max(0, basePrice + serviceFee - discount);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      saveCard: true,
    },
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "FIXIT20") {
      setDiscount(20);
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code. Try FIXIT20 for $20 off!");
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    console.log("Payment details submitted:", data);
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push("/customer/payments/success");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/customer/bookings"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <FiArrowLeft /> Back to Booking
        </Link>
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <FiLock className="text-emerald-600" /> 256-Bit SSL Encrypted
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Checkout</h1>
            <p className="text-sm text-slate-500 mt-1">
              Select your payment method and complete your reservation.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Payment Method
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "card", label: "Credit Card", icon: FiCreditCard },
                { id: "apple_pay", label: "Apple Pay", icon: FiDollarSign },
                { id: "paypal", label: "PayPal", icon: FiShield },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col items-center gap-2 text-xs font-bold ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Icon className="text-xl" />
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Form */}
          {selectedMethod === "card" ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Card Details
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  {...register("cardHolder")}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
                {errors.cardHolder && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.cardHolder.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  {...register("cardNumber")}
                  placeholder="4000123456789010"
                  maxLength={16}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900"
                />
                {errors.cardNumber && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.cardNumber.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    {...register("expiry")}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900"
                  />
                  {errors.expiry && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.expiry.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    {...register("cvv")}
                    type="password"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900"
                  />
                  {errors.cvv && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.cvv.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveCard"
                  {...register("saveCard")}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
                />
                <label
                  htmlFor="saveCard"
                  className="text-xs text-slate-600 font-medium"
                >
                  Save card securely for future bookings
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Authorizing Payment..."
                  : `Pay $${totalPrice}.00 Now`}
              </button>
            </motion.form>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
              <p className="text-sm text-slate-600">
                You will be redirected to complete payment with{" "}
                <span className="font-bold text-slate-900">
                  {selectedMethod === "apple_pay" ? "Apple Pay" : "PayPal"}
                </span>
                .
              </p>
              <button
                onClick={() => router.push("/customer/payments/success")}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Continue to Express Checkout
              </button>
            </div>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-28">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div>
              <p className="text-xs font-bold uppercase text-teal-600">
                Service Request
              </p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {booking.serviceTitle}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Technician: {booking.technicianName}
              </p>
            </div>

            {/* Coupon Box */}
            <form
              onSubmit={handleApplyCoupon}
              className="space-y-2 pt-2 border-t border-slate-100"
            >
              <label className="block text-xs font-bold uppercase text-slate-500 items-center gap-1">
                <FiTag /> Promo / Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try FIXIT20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={couponApplied || !couponCode}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors"
                >
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {couponApplied && (
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <FiCheck /> $20.00 discount applied!
                </p>
              )}
            </form>

            {/* Pricing Breakdown */}
            <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span className="font-semibold text-slate-800">
                  ${basePrice}.00
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trust & Protection Fee</span>
                <span className="font-semibold text-slate-800">
                  ${serviceFee}.00
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-${discount}.00</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-900">
                Total Due
              </span>
              <span className="text-2xl font-black text-blue-600">
                ${totalPrice}.00
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
              <FiShield className="text-lg shrink-0" />
              <span>Full refund available up to 24h prior to service.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
