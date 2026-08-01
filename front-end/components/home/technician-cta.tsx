import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function TechnicianCTA() {
  return (
    <section id="technician" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl px-6 py-12 border text-black border-slate-600 sm:p-16">
          <div className="max-w-xl">
            <h2 className="font-bold text-3xl sm:text-4xl tracking-tight">
              Earn Money on Your Own Terms
            </h2>
            <p className="mt-4  text-base">
              Join thousands of skilled technicians growing their business with
              FixItNow.
            </p>
            <ul className="mt-6 space-y-3 text-sm ">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" /> Flexible
                working hours
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" /> Direct weekly
                payouts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" /> Access to
                thousands of local clients
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/register">
                <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 shadow-md">
                  Register as Technician <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
