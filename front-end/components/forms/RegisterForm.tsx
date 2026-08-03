/* eslint-disable react-hooks/incompatible-library */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiUserCheck,
  FiTool,
} from "react-icons/fi";
import { registerUser } from "@/service/auth";
import { toastTypes } from "@/app/constant";
import { showToast } from "../toast/toast";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    role: z.enum(["CUSTOMER", "TECHNICIAN"]),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CUSTOMER" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await registerUser(data);
      if (res?.data?.success || res?.success) {
        showToast(
          toastTypes.SUCCESS,
          "Account created successfully! Please log in.",
        );
        router.push("/login");
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
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 max-w-xl w-full space-y-6"
      >
        {/* Header Section */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-tight text-slate-900 hover:opacity-90 transition-opacity"
          >
            FixIt<span className="text-blue-600">Now</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Join FixItNow as a customer or service provider
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50">
          <button
            type="button"
            onClick={() => setValue("role", "CUSTOMER")}
            className={`py-2.5 px-3 cursor-pointer text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedRole === "CUSTOMER"
                ? "bg-white text-blue-600 shadow-md shadow-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiUserCheck className="w-4 h-4" /> Customer
          </button>
          <button
            type="button"
            onClick={() => setValue("role", "TECHNICIAN")}
            className={`py-2.5 px-3 cursor-pointer text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedRole === "TECHNICIAN"
                ? "bg-white text-blue-600 shadow-md shadow-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiTool className="w-4 h-4" /> Technician
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiUser className="w-4 h-4" />
              </div>
              <input
                {...register("name")}
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                placeholder="Jane Doe"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="jane@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiPhone className="w-4 h-4" />
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                  placeholder="+1 234 567 890"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-500 font-medium mt-1.5">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiMapPin className="w-4 h-4" />
              </div>
              <input
                {...register("address")}
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                placeholder="123 Main St, City, State 12345"
              />
            </div>
            {errors.address && (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
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
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            "Creating Account..."
          ) : (
            <>
              Get Started <FiArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-bold hover:underline transition-all"
          >
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
};
