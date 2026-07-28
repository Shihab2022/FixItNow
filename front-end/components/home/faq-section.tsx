"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQItem } from "@/types";

const FAQS: FAQItem[] = [
  {
    question: "How does booking a service work?",
    answer:
      "Select your required service, choose a preferred time slot, and compare top-rated local technicians. Confirm your booking in under 60 seconds.",
  },
  {
    question: "How does payment work?",
    answer:
      "Your payment details are authorized securely upon booking. The funds are held in escrow and only released once the job is completed to your satisfaction.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, free cancellations and rescheduling are available up to 2 hours before your scheduled appointment time.",
  },
  {
    question: "How are technicians verified?",
    answer:
      "Every professional undergoes comprehensive background checks, identity verification, and manual license certification before joining our platform.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-slate-600">Got questions? We have answers.</p>
        </div>

        <div className="mt-10 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 p-5 text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
