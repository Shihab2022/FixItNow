/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { getAllUsers, updateUsersStatus } from "@/service/admin";
import React, { useEffect, useState } from "react";
import {
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiBriefcase,
  FiUser,
} from "react-icons/fi";

// Types derived from your Prisma schema
export type Role = "ADMIN" | "TECHNICIAN" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "BANNED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export const UserTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const toggleDropdown = (id: string): void => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };
  const getUser = async () => {
    const res = await getAllUsers();
    if (res?.data?.success) {
      setUsers(res.data.data);
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  const getRoleBadge = (role: Role): React.ReactNode => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <FiShield className="w-3.5 h-3.5" />
            Admin
          </span>
        );
      case "TECHNICIAN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <FiBriefcase className="w-3.5 h-3.5" />
            Technician
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <FiUser className="w-3.5 h-3.5" />
            Customer
          </span>
        );
    }
  };

  const getStatusBadge = (u: User): React.ReactNode => {
    return u.status === "ACTIVE" ? (
      <span
        onClick={async () => {
          const res = await updateUsersStatus({
            id: u.id,
            status: "BANNED",
          });
          if (res?.data?.success) {
            getUser();
          }
        }}
        className="inline-flex cursor-pointer items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Active
      </span>
    ) : (
      <span
        onClick={async () => {
          const res = await updateUsersStatus({
            id: u.id,
            status: "ACTIVE",
          });
          if (res?.data?.success) {
            getUser();
          }
        }}
        className="inline-flex cursor-pointer items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
        Banned
      </span>
    );
  };

  // Safe search filtering
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Search Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Users Overview
          </h2>
          <p className="text-sm text-slate-500">
            Manage user accounts, roles, and verification statuses.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                User
              </th>
              <th scope="col" className="px-6 py-3.5">
                Phone
              </th>
              <th scope="col" className="px-6 py-3.5">
                Role
              </th>
              <th scope="col" className="px-6 py-3.5">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5">
                Verification
              </th>
              <th scope="col" className="px-6 py-3.5">
                Created At
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {/* User Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-600 text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user)}
                </td>

                {/* Email Verified */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <FiXCircle className="w-4 h-4 text-amber-500" />
                      Unverified
                    </span>
                  )}
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                {/* Actions Dropdown */}
                <td className="px-6 py-4 whitespace-nowrap text-right relative">
                  <button
                    onClick={() => toggleDropdown(user.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <FiMoreVertical className="w-5 h-5" />
                  </button>

                  {openDropdownId === user.id && (
                    <div className="absolute right-6 top-12 z-10 w-44 bg-white rounded-lg border border-slate-200 shadow-lg py-1 text-left text-sm">
                      <button
                        onClick={() => setOpenDropdownId(null)}
                        className="w-full px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FiEdit2 className="w-4 h-4 text-slate-400" />
                        Edit User
                      </button>
                      <button
                        onClick={() => setOpenDropdownId(null)}
                        className="w-full px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FiUserCheck className="w-4 h-4 text-slate-400" />
                        Change Role
                      </button>
                      <div className="my-1 border-t border-slate-100"></div>
                      <button
                        onClick={() => setOpenDropdownId(null)}
                        className="w-full px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <FiTrash2 className="w-4 h-4 text-rose-500" />
                        Delete User
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">1</span> to{" "}
          <span className="font-medium text-slate-700">
            {filteredUsers.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {filteredUsers.length}
          </span>{" "}
          entries
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
