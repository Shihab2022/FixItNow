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
  // const validatedData = CreateBookingSchema.parse(payload);
  console.log("Booking Payload:", payload);
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        ...payload,
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
    where: {
      customerId: id,
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          location: true,
          status: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

          technician: {
            select: {
              id: true,
              experience: true,
              isAvailable: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return bookings;
};

const GetBookingDetails = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          location: true,
          status: true,
          technicianId: true,
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
            },
          },
          technician: {
            select: {
              id: true,
              experience: true,
              isAvailable: true,
              bio: true,
              skills: true,
              hourlyRate: true,
              completedJobs: true,
              availability: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  address: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return booking;
};

export const BookingsService = {
  CreateNewBooking,
  GetUserBookings,
  GetBookingDetails,
};
