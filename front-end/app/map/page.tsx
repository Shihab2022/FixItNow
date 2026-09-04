import { getMe } from "@/service/auth";
import MapView from "@/components/map/MapView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const user = await getMe();
  if (!user?.data?.data) {
    redirect("/login");
  }
  return <MapView user={user.data.data} />;
}