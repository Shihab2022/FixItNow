"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiLock,
  FiCheck,
  FiBell,
  FiSave,
} from "react-icons/fi";
import Image from "next/image";

// Validation Schema
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "New password must be at least 8 characters",
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CustomerProfileEditPage() {
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+1 (555) 019-2834",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      zipCode: "97477",
      currentPassword: "",
      newPassword: "",
    },
  });

  // Handle image upload preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    // Simulate API update request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Updated Profile Data:", {
      ...data,
      notifications: { emailNotifications, smsNotifications },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information, address, password, and preferences.
        </p>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <FiCheck className="text-base text-emerald-600" />
          Your profile information has been updated successfully!
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Avatar & Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Image
              src={avatarPreview}
              height={96}
              width={96}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-inner"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-md cursor-pointer hover:bg-blue-700 transition-all active:scale-95"
            >
              <FiCamera className="text-sm" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Jane Doe</h2>
            <p className="text-xs font-medium text-slate-500">
              Customer Account
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-200">
              Verified Member
            </span>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiUser className="text-blue-600" /> Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                <input
                  {...register("fullName")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                <input
                  {...register("email")}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                <input
                  {...register("phone")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiMapPin className="text-rose-500" /> Primary Service Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Street Address
              </label>
              <input
                {...register("address")}
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              {errors.address && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                City
              </label>
              <input
                {...register("city")}
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              {errors.city && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                ZIP Code
              </label>
              <input
                {...register("zipCode")}
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono"
              />
              {errors.zipCode && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiLock className="text-amber-500" /> Change Security Password
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Current Password
              </label>
              <input
                {...register("currentPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                {...register("newPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              {errors.newPassword && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiBell className="text-purple-500" /> Notifications & Alerts
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Email Booking Notifications
                </p>
                <p className="text-[11px] text-slate-400">
                  Receive receipts, booking confirmations, and reminders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  emailNotifications ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    emailNotifications ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  SMS Technician Updates
                </p>
                <p className="text-[11px] text-slate-400">
                  Get text updates when your technician is en route.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSmsNotifications(!smsNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  smsNotifications ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    smsNotifications ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="text-sm" />
            {isSubmitting ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
