import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using FixItNow you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the platform.",
  },
  {
    title: "2. Bookings & Cancellations",
    body: "Bookings must be paid for within 1 hour of creation or they are cancelled automatically. Either the customer or the technician may cancel a booking up to 2 hours before the scheduled start time (for example, a 4:00 PM booking can be cancelled until 2:00 PM). Cancellations inside that window are not permitted.",
  },
  {
    title: "3. Payments",
    body: "All payments are processed securely through SSLCOMMERZ. A PDF receipt containing the booking and payment details is issued for every transaction. Refunds for valid cancellations of paid bookings are handled through support.",
  },
  {
    title: "4. Technician Responsibilities",
    body: "Technicians must keep their availability up to date, honour confirmed bookings, and only mark a job as completed after the customer's payment has been completed and the work is done.",
  },
  {
    title: "5. Account Conduct",
    body: "Users must provide accurate information. Accounts used for fraud, abuse, or harassment may be suspended or banned by administrators.",
  },
  {
    title: "6. Contact",
    body: "For any questions about these terms, contact us at support@fixitnow.com or visit the Help & Support page.",
  },
];

export default function TermsPage() {
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
          <h1 className="text-3xl font-extrabold text-slate-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Last updated: September 2026
          </p>

          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-base font-bold text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
