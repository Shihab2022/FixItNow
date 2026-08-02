import { CreateBookingForm } from "@/components/booking/bookingPage";
import { getMe } from "@/service/auth";
import { getSingleServiceApi } from "@/service/publicApi";
import { redirect } from "next/navigation";
type Params = Promise<{ id: string }>;
const Booking = async ({ params }: { params: Params }) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  if (!id) {
    return <div>Service ID is missing</div>;
  }
  const user = await getMe();
  if (!user?.data?.data) {
    redirect("/login");
  }
  const res = await getSingleServiceApi(id as string);
  return (
    <>
      <CreateBookingForm response={res.data.data} />
    </>
  );
};

export default Booking;
