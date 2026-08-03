// import CDashboard from "@/components/dashboard/customer/CDashboard";
// import { getMe } from "@/service/auth";
// import { redirect } from "next/navigation";
// import { Suspense } from "react";
// export default async function CustomerDashboardPage() {
//   const res = await getMe();
//   if (res?.data?.data?.role !== "CUSTOMER") {
//     redirect("/login");
//   }
//   return (
//     <>
//       <Suspense fallback={<div>Loading bookings...</div>}>
//         <CDashboard />
//       </Suspense>
//     </>
//   );
// }

import CDashboard from "@/components/dashboard/customer/CDashboard";
import { getMe } from "@/service/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// 💡 FIX 1: Add this export to stop Next.js from pre-rendering this page statically during build
export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const res = await getMe();

  // If unauthorized or not a customer, redirect to login
  if (!res.success || res?.data?.data?.role !== "CUSTOMER") {
    redirect("/login");
  }

  return (
    <>
      <Suspense fallback={<div>Loading bookings...</div>}>
        <CDashboard />
      </Suspense>
    </>
  );
}