"use client";

import { useState, FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="bg-slate-100/70 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-bold text-slate-900 text-2xl sm:text-3xl">
          Stay Updated with Home Tips & Offers
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Subscribe to our newsletter for exclusive discounts and home
          maintenance guides.
        </p>

        {submitted ? (
          <div className="mt-6 flex items-center justify-center gap-2 font-medium text-emerald-600 text-sm">
            <CheckCircle2 className="h-5 w-5" /> Thank you for subscribing!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:w-80 shadow-xs">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-blue-700 sm:w-auto shadow-md"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
