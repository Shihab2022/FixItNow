/* eslint-disable react-hooks/incompatible-library */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheck,
  FiBell,
  FiSave,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiTool,
} from "react-icons/fi";
import { getMe, updateMe } from "@/service/auth";
import { getTechProfile, updateTechnicianProfile } from "@/service/technician";
import { showToast } from "@/components/toast/toast";
import { toastTypes } from "../constant";
import ImageUpload from "@/components/ui/ImageUpload";

const profileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  // Technician-specific fields
  bio: z.string().optional(),
  hourlyRate: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  role: string;
  status?: string;
  emailVerified?: boolean;
  createdAt?: string;
  technicianProfile?: {
    id: string;
    bio?: string | null;
    skills?: any;
    experience?: number;
    completedJobs?: number;
    hourlyRate?: number | null;
    isAvailable?: boolean;
    availability?: any;
    status?: boolean;
    imageUrl?: string | null;
  } | null;
}

export default function ProfileEditPage() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getMe();
        const data = res?.data?.data;
        if (data) {
          setUser(data);
          setValue("name", data.name || "");
          setValue("email", data.email || "");
          setValue("phone", data.phone || "");
          setValue("address", data.address || "");
          // Technician fields
          if (data.role === "TECHNICIAN" && data.technicianProfile) {
            const tp = data.technicianProfile;
            setValue("bio", tp.bio || "");
            setValue("hourlyRate", tp.hourlyRate?.toString() || "");
            setValue("experience", tp.experience?.toString() || "");
            setValue(
              "skills",
              Array.isArray(tp.skills) ? tp.skills.join(", ") : ""
            );
          }
          // If technician, also fetch full tech profile
          if (data.role === "TECHNICIAN") {
            try {
              const techRes = await getTechProfile();
              if (techRes?.data?.success) {
                const tp = techRes.data.data;
                setUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        technicianProfile: {
                          id: tp.id,
                          bio: tp.bio,
                          skills: tp.skills,
                          experience: tp.experience,
                          completedJobs: tp.completedJobs,
                          hourlyRate: tp.hourlyRate,
                          isAvailable: tp.isAvailable,
                          availability: tp.availability,
                          status: tp.status,
                          imageUrl: tp.imageUrl,
                        },
                      }
                    : prev
                );
                setValue("bio", tp.bio || "");
                setValue("hourlyRate", tp.hourlyRate?.toString() || "");
                setValue("experience", tp.experience?.toString() || "");
                setValue(
                  "skills",
                  Array.isArray(tp.skills) ? tp.skills.join(", ") : ""
                );
              }
            } catch (err) {
              console.error("Failed to fetch tech profile:", err);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update base user fields
      const res = await updateMe({
        name: data.name,
        phone: data.phone,
        address: data.address,
      });

      // Update technician-specific fields
      if (user?.role === "TECHNICIAN") {
        await updateTechnicianProfile({
          bio: data.bio,
          hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
          experience: data.experience ? Number(data.experience) : undefined,
          skills: data.skills
            ? data.skills.split(",").map((s) => s.trim())
            : undefined,
        });
      }

      if (res?.data?.success) {
        setSaveSuccess(true);
        showToast(toastTypes.SUCCESS, "Profile updated successfully!");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        showToast(
          toastTypes.FAILED,
          res?.message || "Failed to update profile."
        );
      }
    } catch (err: any) {
      showToast(toastTypes.FAILED, err?.message || "Something went wrong.");
    }
  };

  const handleImageChange = async (url: string | null) => {
    if (url) {
      await updateMe({ imageUrl: url });
      setUser((prev) => (prev ? { ...prev, imageUrl: url } : prev));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const isTechnician = user?.role === "TECHNICIAN";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information
          {isTechnician ? ", professional profile," : ""} and preferences.
        </p>
      </div>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture & Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-6">
            <FiUser className="text-blue-500" /> Profile Picture
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ImageUpload
              value={user?.imageUrl || user?.technicianProfile?.imageUrl || undefined}
              onChange={handleImageChange}
              size="lg"
              label="Profile Photo"
            />
            <div className="text-center sm:text-left">
              <p className="text-sm text-slate-500">
                Upload a professional photo. JPG, PNG, WEBP, GIF up to 5 MB.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isTechnician
                  ? "A good photo helps customers trust your services."
                  : "This photo may appear in communications."}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiMail className="text-blue-500" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="john@example.com"
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Address
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  {...register("address")}
                  type="text"
                  placeholder="123 Main St, City, State"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
              {errors.address && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Technician-Specific Fields */}
        {isTechnician && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FiBriefcase className="text-blue-500" /> Professional Profile
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bio / About
              </label>
              <textarea
                {...register("bio")}
                rows={3}
                placeholder="Describe your experience and services..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <FiDollarSign className="inline w-3 h-3 mr-1" />
                  Hourly Rate ($)
                </label>
                <input
                  {...register("hourlyRate")}
                  type="number"
                  placeholder="45"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <FiClock className="inline w-3 h-3 mr-1" />
                  Experience (years)
                </label>
                <input
                  {...register("experience")}
                  type="number"
                  placeholder="5"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <FiTool className="inline w-3 h-3 mr-1" />
                  Completed Jobs
                </label>
                <input
                  type="number"
                  value={user?.technicianProfile?.completedJobs || 0}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-tracked
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skills (comma-separated)
              </label>
              <input
                {...register("skills")}
                type="text"
                placeholder="Electrical Wiring, Circuit Repair, Lighting Installation"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Separate skills with commas
              </p>
            </div>
          </div>
        )}

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
