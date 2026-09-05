"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiMail,
  FiPhone,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";
import { showToast } from "@/components/toast/toast";
import { toastTypes } from "@/app/constant";
import { sendMessage } from "@/service/contact";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

    const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await sendMessage(data);
      if (res?.data?.success || res?.success) {
        setSubmitted(true);
        reset();
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        showToast(
          toastTypes.FAILED,
          res?.message || "Failed to send your message. Please try again."
        );
      }
    } catch (err: any) {
      showToast(
        toastTypes.FAILED,
        err?.message || "Something went wrong. Please try again later."
      );
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            {` Have Questions? We're Here to Help`}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Whether you need help booking a pro, tracking an existing order, or
            joining as a service provider, our team is standing by.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Info Cards */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg">
                <FiMail />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Email Support
              </h3>
              <p className="text-xs text-slate-500">
                Reach our response team anytime.
              </p>
              <a
                href="mailto:support@fixitnow.com"
                className="text-xs font-bold text-blue-600 hover:underline block"
              >
                support@fixitnow.com
              </a>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-lg">
                <FiPhone />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Phone Hotline
              </h3>
              <p className="text-xs text-slate-500">
                Mon-Fri from 8:00 AM to 8:00 PM EST.
              </p>
              <a
                href="tel:+18005553494"
                className="text-xs font-bold text-teal-600 hover:underline block"
              >
                +1 (800) 555-FIXIT
              </a>
            </div>

            {/* <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-lg">
                <FiMapPin />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Headquarters
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                100 Innovation Way, Suite 500
                <br />
                San Francisco, CA 94105
              </p>
            </div> */}
          </div>

          {/* Right Interactive Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Send us a Direct Message
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below and we will respond within 24 hours.
              </p>
            </div>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2"
              >
                <FiCheckCircle className="text-lg text-emerald-600 shrink-0" />
                Thank you! Your message has been sent successfully.
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  {...register("subject")}
                  type="text"
                  placeholder="Inquiry about Plumbing Services"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                {errors.subject && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  placeholder="How can we help you today?"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none"
                />
                {errors.message && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

                            <AnimatePresence>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-8 text-center gap-3"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                      <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">
                        Message Sent!
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Your message has been received. Our team will get back
                        to you shortly.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiSend />
                    {isSubmitting ? "Sending Message..." : "Send Message"}
                  </button>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
