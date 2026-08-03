/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiMethods } from "@/app/constant";
import { apiHandler } from "@/lib/apiHandler";

export const updateSlot = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `technician/availability`,
    method: apiMethods.PUT as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const getSlot = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `technician/availability`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const getServices = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `services`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const getTechnicianServices = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `services/technician`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const createService = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `services`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
