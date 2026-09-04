/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiMethods } from "@/app/constant";
import { apiHandler } from "@/lib/apiHandler";

export const getMapTechnicians = async (params: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  categoryId?: string;
  q?: string;
}) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `map/technicians`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params,
  });
  return res;
};

export const getMapTasks = async (params: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  categoryId?: string;
}) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `map/tasks`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params,
  });
  return res;
};

export const saveUserLocation = async (params: {
  latitude: number;
  longitude: number;
}) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `auth/me`,
    method: apiMethods.PUT as keyof typeof apiMethods,
    formData: false,
    params,
  });
  return res;
};

export const createJobRequest = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `job-requests`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params,
  });
  return res;
};

export const getJobRequests = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `job-requests`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params,
  });
  return res;
};

export const getJobRequestById = async (id: string) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `job-requests/${id}`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};

export const applyToJobRequest = async (id: string, message?: string) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `job-requests/${id}/applications`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params: { message },
  });
  return res;
};

export const getJobRequestApplications = async (id: string) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `job-requests/${id}/applications`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};

export const acceptJobRequestApplication = async (
  id: string,
  applicationId: string,
) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `job-requests/${id}/applications/${applicationId}/accept`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};

export const getMyApplications = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `job-requests/technician/applications`,
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