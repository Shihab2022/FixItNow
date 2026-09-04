/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiHandler } from "@/lib/apiHandler";
import { apiMethods } from "@/app/constant";

/** Uploads a single image file (form field name: "image") to Cloudinary via backend */
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: "uploads/image",
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: true,
    params: formData as any,
  });
  return res;
};