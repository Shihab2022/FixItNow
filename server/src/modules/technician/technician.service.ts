import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { TimeSlot, UpdateAvailabilityPayload } from "../../types";

const UpdateProfile = async (id: string, payload: any) => {
  const updateData = Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => value !== undefined),
  );

  const result = await prisma.technicianProfile.update({
    where: {
      userId: id,
    },
    data: updateData,
  });

  return result;
};

const UpdateAvailability = async (
  userId: string,
  payload: UpdateAvailabilityPayload,
) => {
  const { day, slots } = payload;

  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId },
    select: {
      id: true,
      availability: true,
    },
  });

  // Existing availability or empty object
  const availability =
    (technician.availability as unknown as Record<string, TimeSlot[]>) || {};

  availability[day] = slots;

  const result = await prisma.technicianProfile.update({
    where: {
      userId,
    },
    data: {
      availability: availability as any,
    },
  });

  return result;
};

const GetBookingHistory = async (userId: string) => {
  const tech = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });
  const bookings = await prisma.booking.findMany({
    where: {
      technicianId: tech.id,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          price: true,
          description: true,
          location: true,
          status: true,
        },
      },
    },
    orderBy: {
      scheduledDate: "asc",
    },
  });

  return bookings;
};
const GetAvailability = async (userId: string) => {
  const bookings = await prisma.technicianProfile.findUnique({
    where: {
      userId: userId,
    },
  });

  return bookings?.availability;
};
const UpdateBookingStatus = async (
  userId: string,
  bookingId: string,
  status: BookingStatus,
) => {
  const booking = await prisma.booking.findFirstOrThrow({
    where: {
      id: bookingId,
      technicianId: userId,
    },
  });

  const result = await prisma.booking.update({
    where: {
      id: booking.id,
    },
    data: {
      status,
    },
  });

  return result;
};

export const TechnicianService = {
  UpdateProfile,
  UpdateAvailability,
  GetBookingHistory,
  GetAvailability,
  UpdateBookingStatus,
};
