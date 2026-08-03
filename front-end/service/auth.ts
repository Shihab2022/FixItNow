/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiMethods } from "@/app/constant";
import { apiHandler } from "@/lib/apiHandler";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

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
export const forgetPassword = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `auth/forget-password`,
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
  if (res?.data?.success) {
    const accessToken = res?.data?.data?.accessToken;
    const refreshToken = res?.data?.data?.refreshToken;
    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return res;
  }
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
export const updateMe = async (params: any) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: `auth/me`,
    method: apiMethods.PUT as keyof typeof apiMethods,
    formData: false,
    params: params,
  });
  return res;
};

export const logout = async () => {
  const cookieStore = await cookies();

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  revalidateTag("my-profile", "max");
  // redirect("/login");
};
