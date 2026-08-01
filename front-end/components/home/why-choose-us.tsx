"use client";

import {
  ShieldCheck,
  UserCheck,
  DollarSign,
  Zap,
  Lock,
  Star,
  PhoneCall,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    desc: "All technicians undergo rigorous background and license checks.",
  },
  {
    icon: UserCheck,
    title: "Background Checked",
    desc: "Safety first. Every professional on our platform is identity verified.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    desc: "Know the exact cost upfront. No hidden fees or unexpected charges.",
  },
  {
    icon: Zap,
    title: "Fast Booking",
    desc: "Book a technician in under 60 seconds with instant confirmation.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    desc: "Payments are held safely and only released when the job is done.",
  },
  {
    icon: Star,
    title: "Real Reviews",
    desc: "Authentic ratings and feedback from real homeowners in your area.",
  },
  {
    icon: PhoneCall,
    title: "24/7 Support",
    desc: "Our dedicated support team is here to assist you anytime.",
  },
  {
    icon: Award,
    title: "Satisfaction Guarantee",
    desc: "Not happy with the service? We will make it right, guaranteed.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Why Choose FixItNow
          </h2>
          <p className="mt-3 text-slate-400">
            We set the standard for quality, security, and convenience in home
            services.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-slate-800  p-6 backdrop-blur-xs"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-black">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-black leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
