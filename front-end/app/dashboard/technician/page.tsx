import DashboardPage from "@/components/dashboard/technician/TDashboard";
import { getMe } from "@/service/auth";
import { redirect } from "next/navigation";
export default async function TechnicianDashboardOverview() {
  const res = await getMe();
  if (res?.data?.data?.role !== "TECHNICIAN") {
    redirect("/login");
  }
  return (
    <>
      <DashboardPage />
    </>
  );
}
