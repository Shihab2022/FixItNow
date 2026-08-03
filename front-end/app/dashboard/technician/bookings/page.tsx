import BookingsPage from "@/components/dashboard/technician/Bookings";
import { getTechnicianBookings } from "@/service/technician";

export default async function AdminCategoriesPage() {
  const res = await getTechnicianBookings({});
  return (
    <>
      <BookingsPage bookingsData={res.data.data || []} />
    </>
  );
}
