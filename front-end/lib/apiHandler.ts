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
      if (formData) {
        options.body = params as unknown as FormData;
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(params);
      }
    }

    const response = await fetch(url, options);

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

// Types for request options extending standard RequestInit
export interface FetchOptions extends Omit<RequestInit, "body"> {
  baseUrl?: string;
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown> | FormData | unknown;
  tokenCookieName?: string;
}

// Default Base URL from environment variables
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Reusable fetch wrapper for Next.js with TypeScript and Cookie Authorization
 */
export async function apiClient<T = unknown>({
  baseUrl = DEFAULT_BASE_URL,
  endpoint,
  method = "GET",
  params,
  body,
  tokenCookieName = "accessToken",
  headers = {},
  ...customConfig
}: FetchOptions): Promise<T> {
  let token: string | undefined;

  // 1. Retrieve the Access Token from Cookies
  if (typeof window === "undefined") {
    // Server-Side Context (Server Components, Server Actions, Route Handlers)
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(tokenCookieName)?.value;
    } catch {
      // In case cookies() is called outside a server request context
      token = undefined;
    }
  } else {
    // Client-Side Context (Browser)
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${tokenCookieName}=([^;]*)`),
    );
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 2. Build Query Parameters
  let url = `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // 3. Setup Request Headers
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 4. Handle Request Body
  let formattedBody: BodyInit | null = null;
  if (body) {
    if (body instanceof FormData) {
      formattedBody = body;
      // Fetch auto-sets Content-Type for FormData with boundary
    } else {
      formattedBody = JSON.stringify(body);
      requestHeaders["Content-Type"] = "application/json";
    }
  }

  // 5. Execute Next.js Native Fetch
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: formattedBody,
    ...customConfig, // Allows next options (e.g. { next: { revalidate: 60, tags: ['posts'] } })
  });

  // 6. Handle HTTP Errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(
      errorData?.message || `HTTP error! Status: ${response.status}`,
    );
    (error as Error & { status?: number; data?: unknown }).status =
      response.status;
    (error as Error & { status?: number; data?: unknown }).data = errorData;
    throw error;
  }

  // Return empty object for 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
