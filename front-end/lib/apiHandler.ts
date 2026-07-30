/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { apiMethods } from "@/app/constant";
import { cookies } from "next/headers";

// import { SOMETHING_WENT_WRONG } from "constants/messages";
const SOMETHING_WENT_WRONG = "Something went wrong. Please try again later.";
export interface ApiHandlerOptions<TParams = Record<string, any>> {
  baseURL?: string;
  path: string;
  method?: keyof typeof apiMethods;
  params?: TParams;
  formData?: boolean;
}

export interface ApiResponse<TData = any, TParams = Record<string, any>> {
  data?: TData;
  success: boolean;
  error?: any;
  status?: number;
  message?: string;
  params?: TParams;
}

export const apiHandler = async <
  TData = any,
  TParams extends Record<string, any> = Record<string, any>,
>({
  baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT,
  path,
  method = "GET",
  params = {} as TParams,
  formData = false,
}: ApiHandlerOptions<TParams>): Promise<ApiResponse<TData, TParams>> => {
  try {
    let url = `${baseURL}${path}`;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["Cookie"] = `accessToken=${token}`;
    }

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    const isGetMethod = options.method === "GET";

    if (isGetMethod) {
      // Append query params to URL for GET requests
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += `${url.includes("?") ? "&" : "?"}${queryString}`;
      }
    } else {
      // Body payload for POST, PUT, PATCH, DELETE
      if (formData) {
        // Fetch sets the correct boundary automatically when body is FormData
        options.body = params as unknown as FormData;
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(params);
      }
    }

    const response = await fetch(url, options);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return {
        status: 401,
        success: false,
        message: "Unauthorized",
        params,
      };
    }

    const resData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        status: response.status,
        message: resData?.message || SOMETHING_WENT_WRONG,
        success: false,
        params,
      };
    }

    return {
      data: resData,
      success: resData?.success !== false,
      error: resData?.error,
      params,
    };
  } catch (err: any) {
    console.error("API Call Error:", err);
    return {
      status: 500,
      message: err?.message || SOMETHING_WENT_WRONG,
      success: false,
      params,
    };
  }
};
