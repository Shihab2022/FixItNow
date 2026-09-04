"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Tag,
  Clock,
  CheckCircle2,
  Send,
  User,
} from "lucide-react";
import { getMe } from "@/service/auth";
import {
  getJobRequestById,
  applyToJobRequest,
  getJobRequestApplications,
  acceptJobRequestApplication,
} from "@/service/map";
import { showToast } from "@/components/toast/toast";
import { toastTypes } from "@/app/constant";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [task, setTask] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const isCustomer = user?.role === "CUSTOMER";
  const isOwner = task?.customerId === user?.id;

  useEffect(() => {
    getMe().then((res) => setUser(res?.data?.data || null));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJobRequestById(id)
      .then((res) => {
        if (res?.data?.success) setTask(res.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    getJobRequestApplications(id).then((res) => {
      if (res?.data?.success) {
        const apps = res.data.data || [];
        setApplications(apps);
        if (!isCustomer) setHasApplied(apps.length > 0);
      }
    });
  }, [id, user, isCustomer]);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      const res = await applyToJobRequest(id, message);
      if (res?.data?.success) {
        showToast(toastTypes.SUCCESS, "Application sent! The customer will be notified.");
        setHasApplied(true);
        setMessage("");
      } else {
        showToast(toastTypes.FAILED, res?.data?.message || "Failed to apply");
      }
    } catch {
      showToast(toastTypes.FAILED, "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (applicationId: string) => {
    try {
      const res = await acceptJobRequestApplication(id, applicationId);
      if (res?.data?.success) {
        showToast(toastTypes.SUCCESS, "Application accepted! The technician has been notified.");
        router.refresh();
      } else {
        showToast(toastTypes.FAILED, res?.data?.message || "Failed to accept");
      }
    } catch {
      showToast(toastTypes.FAILED, "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!task) {
    return <div className="text-center py-20 text-slate-500">Task not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.push("/map")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Map
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                task.status === "OPEN"
                  ? "bg-emerald-50 text-emerald-700"
                  : task.status === "BOOKED"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {task.status}
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
            </div>
            {task.budget && (
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Budget</p>
                <p className="text-xl font-bold text-emerald-600">${task.budget}</p>
              </div>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed">{task.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{task.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
              <Tag className="w-4 h-4 text-purple-500" />
              <span>{task.category?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {task.customer?.name}
              </p>
              <p className="text-xs text-slate-400">Task Owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}