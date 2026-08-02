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
