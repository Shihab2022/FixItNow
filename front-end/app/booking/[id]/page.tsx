import { CreateBookingForm } from "@/components/booking/bookingPage";
import { getSingleServiceApi } from "@/service/publicApi";
type Params = Promise<{ id: string }>;
const Booking = async ({ params }: { params: Params }) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  if (!id) {
    return <div>Service ID is missing</div>;
  }
  const res = await getSingleServiceApi(id as string);
  return (
    <>
      <CreateBookingForm response={res.data.data} />
    </>
  );
};

export default Booking;
