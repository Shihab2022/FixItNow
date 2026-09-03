import ApiError from "../../helpars/ApiError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { BookingStatus, Role } from "../../../generated/prisma/browser";
import {
  BookingPayload,
  NotificationService,
} from "../../services/notification.service";

/** Statuses that occupy a time slot and should block re-booking */
const ACTIVE_BOOKING_STATUSES = [
  BookingStatus.REQUESTED,
  BookingStatus.ACCEPTED,
  BookingStatus.PAID,
  BookingStatus.IN_PROGRESS,
];

/** Converts "23:15" -> "11:15 PM" (same format used by the frontend) */
const formatTo12Hr = (time24: string): string => {
  const [hRaw, mRaw] = time24.split(":");
  const h = Number(hRaw ?? 0);
  const m = Number(mRaw ?? 0);
  const period = h >= 12 ? "PM" : "AM";
  const adjustedHours = h % 12 || 12;
  return `${adjustedHours.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")} ${period}`;
};

/** Converts { start: "10:00", end: "12:00" } -> "10:00 AM - 12:00 PM" */
const formatSlotRange = (slot: { start: string; end: string }): string =>
  `${formatTo12Hr(slot.start)} - ${formatTo12Hr(slot.end)}`;

const toDateKey = (value: Date | string): string =>
  new Date(value).toISOString().split("T")[0] || "";

/** Wraps email dispatch so a broken SMTP/queue never blocks the core booking/payment flow */
const safeNotify = async (action: () => Promise<void>): Promise<void> => {
  try {
    await action();
  } catch (err) {
    console.error("[Notification] Email could not be sent:", err);
  }
};

const CreateNewBooking = async (req: any) => {
  const payload = req.body;
  const user = req.user;
  if (user?.role !== Role.CUSTOMER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only customers can create bookings",
    );
  }

  // 1. Validate service belongs to the selected technician
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
    select: { id: true, technicianId: true, price: true },
  });
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }
  if (payload.technicianId !== service.technicianId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Selected technician does not offer this service.",
    );
  }

  // 2. Prevent double-booking: the same technician + date + time range must be unique
  if (!payload.scheduledDate || !payload.scheduledTime) {
    throw new ApiError(httpStatus.BAD_REQUEST, "scheduledDateand scheduledTime are required.");
  }
  const scheduledInstant = new Date(payload.scheduledDate);
  if (isNaN(scheduledInstant.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid scheduledDate.");
  }
  const dateKey = toDateKey(scheduledInstant);
  const conflict = await prisma.booking.findFirst({
    where: {
      technicianId: service.technicianId,
      scheduledDate: scheduledInstant,
      scheduledTime: payload.scheduledTime,
      status: { in: ACTIVE_BOOKING_STATUSES },
    },
    select: { id: true },
  });
  if (conflict) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Slot ${payload.scheduledTime} on ${dateKey} is already booked. Please choose another time slot.`,
    );
  }

  // 3. Create booking + pending payment inside a transaction
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        ...payload,
        customerId: user.id,
        status: "REQUESTED",
        totalPrice: service.price, // server-side price (ignore client-supplied price)
      },
    });

    const transactionId = `Fix-It-Now-${Date.now()}-${Math.floor(
      Math.random() * 1000000,
    )}`;

    await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: service.price,
        customerId: user.id,
        transactionId,
      },
    });

    return booking;
  });

  // 4. Notify customer + technician about the new booking (never fail the request on email errors)
  await safeNotify(async () => {
    const notifyBooking = await loadBookingForNotification(result.id);
    if (notifyBooking) {
      await NotificationService.sendBookingCreated(notifyBooking);
    }
  });

  return result;
};

async function loadBookingForNotification(bookingId: string): Promise<BookingPayload | null> {
  return (await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      scheduledDate: true,
      scheduledTime: true,
      customerAddress: true,
      totalPrice: true,
      customer: { select: { email: true, name: true } },
      service: { select: { title: true } },
      technician: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  })) as unknown as BookingPayload | null;
}
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
/**
 * Returns the time slots a technician has set for the given date,
 * excluding slots that are already booked by active bookings.
 */
const GetTechnicianAvailability = async (technicianId: string, date: string) => {
  if (!technicianId || !date) {
    throw new ApiError(httpStatus.BAD_REQUEST, "technicianIdand date are required.");
  }
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dateObj = new Date(`${date}T00:00:00.000Z`);
  if (isNaN(dateObj.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date. Use YYYY-MM-DD format.");
  }
  const dayKey = dayNames[dateObj.getUTCDay()] ?? "";

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    select: { availability: true, isAvailable: true },
  });
  if (!tech) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician not found.");
  }
  if (!tech.isAvailable) {
    return [];
  }

  const availability =
    (tech.availability as unknown as Record<string, { start: string; end: string }[]>) || {};
  const daySlots: { start: string; end: string }[] = availability[dayKey] || [];

  // Slots already taken by active bookings on that date
  // (frontend sends UTC-midnight ISO dates, so parse the same way)
  const scheduledInstant = new Date(`${date}T00:00:00.000Z`);
  const booked = await prisma.booking.findMany({
    where: {
      technicianId,
      scheduledDate: scheduledInstant,
      status: { in: ACTIVE_BOOKING_STATUSES },
    },
    select: { scheduledTime: true },
  });

  const bookedTimeRanges = new Set(booked.map((b) => b.scheduledTime));

  return daySlots.filter((slot) => {
    const rangeStr = formatSlotRange(slot);
    return !bookedTimeRanges.has(rangeStr);
  });
};

export const BookingsService = {
  CreateNewBooking,
  GetUserBookings,
  GetBookingDetails,
  GetTechnicianAvailability,
};
