// import { Navbar } from "@/components/shared/navbar";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import { getMe } from "@/service/getMe";
// import DashboardSidebar from "./_components/DashboardSidebar";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/layout/header";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  //   const user = await getMe();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar role="customer" />
        <main className="flex-1 min-w-0 p-20">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
