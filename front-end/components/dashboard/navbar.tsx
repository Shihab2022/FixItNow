"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "../layout/profileDropdown";

interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: "CUSTOMER" | "TECHNICIAN" | "ADMIN" | string;
  avatarUrl?: string;
}

export function DashboardHeader({ user }: { user?: User }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span>
            FixIt<span className="text-blue-600">Now</span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <button
            aria-label="Search"
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900"
          >
            <Search className="h-5 w-5" />
          </button>

          <ProfileDropdown user={user} />
        </div>

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
              <hr className="my-2 border-slate-100" />

              <ProfileDropdown user={user} />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
