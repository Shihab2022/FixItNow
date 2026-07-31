"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiSettings,
  FiBriefcase,
} from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

interface SidebarProps {
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();

  const navMap = {
    CUSTOMER: [
      { name: "Profile", href: "/", icon: CgProfile },
      { name: "Overview", href: "/customer", icon: FiHome },
      { name: "Bookings", href: "/customer/bookings", icon: FiCalendar },
      {
        name: "Payment History",
        href: "/customer/payments/history",
        icon: FiDollarSign,
      },
    ],
    TECHNICIAN: [
      { name: "Profile", href: "/", icon: CgProfile },
      { name: "Dashboard", href: "/technician", icon: FiHome },
      { name: "Schedule", href: "/technician/calendar", icon: FiCalendar },
      { name: "Services", href: "/technician/services", icon: FiBriefcase },
      { name: "Earnings", href: "/technician/earnings", icon: FiDollarSign },
    ],
    ADMIN: [
      { name: "Profile", href: "/", icon: CgProfile },
      { name: "Overview", href: "/admin", icon: FiHome },
      { name: "Technicians", href: "/admin/technicians", icon: FiUser },
      { name: "Categories", href: "/admin/categories", icon: FiSettings },
    ],
  };

  const navItems = navMap[role] || [];
  return (
    <aside className="w-64  min-h-screen p-4 flex flex-col justify-between border-r border-slate-800 text-slate-300">
      <div className="space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === `/dashboard${item.href}`;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/dashboard${item.href}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="text-lg" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-2 border-t border-slate-800 text-xs text-slate-500">
        © 2026 FixItNow Inc.
      </div>
    </aside>
  );
};
