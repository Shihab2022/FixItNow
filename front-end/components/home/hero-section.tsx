"use client";

import Image from "next/image";
import { CheckCircle2, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-blue-400/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-0 -z-10 h-96 w-96 rounded-full bg-teal-400/55 blur-3xl" /> */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Hero Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 text-xs font-semibold text-teal-700">
                <ShieldCheck className="h-4 w-4" /> Trusted Local Home Services
              </span>
              <h1 className="mt-4 font-bold text-slate-900 text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                Book Trusted Home Service Professionals in{" "}
                <span className="text-blue-600">Minutes</span>
              </h1>
              <p className="mt-6 text-base text-slate-600 leading-relaxed sm:text-lg">
                Connect with verified local electricians, plumbers, cleaners,
                and mechanics. Upfront pricing and 100% satisfaction guaranteed.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#search"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-blue-700"
                >
                  Find Services <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#technician"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Become a Technician
                </a>
              </div>

              {/* Feature Chips */}
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  "Verified Pros",
                  "Secure Payments",
                  "Same-Day Service",
                  "Top Rated",
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-slate-700 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Visual / Floating Technician Cards */}
          <div className="relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-lg"
            >
              <div className="relative h-105 w-full overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-tr from-slate-100 to-blue-50/50 p-4 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop"
                  alt="Technician servicing home equipment"
                  fill
                  className="rounded-2xl object-cover object-center"
                  priority
                />
              </div>

              {/* Floating Card 1 */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -left-6 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-slate-200">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-900 font-semibold text-sm">
                      Sarah M. <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-500">Master Electrician</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9 (184
                      jobs)
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-6 -right-4 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Immediate Availability
                    </p>
                    <p className="text-[11px] text-slate-500">
                      30+ Pros nearby ready
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
