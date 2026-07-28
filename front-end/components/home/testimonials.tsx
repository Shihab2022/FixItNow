"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Testimonial } from "@/types";

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Emily Watson",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop",
    rating: 5,
    comment:
      "The electrician arrived within 45 minutes and fixed our breaker panel seamlessly. Extremely professional!",
    serviceUsed: "Electrical Repair",
  },
  {
    id: "2",
    name: "Michael Chang",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    rating: 5,
    comment:
      "Transparent pricing and excellent cleaning service. Will definitely be booking through FixItNow again.",
    serviceUsed: "Deep Cleaning",
  },
];

export function Testimonials() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
            What Customers Say
          </h2>
          <p className="mt-2 text-slate-600">
            Read genuine feedback from satisfied homeowners.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-slate-700 leading-relaxed italic">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200">
                  <Image
                    src={t.avatarUrl}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {t.name}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {t.serviceUsed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
