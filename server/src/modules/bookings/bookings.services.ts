import ApiError from "../../helpars/ApiError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { CreateBookingSchema } from "../validation";
import { Role } from "../../../generated/prisma/browser";
const CreateNewBooking = async (req: any) => {
  const payload = req.body;
  const user = req.user;
  if (user?.role !== Role.CUSTOMER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only customers can create bookings",
    );
  }
  const validatedData = CreateBookingSchema.parse(payload);

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        ...validatedData,
        customerId: user.id,
        status: "REQUESTED",
      },
    });
    // create payment
    const today = new Date();

    const transactionId = `Fix-It-Now-${Date.now()}-${Math.floor(
      Math.random() * 1000000,
    )}`;

    await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        customerId: user.id,
        transactionId,
      },
    });

    return booking;
  });

  return result;
};

const GetUserBookings = async (id: string) => {
  const bookings = await prisma.booking.findMany({
    where: { customerId: id },
    include: {
      service: true,
    },
  });
  return bookings;
};

const GetBookingDetails = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
    },
  });
  return booking;
};

export const BookingsService = {
  CreateNewBooking,
  GetUserBookings,
  GetBookingDetails,
};
