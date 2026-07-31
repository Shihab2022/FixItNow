import CDashboard from "@/components/dashboard/customer/CDashboard";
import { getMe } from "@/service/auth";
import { redirect } from "next/navigation";
export default async function CustomerDashboardPage() {
  const res = await getMe();
  if (res?.data?.data?.role !== "CUSTOMER") {
    redirect("/login");
  }
  return (
    <>
      <CDashboard />
    </>
  );
}
