"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    role: z.enum(["customer", "technician"]),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "customer" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    // API boundary placeholder
    console.log("Register payload:", data);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full space-y-5"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Create your account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Join FixItNow as a customer or service provider.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setValue("role", "customer")}
          className={`py-2 text-sm font-semibold rounded-lg transition-all ${
            selectedRole === "customer"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600"
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setValue("role", "technician")}
          className={`py-2 text-sm font-semibold rounded-lg transition-all ${
            selectedRole === "technician"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600"
          }`}
        >
          Technician
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Full Name
        </label>
        <input
          {...register("fullName")}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
          placeholder="Jane Doe"
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Email Address
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
          placeholder="jane@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Confirm Password
        </label>
        <input
          {...register("confirmPassword")}
          type="password"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? "Creating Account..." : "Get Started"}
      </button>
    </motion.form>
  );
};
