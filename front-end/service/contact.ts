/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiMethods } from "@/app/constant";
import { apiHandler } from "@/lib/apiHandler";

/**
 * Sends a "Send us a Direct Message" form submission through the backend
 * contact endpoint, which enqueues an email to the support inbox using
 * the contactMessage EJS template.
 */
export const sendMessage = async (params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const res = await apiHandler({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    path: "contact",
    method: apiMethods.POST as keyof typeof apiMethods,
    formData: false,
    params,
  });
  return res;
};