import { DashboardHeader } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getMe } from "@/service/auth";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getMe();
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={user?.data?.data || {}} />
      <div className="flex flex-1 mt-20">
        <Sidebar role={user?.data?.data?.role || "customer"} />
        <main className="flex-1 min-w-0 p-20">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
