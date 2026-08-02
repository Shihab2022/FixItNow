/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getAllServicesApi } from "@/service/publicApi";
import { Star, MapPin, Wrench } from "lucide-react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
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
export function FeaturedServices() {
  const [services, setServices] = useState<BackendService[]>([]);
  const getAllServices = async () => {
    try {
      const res = await getAllServicesApi();
      if (res.data.success) {
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
  return (
    <section id="services" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
              Featured Services
            </h2>
            <p className="mt-2 text-slate-600">
              Explore our highest-rated professional home services.
            </p>
          </div>
        </div>

        {services.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((service) => {
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
                      <button className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer">
                        Book
                      </button>
                    </div>
                    {/* <button className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 cursor-pointer">
                      Book Now
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {services.length > 8 && (
        <div className="mt-10 text-center">
          <Link href="/services">
            <button className="inline-flex cursor-pointer items-center gap-2 rounded-2xl text-sm font-bold text-blue-700 ">
              <>
                Show All Services ({services.length}){" "}
                <FaArrowRight className="h-4 w-4" />
              </>
            </button>
          </Link>
        </div>
      )}
    </section>
  );
}
