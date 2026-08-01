"use client";

import { motion } from "framer-motion";
import {
  FiShield,
  FiClock,
  FiCheckCircle,
  //   FiAward,
  //   FiUsers,
  //   FiSmile,
} from "react-icons/fi";
import Image from "next/image";

// const stats = [
//   { id: 1, label: "Verified Pros", value: "1,500+", icon: FiUsers },
//   { id: 2, label: "Completed Jobs", value: "48k+", icon: FiCheckCircle },
//   { id: 3, label: "Customer Rating", value: "4.9★", icon: FiAward },
//   { id: 4, label: "Satisfaction Rate", value: "99%", icon: FiSmile },
// ];

const highlights = [
  {
    icon: FiShield,
    title: "Vetted & Insured Pros",
    description:
      "Every technician undergoes rigorous background checks, credential verification, and skills assessments.",
  },
  {
    icon: FiClock,
    title: "Upfront & Fair Pricing",
    description:
      "No hidden fees or surprise hourly markups. You review and approve every quote before work begins.",
  },
  {
    icon: FiCheckCircle,
    title: "FixIt Happiness Guarantee",
    description:
      "If the job isn’t completed to standard, we make it right—100% money-back coverage on eligible bookings.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24  relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="px-3.5 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              About FixIt Platform
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-black">
              Redefining Home Services with{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-teal-400">
                Trust & Transparency
              </span>
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              FixIt was built to solve the hassle of finding reliable home
              repair professionals. We connect homeowners directly with top-tier
              plumbers, electricians, and technicians—offering transparent
              pricing, instant scheduling, and total peace of mind.
            </p>

            {/* Highlights List */}
            <div className="space-y-4 pt-4">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="p-3  border border-slate-700/80 text-blue-400 rounded-xl shrink-0 mt-7">
                      <Icon className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Visual / Hero Card Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-800/40 p-3 backdrop-blur-xl">
              <Image
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000"
                alt="Professional technician servicing equipment"
                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                height={400}
                width={1000}
              />

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-400 rounded-full animate-ping" />
                  <span className="text-xs font-bold text-slate-200">
                    Live Platform Status
                  </span>
                </div>
                <span className="text-xs font-mono text-teal-400 font-bold bg-teal-950/60 border border-teal-800/60 px-2.5 py-1 rounded-lg">
                  Active in 42 Cities
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Grid */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 mt-16 border-t border-slate-800">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 bg-slate-800/40 border border-slate-800 rounded-2xl text-center space-y-2 hover:border-slate-700 transition-colors"
              >
                <Icon className="text-blue-400 text-2xl mx-auto" />
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {stat.value}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div> */}
      </div>
    </section>
  );
}
