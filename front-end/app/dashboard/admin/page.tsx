import OverviewPage from "@/components/dashboard/admin/OverviewPage";
import { getMe } from "@/service/auth";
import { redirect } from "next/navigation";
const AdminOverviewPage = async () => {
  const res = await getMe();
  if (res?.data?.data?.role !== "ADMIN") {
    redirect("/login");
  }
  return (
    <>
      <OverviewPage />
    </>
  );
};

export default AdminOverviewPage;
