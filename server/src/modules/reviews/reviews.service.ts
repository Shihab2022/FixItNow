import { BookingStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import ApiError from "../../helpars/ApiError";
import httpStatus from "http-status";
interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment: string;
  customerId: string; // Logged-in user ID
}
const CreateReview = async (payload: CreateReviewPayload) => {
  const { bookingId, rating, comment, customerId } = payload;
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      customerId: true,
      technicianId: true,
      status: true,
    },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found.");
  }
  // Ensure booking belongs to customer
  if (booking.customerId !== customerId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to review this booking.",
    );
  }

  // Ensure booking is completed
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can review only completed bookings.",
    );
  }
  // Resolve the technician's USER id (Review.technician references the users table,
  // while booking.technicianId is the TechnicianProfile id)
  const techProfile = await prisma.technicianProfile.findUnique({
    where: { id: booking.technicianId },
    select: { userId: true },
  });
  if (!techProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }

  const review = await prisma.review.upsert({
    where: {
      bookingId,
    },
    update: {
      rating,
      comment,
    },
    create: {
      rating,
      comment,
      technicianId: techProfile.userId,
      customerId: booking.customerId,
      bookingId: booking.id,
    },
  });

  return review;
};

export const ReviewsService = {
  CreateReview,
};
