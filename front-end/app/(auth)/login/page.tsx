"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiEye, FiEyeOff, FiLock, FiMail, FiArrowRight } from "react-icons/fi";
import { loginUser } from "@/service/auth";
import { toastTypes } from "@/app/constant";
import { showToast } from "@/components/toast/toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await loginUser(data);
      if (res?.data?.success) {
        const accessToken = res.data.data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        showToast(toastTypes.SUCCESS, "Login successful!");
        router.push("/dashboard");
      } else {
        showToast(
          toastTypes.FAILED,
          res?.message || "Something went wrong. Please try again later.",
        );
      }
    } catch (error) {
      console.error(error);
      showToast(toastTypes.FAILED, "An unexpected error occurred.");
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
            Welcome back
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Please enter your details to access your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
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
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <>
                Sign In <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-bold hover:underline transition-all"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
