/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { getTechProfile, updateTechnicianProfile } from "@/service/technician";
import React, { useEffect, useState } from "react";
import {
  FiBriefcase,
  FiDollarSign,
  FiCheckCircle,
  FiPlus,
  FiX,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";

// Initializing state directly with your exact API response
type TechnicianProfile = {
  id: string;
  userId: string;
  bio: string;
  skills: string[];
  experience: number;
  completedJobs: number;
  isAvailable: boolean;
  hourlyRate: number | null;
  availability: Record<string, string[]>;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

const initialProfileData: TechnicianProfile = {
  id: "146d59be-fc8b-498c-ac3c-21e56977a416",
  userId: "97ee2268-f655-4e24-9a77-48bd750002d6",
  bio: "Professional electrician with over 6 years of experience in residential and commercial electrical services.",
  skills: [
    "Electrical Wiring",
    "Circuit Repair",
    "Ceiling Fan Installation",
    "Lighting Installation",
    "Power Backup Systems",
  ],
  experience: 6,
  completedJobs: 100,
  isAvailable: true,
  hourlyRate: 25,
  availability: {
    friday: ["09:00-15:00"],
    monday: ["09:00-12:00", "14:00-18:00"],
    sunday: [],
    tuesday: ["09:00-17:00"],
    saturday: ["10:00-14:00"],
    thursday: ["09:00-17:00"],
    wednesday: ["10:00-16:00"],
  },
  status: true,
  createdAt: "2026-08-02T07:08:12.045Z",
  updatedAt: "2026-08-03T13:49:16.059Z",
};

export default function EditTechnicianProfilePage() {
  const [profile, setProfile] = useState<TechnicianProfile>(initialProfileData);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const getTech = async () => {
    const res = await getTechProfile();
    if (res?.data?.success) {
      setProfile(res.data.data);
    }
  };
  useEffect(() => {
    getTech();
  }, []);
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (profile.skills.includes(newSkillInput.trim())) return;

    setProfile({
      ...profile,
      skills: [...profile.skills, newSkillInput.trim()],
    });
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        bio: profile.bio,
        skills: profile.skills,
        experience: profile.experience,
        hourlyRate: profile.hourlyRate,
        isAvailable: profile.isAvailable,
        status: profile.status,
      };

      const res = await updateTechnicianProfile(payload);

      console.log("API Response:", res); // Log the entire response for debugging
      if (res?.data?.success) {
        setFeedback({
          type: "success",
          message: "Profile updated successfully!",
        });
        setProfile((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      } else {
        setFeedback({
          type: "error",
          message: res?.data?.message || res?.message || "Failed to update profile",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Network error occurred while updating profile.",
      });
      console.error("Error updating profile:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Technician Profile Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your bio, hourly rates, skills, and work availability status.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Edit Details
            </h2>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Professional Bio
              </label>
              <textarea
                rows={4}
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Describe your expertise, experience level, and qualifications..."
                className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800"
              />
            </div>

            {/* Experience & Hourly Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Years of Experience
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={profile.experience}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        experience: Number(e.target.value),
                      })
                    }
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Hourly Rate ($/hr)
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={profile.hourlyRate ?? ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        hourlyRate: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Availability Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Job Availability
                  </p>
                  <p className="text-xs text-slate-500">
                    Toggle whether customers can send new instant booking
                    requests.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.isAvailable}
                    onChange={(e) =>
                      setProfile({ ...profile, isAvailable: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Skills Section */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Skills & Expertise
              </label>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Generator Maintenance"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddSkill())
                  }
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <FiPlus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Skill Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-500 hover:text-blue-900 focus:outline-none"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" /> Save Profile Updates
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Profile Summary & Fixed Schedule Preview */}
        <div className="space-y-6">
          {/* Live Card Preview */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">
                Current Preview
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  profile.isAvailable
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-700 text-slate-400 border-slate-600"
                }`}
              >
                {profile.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold">
                {profile.experience} Years Experience
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                {profile.bio || "No bio updated yet."}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Completed Jobs:</span>
                <span className="font-bold text-white">
                  {profile.completedJobs}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Hourly Rate:</span>
                <span className="font-bold text-white">
                  ${profile.hourlyRate ? profile.hourlyRate.toFixed(2) : "0.00"}
                  /hr
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Preview (ReadOnly) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-slate-500" /> Active Working
              Schedule
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(profile.availability).map(([day, slots]) => (
                <div
                  key={day}
                  className="py-2 flex justify-between items-center capitalize"
                >
                  <span className="font-medium text-slate-700">{day}</span>
                  <span className="text-slate-500 font-mono">
                    {slots.length > 0 ? slots.join(", ") : "Closed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
