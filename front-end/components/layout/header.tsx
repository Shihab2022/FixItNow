/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "./profileDropdown";

export function Header({ user }: { user?: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  console.log("User in Header:", user);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-slate-900 text-xl tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span>
            FixIt<span className="text-blue-600">Now</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link
            href="/"
            className="text-blue-600 transition hover:text-blue-700"
          >
            Home
          </Link>
          <Link href="#services" className="transition hover:text-slate-900">
            Services
          </Link>
          <Link href="#technicians" className="transition hover:text-slate-900">
            Technicians
          </Link>
          <Link href="#about" className="transition hover:text-slate-900">
            About
          </Link>
          <Link href="#contact" className="transition hover:text-slate-900">
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            aria-label="Search"
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900"
          >
            <Search className="h-5 w-5" />
          </button>
          {user?.role ? (
            <ProfileDropdown user={user} />
          ) : (
            <>
              {" "}
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200/60"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-slate-800"
              >
                Register
              </Link>{" "}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-200/60 md:hidden"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-slate-200 bg-white px-6 py-6 md:hidden"
          >
            <nav className="flex flex-col gap-4 text-base font-medium text-slate-700">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="#services" onClick={() => setIsMobileMenuOpen(false)}>
                Services
              </Link>
              <Link
                href="#technicians"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Technicians
              </Link>
              <Link href="#about" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
              <hr className="my-2 border-slate-100" />
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-center font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-center font-medium text-white"
                >
                  Register
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
