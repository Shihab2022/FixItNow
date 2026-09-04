/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconType } from "react-icons";
import {
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiSettings,
  FiBriefcase,
  FiMapPin,
} from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { TbBrandBooking } from "react-icons/tb";
import { MdCoPresent } from "react-icons/md";
import { useEffect } from "react";

interface SidebarProps {
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}

interface NavItem {
  name: string;
  href: string;
  icon: IconType;
  absolute?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navMap: Record<"CUSTOMER" | "TECHNICIAN" | "ADMIN", NavItem[]> = {
    CUSTOMER: [
      { name: "Map", href: "/map", icon: FiMapPin, absolute: true },
      { name: "Profile", href: "/", icon: CgProfile },
      // { name: "Overview", href: "/customer", icon: FiHome },
      { name: "Bookings", href: "/customer/bookings", icon: FiCalendar },
      {
        name: "Payment History",
        href: "/customer/payments/history",
        icon: FiDollarSign,
      },
    ],
    TECHNICIAN: [
      { name: "Map", href: "/map", icon: FiMapPin, absolute: true },
      { name: "Profile", href: "/", icon: CgProfile },
      {
        name: "Technician Profile",
        href: "/technician/profile",
        icon: CgProfile,
      },
      { name: "Dashboard", href: "/technician", icon: FiHome },
      {
        name: "Availability",
        href: "/technician/availability",
        icon: MdCoPresent,
      },
      { name: "Bookings", href: "/technician/bookings", icon: TbBrandBooking },
      // { name: "Calendar", href: "/technician/calendar", icon: FiCalendar },
      { name: "Services", href: "/technician/services", icon: FiBriefcase },
      // { name: "Earnings", href: "/technician/earnings", icon: FiDollarSign },
    ],
    ADMIN: [
      { name: "Profile", href: "/", icon: CgProfile },
      { name: "Overview", href: "/admin", icon: FiHome },
      { name: "Bookings", href: "/admin/bookings", icon: TbBrandBooking },
      { name: "Technicians", href: "/admin/technicians", icon: FiUser },
      { name: "Users", href: "/admin/users", icon: FiUser },
      { name: "Categories", href: "/admin/categories", icon: FiSettings },
    ],
  };

  const rolePrefixes = {
    CUSTOMER: "/dashboard/customer",
    TECHNICIAN: "/dashboard/technician",
    ADMIN: "/dashboard/admin",
  };

  useEffect(() => {
    // No role
    if (!role) {
      router.replace("/login");
      return;
    }

    const allowedPrefix = rolePrefixes[role];

    // Allow profile page
    if (pathname === "/dashboard") return;

    // Block access to other dashboard routes
    if (pathname.startsWith("/dashboard/customer") && role !== "CUSTOMER") {
      router.replace("/login");
      return;
    }

    if (pathname.startsWith("/dashboard/technician") && role !== "TECHNICIAN") {
      router.replace("/login");
      return;
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      router.replace("/login");
      return;
    }

    // If the path is under dashboard but doesn't belong to the user's role
    if (
      pathname.startsWith("/dashboard") &&
      pathname !== "/dashboard" &&
      !pathname.startsWith(allowedPrefix)
    ) {
      router.replace("/login");
    }
  }, [pathname, role, router]);
  const navItems = navMap[role] || [];
  return (
    <aside className="w-64  min-h-screen p-4 flex flex-col justify-between border-r border-slate-800 text-slate-300">
      <div className="space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const href = item.absolute ? item.href : `/dashboard${item.href}`;
            const isActive = pathname === href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
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
