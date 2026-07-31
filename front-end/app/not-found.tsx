// --- No 'use client' needed here ---

import Link from "next/link";
import { HiHome, HiBookOpen, HiSearch, HiSupport } from "react-icons/hi";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-125 h-125 bg-indigo-950/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-950/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center z-10 space-y-12">
        <div className="relative inline-flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />

          <h1 className="relative text-[10rem] sm:text-[14rem] font-extrabold leading-none tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-white via-slate-300 to-slate-600 select-none">
            404
          </h1>
          <p className="absolute bottom-6 text-xl sm:text-2xl font-semibold tracking-wide text-indigo-200 uppercase">
            Page Not Found
          </p>
        </div>
        <div className="space-y-4 max-w-lg mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            We’ve lost this page.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            The resource you’re looking for seems to have vanished into the
            digital void. It might have been moved, deleted, or perhaps the URL
            has a typo.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
          >
            <HiHome className="w-6 h-6" />
            <span className="text-lg">Return to Homepage</span>
          </Link>
        </div>
        <div className="pt-10 border-t border-slate-800/80 mt-12 bg-slate-900/40 p-8 rounded-2xl shadow-inner border">
          <p className="text-sm text-slate-500 mb-6 uppercase tracking-wider font-semibold">
            Need help finding your way?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <Link
              href="/docs"
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-800/50 transition border border-transparent hover:border-slate-700"
            >
              <HiBookOpen className="w-9 h-9 text-indigo-400 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-slate-100 block">
                  Documentation
                </span>
                <span className="text-sm text-slate-400">
                  Read guides and API references.
                </span>
              </div>
            </Link>

            <Link
              href="/search"
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-800/50 transition border border-transparent hover:border-slate-700"
            >
              <HiSearch className="w-9 h-9 text-purple-400 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-slate-100 block">
                  Search Site
                </span>
                <span className="text-sm text-slate-400">
                  Find exactly what you need.
                </span>
              </div>
            </Link>

            <Link
              href="/support"
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-800/50 transition border border-transparent hover:border-slate-700"
            >
              <HiSupport className="w-9 h-9 text-teal-400 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-slate-100 block">
                  Contact Support
                </span>
                <span className="text-sm text-slate-400">
                  Get help from our team.
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
