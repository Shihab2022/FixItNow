import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect the information you provide when registering (name, email, phone), your saved addresses and location coordinates (used only for the nearest-technician map), and booking/payment records required to deliver the service.",
  },
  {
    title: "How We Use Your Information",
    body: "Your data is used to create and manage bookings, process payments through SSLCOMMERZ, send transactional emails (booking confirmations, payment receipts with PDF attachments, reminders), and match you with nearby technicians or tasks.",
  },
  {
    title: "Payments",
    body: "We never see or store your card details. All payment data is handled by SSLCOMMERZ; we only retain the transaction ID, amount, and status needed for your receipts and payment history.",
  },
  {
    title: "Sharing",
    body: "Your contact details are shared with the technician assigned to your booking (and vice versa) so the service can be performed. We do not sell your personal information to third parties.",
  },
  {
    title: "Data Retention",
    body: "Booking, payment and review records are retained for accounting and dispute-resolution purposes. You may request account deletion by contacting support@fixitnow.com.",
  },
  {
    title: "Contact",
    body: "For privacy questions or data requests, email support@fixitnow.com or reach us through the Help & Support page.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
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
