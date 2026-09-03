/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllServicesApi } from "@/service/publicApi";
import {
  Star,
  Search,
  ArrowLeft,
  MapPin,
  SlidersHorizontal,
  Wrench,
  CheckCircle2,
} from "lucide-react";

export interface BackendService {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: boolean;
  technicianId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  technician: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  _count: {
    bookings: number;
  };
  rating?: number;
  imageUrl?: string;
}

// Helper to deterministic generate distinct stock images per service ID
const getServiceImageUrl = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIndex = (hash % 6) + 1;
  const sampleImages = [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600&auto=format&fit=crop",
  ];
  return sampleImages[imageIndex - 1];
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<BackendService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating">(
    "price-asc",
  );

  const getAllServices = async () => {
    try {
      const res = await getAllServicesApi();
      if (res?.data?.success) {
        setServices(res.data.data.data);
      }
      // cons
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    getAllServices();
  }, []);
  // Extract unique categories dynamically from API response
  const categories = useMemo(() => {
    const list = services.map((s) => s.category?.name).filter(Boolean);
    return ["All", ...Array.from(new Set(list))];
  }, [services]);

  // Filter and Sort Services
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const matchesSearch =
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" ||
          service.category?.name === selectedCategory;

        return matchesSearch && matchesCategory && service.status;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating ?? 4.8) - (a.rating ?? 4.8);
        return 0;
      });
  }, [services, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Home
          </Link>
        </div>

        {/* Title Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Explore All Services
          </h1>
          <p className="text-sm text-slate-600">
            Find and book trusted professional home services tailored to your
            needs.
          </p>
        </div>

        {/* Search, Filter, & Sort Controls */}
        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between sm:p-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services by name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <label
              htmlFor="sortBy"
              className="text-xs font-semibold text-slate-600"
            >
              Sort by:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "price-asc" | "price-desc" | "rating",
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        {categories.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredServices.map((service) => {
              const imageUrl =
                service.imageUrl || getServiceImageUrl(service.id);
              const rating = service.rating ?? 4.9;
              const bookingCount = service._count?.bookings ?? 0;

              return (
                <div
                  key={service.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-xl hover:border-blue-200"
                >
                  <div>
                    {/* Image & Category Tag */}
                    <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-md">
                        {service.category?.name || "Service"}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {rating} ({bookingCount} bookings)
                        </span>

                        {service.location && (
                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {service.location}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-slate-900 line-clamp-1">
                        {service.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {service.description}
                      </p>

                      {service.technician?.name && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Wrench className="h-3.5 w-3.5 text-blue-600" />
                          <span>by {service.technician.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-400">
                        Price
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ${service.price}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/technicians/${service.technicianId}`}>
                        <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer">
                          Profile
                        </button>
                      </Link>
                      <Link href={`/booking/${service.id}`}>
                        <button className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer">
                          Book
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-800">
              No services found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search query or changing the filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
