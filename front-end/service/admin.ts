/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiMethods } from "@/app/constant";
import { apiHandler } from "@/lib/apiHandler";

export const createCategory = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `admin/categories`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const updateCategory = async (id: string, params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `admin/categories/${id}`,
    method: apiMethods.PUT as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const updateCategoryStatus = async (id: string, params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `admin/update/category/${id}`,
    method: apiMethods.PUT as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const getCategory = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `admin/categories`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
export const getAllUsers = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `admin/users`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
export const updateUsersStatus = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `admin/users/${params.id}`,
    method: apiMethods.PATCH as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
