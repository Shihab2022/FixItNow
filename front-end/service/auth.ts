/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiMethods } from "@/app/constant";
import { apiHandler } from "@/lib/apiHandler";

export const registerUser = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `auth/register`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const loginUser = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `auth/login`,
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};
export const getMe = async () => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `auth/me`,
    method: apiMethods.GET as keyof typeof apiMethods,
    formData: false,
    params: {},
  });
  return res;
};
