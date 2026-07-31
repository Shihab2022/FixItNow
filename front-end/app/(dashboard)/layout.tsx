import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/layout/header";
import { getMe } from "@/service/auth";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getMe();
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user?.data?.data || {}} />
      <div className="flex flex-1">
        <Sidebar role={user?.data?.data?.role || "customer"} />
        <main className="flex-1 min-w-0 p-20">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
