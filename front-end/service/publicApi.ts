/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiMethods } from "@/app/constant";
import { apiHandler } from "@/lib/apiHandler";

export const getAllTechnicians = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `technicians`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
export const getSingleTechnician = async (id: string) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `technicians/${id}`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};

export const getAllCategories = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `categories`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
export const getAllServicesApi = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `services`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
export const getSingleServiceApi = async (id: string) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `services/${id}`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
export const createBookingApi = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `bookings`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params,
  });
  return res;
};
export const getAllBookingsApi = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `bookings`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
export const getSingleBookingApi = async (id: string) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `bookings/${id}`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
