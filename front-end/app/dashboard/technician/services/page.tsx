/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { toastTypes } from "@/app/constant";
import { showToast } from "@/components/toast/toast";
import { getCategory } from "@/service/admin";
import { createService, getServices } from "@/service/technician";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FiPlus,
  FiTool,
  FiDollarSign,
  FiMapPin,
  FiTag,
  FiXCircle,
  FiTrash2,
  FiSearch,
} from "react-icons/fi";

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

// Form Input Interface
export interface CreateServiceInput {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: string;
  status: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [cat, setCat] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryName = async () => {
    try {
      const res = await getCategory();
      if (res.data.success) {
        setCat(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getAllServices = async () => {
    try {
      const res = await getServices({});
      if (res.data.success) {
        setServices(res.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };
  useEffect(() => {
    getCategoryName();
    getAllServices();
  }, []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServiceInput>({
    defaultValues: {
      title: "",
      description: "",
      price: 100,
      location: "",
      categoryId: "",
      status: true,
    },
  });

  // Handle Create Service Submit
  const onSubmit = async (data: CreateServiceInput) => {
    setIsSubmitting(true);

    try {
      // Find category name for UI display

      const newService: any = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        location: data.location,
        categoryId: data.categoryId,
      };

      const res = await createService(newService);
      if (!res.data.success) {
        console.error("Failed to create service:", res.data.message);
        showToast(toastTypes.FAILED, `Failed to create service`);
        return;
      } else {
        showToast(toastTypes.SUCCESS, `Service created successfully`);
        await new Promise((resolve) => setTimeout(resolve, 600));

        setServices((prev) => [newService, ...prev]);
        reset();
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Service Active Status
  const toggleStatus = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: !s.status } : s)),
    );
  };

  // Delete Service
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Filtered Services List
  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Services Management
          </h1>
          <p className="text-sm text-slate-500">
            Create, manage, and toggle status for services you offer to
            customers.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm w-fit"
        >
          {isCreating ? (
            <FiXCircle className="w-4 h-4" />
          ) : (
            <FiPlus className="w-4 h-4" />
          )}
          {isCreating ? "Cancel" : "Add New Service"}
        </button>
      </div>

      {/* CREATE SERVICE FORM (Toggled) */}
      {isCreating && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in duration-200"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FiTool className="text-blue-600" /> Create New Service Offering
            </h2>
            <p className="text-xs text-slate-500">
              Fill in details matching your service database schema.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiTool className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="e.g. Electrical Inspection & Circuit Fixing"
                  {...register("title", { required: "Title is required" })}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              {errors.title && (
                <span className="text-xs text-rose-500 mt-1">
                  {errors.title.message}
                </span>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="500"
                  {...register("price", {
                    required: "Price is required",
                    min: 1,
                  })}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              {errors.price && (
                <span className="text-xs text-rose-500 mt-1">
                  {errors.price.message}
                </span>
              )}
            </div>

            {/* Category ID Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {cat.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="e.g. On-site / New York, NY"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              {errors.location && (
                <span className="text-xs text-rose-500 mt-1">
                  {errors.location.message}
                </span>
              )}
            </div>

            {/* Active Status Checkbox */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="status-checkbox"
                {...register("status")}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500/20 cursor-pointer"
              />
              <label
                htmlFor="status-checkbox"
                className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
              >
                Active & Open for Bookings
              </label>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe what is included in this service..."
                {...register("description", {
                  required: "Description is required",
                })}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.description && (
                <span className="text-xs text-rose-500 mt-1">
                  {errors.description.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <FiPlus className="w-4 h-4" />
              {isSubmitting ? "Creating..." : "Save Service"}
            </button>
          </div>
        </form>
      )}

      {/* SERVICES DISPLAY AREA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline-block">
            Total Services:{" "}
            <strong className="text-slate-900">
              {filteredServices.length}
            </strong>
          </span>
        </div>

        {/* Services Cards / Grid */}
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {`No services found. Click "Add New Service" to create your first offering.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50/50">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold mb-1.5">
                        {service.category?.name || "Service"}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {service.title}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <button
                      onClick={() => toggleStatus(service.id)}
                      title="Click to toggle active status"
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        service.status
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {service.status ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                          Active
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>{" "}
                          Inactive
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm flex items-center">
                      ${service.price.toFixed(2)}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <FiMapPin className="text-slate-400" /> {service.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(service.id)}
                      title="Delete Service"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
