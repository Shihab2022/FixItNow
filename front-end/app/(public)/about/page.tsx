import Link from "next/link";
import { FiArrowLeft, FiShield, FiUsers, FiTool } from "react-icons/fi";

const highlights = [
  {
    icon: FiTool,
    title: "Verified Technicians",
    description:
      "Every professional on FixItNow is reviewed and rated by real customers, so you always know who is showing up at your door.",
  },
  {
    icon: FiShield,
    title: "Secure Payments",
    description:
      "Pay safely through SSLCOMMERZ. Every booking produces a PDF receipt, and payments are only released once the service is confirmed.",
  },
  {
    icon: FiUsers,
    title: "Built for Both Sides",
    description:
      "Customers book in minutes; technicians manage availability, jobs and earnings from a dedicated dashboard.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">
              About FixItNow
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
              FixItNow is a home-service marketplace that connects customers
              with trusted local technicians. From electrical work to
              plumbing, cleaning and AC repair — book a verified professional
              in minutes, pay securely online, and track everything from your
              dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="space-y-2 rounded-2xl border border-slate-200 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon />
                </div>
                <h3 className="pt-1 text-sm font-bold text-slate-900">
                  {title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="mb-3 text-lg font-bold text-slate-900">
              How it works
            </h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
              <li>Pick a service and a technician you like.</li>
              <li>Choose an available date and time slot, and confirm the booking.</li>
              <li>Complete the payment online within 1 hour to lock the slot.</li>
              <li>The technician arrives on schedule and completes the job.</li>
              <li>Rate your experience and download your PDF receipt.</li>
            </ol>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
