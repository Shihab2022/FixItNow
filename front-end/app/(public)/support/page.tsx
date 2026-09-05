import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowLeft,
  FiClock,
  FiMessageSquare,
} from "react-icons/fi";

const SUPPORT_EMAIL = "support@fixitnow.com";
const SUPPORT_PHONE = "+880 1700-000000";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <FiMessageSquare className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Help &amp; Support
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
              Need help with a booking, payment, or your account? Our support
              team is here for you — reach out through any of the channels
              below and we&apos;ll get back to you quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Email */}
            <div className="space-y-2 rounded-2xl border border-slate-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiMail />
              </div>
              <h3 className="pt-1 text-sm font-bold text-slate-900">
                Email Us
              </h3>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="block text-xs font-semibold text-blue-600 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              <p className="text-[11px] text-slate-400">
                We usually reply within 24 hours.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2 rounded-2xl border border-slate-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <FiPhone />
              </div>
              <h3 className="pt-1 text-sm font-bold text-slate-900">
                Call Us
              </h3>
              <a
                href={`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`}
                className="block text-xs font-semibold text-blue-600 hover:underline"
              >
                {SUPPORT_PHONE}
              </a>
              <p className="text-[11px] text-slate-400">
                Saturday – Thursday, 9:00 AM – 8:00 PM.
              </p>
            </div>

            {/* Hours */}
            <div className="space-y-2 rounded-2xl border border-slate-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FiClock />
              </div>
              <h3 className="pt-1 text-sm font-bold text-slate-900">
                Support Hours
              </h3>
              <p className="text-xs font-medium text-slate-600">
                Sat – Thu: 9:00 AM – 8:00 PM
              </p>
              <p className="text-[11px] text-slate-400">
                Emergency issues are prioritised.
              </p>
            </div>
          </div>

          {/* Common questions */}
          <div className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Common Questions
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <strong className="text-slate-800">
                  Can I cancel a booking?
                </strong>{" "}
                Yes — bookings can be cancelled by the customer or the
                technician up to <strong>2 hours</strong> before the
                scheduled start time. For a 4:00 PM appointment, cancellation
                is possible until 2:00 PM.
              </p>
              <p>
                <strong className="text-slate-800">
                  How long do I have to pay for a booking?
                </strong>{" "}
                Payments should be completed within <strong>1 hour</strong> of
                creating the booking. You&apos;ll receive a reminder email
                with a payment link 10 minutes before it is automatically
                cancelled.
              </p>
              <p>
                <strong className="text-slate-800">
                  Do I get a receipt?
                </strong>{" "}
                Yes — a PDF receipt with full booking and payment details is
                attached to every confirmation email, and can also be
                downloaded from your booking page.
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 p-5 text-center text-xs text-slate-300">
            <FiMapPin className="text-blue-400" />
            Serving customers nationwide — Dhaka, Chattogram, Sylhet &amp;
            more.
          </div>
        </div>
      </div>
    </div>
  );
}
