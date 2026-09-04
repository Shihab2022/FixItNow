import { DashboardHeader } from "@/components/dashboard/navbar";
import { getMe } from "@/service/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const MapLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getMe();
  if (!user?.data?.data) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={user?.data?.data || {}} />
      <main className="flex-1 mt-20">{children}</main>
    </div>
  );
};

export default MapLayout;