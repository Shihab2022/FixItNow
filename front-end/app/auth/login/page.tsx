"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser } from "@/service/auth";
import { redirect } from "next/navigation";
import { toastTypes } from "@/app/constant";
import { showToast } from "@/components/toast/toast";
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const res = await loginUser(data);
    if (res?.data?.success) {
      const accessToken = res.data.data.accessToken;
      localStorage.setItem("accessToken", accessToken);
      showToast(toastTypes.SUCCESS, "Login successful!");
      redirect("/dashboard");
    } else {
      showToast(
        toastTypes.FAILED,
        res?.message || "Something went wrong. Please try again later.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-2xl font-black text-slate-900"
          >
            FixIt<span className="text-blue-600">Now</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Welcome back</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          {`Don't have an account?`}{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
