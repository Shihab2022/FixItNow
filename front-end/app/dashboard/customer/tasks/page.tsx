/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Loader2,
  Plus,
  X,
  Navigation,
  DollarSign,
  Tag,
  Clock,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import {
  createJobRequest,
  getJobRequests,
  getAllCategories,
} from "@/service/map";
import { showToast } from "@/components/toast/toast";
import { toastTypes } from "@/app/constant";

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BOOKED: "bg-blue-50 text-blue-700 border-blue-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  budget: "",
  categoryId: "",
  address: "",
  latitude: "",
  longitude: "",
};

export default function CustomerTasksPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showingForm, setShowingForm] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const [locQuery, setLocQuery] = useState("");
  const [locResults, setLocResults] = useState<any[]>([]);
  const [locSearching, setLocSearching] = useState(false);
  const locTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMyTasks = useCallback(async () => {
    const res = await getJobRequests({ mine: "true" });
    if (res?.data?.success) {
      setTasks(res.data.data || []);
    }
  }, []);

  useEffect(() => {
    getAllCategories().then((res) => {
      if (res?.data?.success) setCategories(res.data.data || []);
    });
    fetchMyTasks().finally(() => setLoading(false));
  }, [fetchMyTasks]);

  useEffect(() => {
    return () => {
      if (locTimer.current) clearTimeout(locTimer.current);
    };
  }, []);

  const setField = (key: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Location search – geocoding is restricted to Bangladesh. */
  const handleLocSearch = (value: string) => {
    setLocQuery(value);
    if (locTimer.current) clearTimeout(locTimer.current);
    if (!value.trim()) {
      setLocResults([]);
      return;
    }
    locTimer.current = setTimeout(async () => {
      setLocSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          value,
        )}&limit=5&countrycodes=bd&viewbox=88.01%2C26.63%2C92.68%2C20.74&bounded=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        setLocResults(Array.isArray(data) ? data : []);
      } catch {
        setLocResults([]);
      } finally {
        setLocSearching(false);
      }
    }, 500);
  };

  const selectLocation = (result: any) => {
    setForm((prev) => ({
      ...prev,
      address: result.display_name,
      latitude: parseFloat(result.lat).toFixed(6),
      longitude: parseFloat(result.lon).toFixed(6),
    }));
    setLocQuery("");
    setLocResults([]);
  };
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      showToast(
        toastTypes.FAILED,
        "Geolocation is not supported by your browser",
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setForm((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
        }));
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
          const res = await fetch(url, {
            headers: { "Accept-Language": "en" },
          });
          const data = await res.json();
          setForm((prev) => ({
            ...prev,
            address: data?.display_name || prev.address,
          }));
        } catch {
          /* address is optional – coordinates already set */
        }
        showToast(toastTypes.SUCCESS, "Current location captured!");
      },
      () => showToast(toastTypes.WARNING, "Location access denied."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.address.trim() ||
      !form.categoryId
    ) {
      showToast(
        toastTypes.FAILED,
        "Please fill in title, description, category and location.",
      );
      return;
    }
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      showToast(
        toastTypes.FAILED,
        "Please set a location via search or 'Use My Location'.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await createJobRequest({
        title: form.title.trim(),
        description: form.description.trim(),
        budget: form.budget === "" ? null : Number(form.budget),
        address: form.address.trim(),
        latitude: lat,
        longitude: lng,
        categoryId: form.categoryId,
      });
      if (res?.data?.success) {
        showToast(
          toastTypes.SUCCESS,
          "Task posted! Nearby technicians can now see it on the map.",
        );
        setForm(EMPTY_FORM);
        setShowingForm(false);
        fetchMyTasks();
      } else {
        showToast(
          toastTypes.FAILED,
          res?.data?.message || "Failed to post task",
        );
      }
    } catch {
      showToast(toastTypes.FAILED, "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500">
            Post a task and let nearby technicians apply for it.
          </p>
        </div>
        <button
          onClick={() => setShowingForm((v) => !v)}
          className="inline-flex items-center gap-2 w-fit px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
        >
          {showingForm ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Post a New Task
            </>
          )}
        </button>
      </div>
      {showingForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 animate-in fade-in duration-200"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-blue-600" /> Post a New Task
            </h2>
            <p className="text-xs text-slate-500">
              Describe what you need – technicians in your area will see it on
              the map and can apply.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Ceiling fan not working, need repair"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.categoryId}
                  onChange={(e) => setField("categoryId", e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Budget <span className="text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(e) => setField("budget", e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe the problem in detail – size, brand, what has been tried, etc."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            {/* Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={locQuery}
                    onChange={(e) => handleLocSearch(e.target.value)}
                    placeholder="Search location (Bangladesh), e.g. Dhanmondi, Dhaka..."
                    className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {locSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {locResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl z-30">
                      {locResults.map((result, idx) => (
                        <button
                          key={`${result.place_id}-${idx}`}
                          type="button"
                          onClick={() => selectLocation(result)}
                          className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-blue-50 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-800 line-clamp-2">
                            {result.display_name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" /> Use My Location
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Address / Area
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    placeholder="Full address"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setField("latitude", e.target.value)}
                    placeholder="23.8103"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setField("longitude", e.target.value)}
                    placeholder="90.4125"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowingForm(false)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Post Task
                </>
              )}
            </button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-3">
            <CheckCircle2 className="mx-auto w-10 h-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              You haven&apos;t posted any tasks yet.
            </p>
            <p className="text-xs text-slate-400">
              Click &ldquo;Post a New Task&rdquo; and nearby technicians will
              find you on the map.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">{task.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      STATUS_STYLES[task.status] || STATUS_STYLES.CLOSED
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {task.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {task.category?.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {task.budget ?? "N/A"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{task.address}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(task.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400">
                  {task._count?.applications ?? 0} application
                  {(task._count?.applications ?? 0) === 1 ? "" : "s"}
                </span>
                <Link
                  href={`/tasks/${task.id}`}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold transition-colors"
                >
                  View Task <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}