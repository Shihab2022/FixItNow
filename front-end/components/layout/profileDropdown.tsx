/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { USER_PROFILE, DROPDOWN_MENU_ITEMS } from "@/mock/dropdownConfig";
import { logout } from "@/service/auth";

const ProfileDropdown = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer h-12 w-12 rounded-full overflow-hidden border border-slate-200"
      >
        <Image
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
          alt="Avatar"
          fill
          className="object-cover rounded-full"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2  z-50 bg-slate-50 border border-default-medium rounded-2xl shadow-lg w-72">
          <div className="p-2">
            <div className="flex items-center px-2.5 p-2 space-x-1.5 text-sm bg-neutral-secondary-strong rounded">
              <Image
                className="w-8 h-8 rounded-full"
                src={USER_PROFILE.avatarUrl}
                alt={user.name}
                width={32}
                height={32}
              />
              <div className="text-sm">
                <div className="font-medium text-heading">{user.name}</div>
                <div className="truncate text-body">
                  {user.email.slice(0, 15)}...
                </div>
              </div>
              <span className="bg-brand-softer border border-brand-subtle text-fg-brand-strong text-xs font-medium px-1.5 py-0.5 rounded ms-auto">
                {user.role}
              </span>
            </div>
          </div>

          <ul className="px-2 pb-2 text-sm text-body font-medium">
            {DROPDOWN_MENU_ITEMS.map((item) => {
              const IconComponent = item.icon;

              return (
                <li
                  key={item.id}
                  className={`${
                    item.hasDividerTop
                      ? "border-t border-default-medium pt-1.5 mt-1.5"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-between w-full p-2 rounded hover:bg-neutral-tertiary-medium ${
                      item.isDanger
                        ? "text-fg-danger"
                        : "hover:text-heading text-body"
                    }`}
                  >
                    <Link
                      href={item.path}
                      className="inline-flex items-center w-full"
                      onClick={() => {
                        if (item.id === "signout") {
                          logout();
                        }

                        setIsOpen(false);
                      }}
                    >
                      <IconComponent className="w-4 h-4 me-1.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                    {item.hasToggle && (
                      <label className="inline-flex items-center cursor-pointer ms-auto">
                        <input
                          type="checkbox"
                          checked={isDarkMode}
                          onChange={() => setIsDarkMode((prev) => !prev)}
                          className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-neutral-quaternary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                        <span className="sr-only">Toggle dark mode</span>
                      </label>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
