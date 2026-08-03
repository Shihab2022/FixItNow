"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import { toastTypes } from "@/app/constant";
import { showToast } from "@/components/toast/toast";
import { forgetPassword } from "@/service/auth";

const forgotPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    newPassword: z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(4, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const res = await forgetPassword({
        email: data.email,
        password: data.newPassword,
      });
      if (res?.data?.success || res?.success) {
        showToast(toastTypes.SUCCESS, "Password reset successfully!");
        router.push("/login");
      } else {
        showToast(
          toastTypes.FAILED,
          res?.message ||
            "Failed to reset password. Please check your details.",
        );
      }
    } catch (error) {
      console.error(error);
      showToast(
        toastTypes.FAILED,
        "An error occurred while resetting password.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-blue-50/30 flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-tight text-slate-900 hover:opacity-90 transition-opacity"
          >
            FixIt<span className="text-blue-600">Now</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Enter your email and create a new password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                {...register("email")}
                type="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                {...register("newPassword")}
                type={showNewPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              "Updating..."
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" /> Reset Password
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
