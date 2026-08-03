import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";
import ApiError from "../../helpars/ApiError";
import { prisma } from "../../lib/prisma";
import { TimeSlot, UpdateAvailabilityPayload } from "../../types";
import httpStatus from "http-status";

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
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId: userId,
    },
  });
  const booking = await prisma.booking.findFirstOrThrow({
    where: {
      id: bookingId,
      technicianId: technician.id,
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
export const GetOverview = async (userId: string) => {
  console.log("Fetching overview for userId:", userId);

  if (!userId) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: Missing user ID",
    );
  }

  // 1. Fetch technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!technician) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found");
  }

  const technicianId = technician.id;

  // 2. Parallel Queries (Fixed Aggregation Query)
  const [
    earningsAggregate,
    completedJobsCount,
    pendingRequestsCount,
    servicesCount,
    recentBookings,
  ] = await Promise.all([
    // FIX: Aggregate earnings directly from Bookings with COMPLETED payment status
    prisma.booking.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        technicianId: technicianId,
        paymentStatus: PaymentStatus.COMPLETED,
      },
    }),

    // Count Completed Jobs
    prisma.booking.count({
      where: {
        technicianId: technicianId,
        status: BookingStatus.COMPLETED,
      },
    }),

    // Count Pending/Requested Bookings
    prisma.booking.count({
      where: {
        technicianId: technicianId,
        status: BookingStatus.REQUESTED,
      },
    }),

    // Count Active Services
    prisma.service.count({
      where: {
        technicianId: technicianId,
        status: true,
      },
    }),

    // Fetch top 5 recent service bookings
    prisma.booking.findMany({
      where: {
        technicianId: technicianId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        scheduledTime: true,
        totalPrice: true,
        customerAddress: true,
        notes: true,
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    }),
  ]);

  // 3. Safe JSON Parsing for Skills
  let skillsCount = 0;
  if (Array.isArray(technician.skills)) {
    skillsCount = technician.skills.length;
  } else if (
    typeof technician.skills === "object" &&
    technician.skills !== null
  ) {
    skillsCount = Object.keys(technician.skills).length;
  }

  // 4. Calculations & Fallbacks
  const totalEarnings = earningsAggregate._sum.totalPrice ?? 0;
  const effectiveCompletedJobs = Math.max(
    completedJobsCount,
    technician.completedJobs ?? 0,
  );
  const estimatedHours = effectiveCompletedJobs * 2;

  // 5. Clean Return Payload
  return {
    stats: {
      totalEarnings: Number(totalEarnings),
      completedJobs: Number(effectiveCompletedJobs),
      pendingRequests: Number(pendingRequestsCount),
      hoursWorked: Number(estimatedHours),
      activeServices: Number(servicesCount),
    },
    technician: {
      id: technician.id,
      name: technician.user?.name || "Technician",
      experienceYears: technician.experience ?? 0,
      skillsCount: skillsCount,
      isAvailable: Boolean(technician.isAvailable),
      status: Boolean(technician.status),
      hourlyRate: technician.hourlyRate ? Number(technician.hourlyRate) : null,
    },
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      serviceTitle: b.service?.title || "Service",
      scheduledDate: b.scheduledDate
        ? b.scheduledDate.toISOString()
        : new Date().toISOString(),
      scheduledTime: b.scheduledTime || "",
      totalPrice: Number(b.totalPrice || 0),
      status: b.status,
      customerName: b.customer?.name || "Customer",
      customerAddress: b.customerAddress || "",
    })),
  };
};

const UpdateTechnicianProfile = async (userId: string, payload: any) => {
  if (!userId) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: Missing user ID",
    );
  }

  const { bio, skills, experience, hourlyRate, isAvailable, status } = payload;

  // 2. Validate technician profile existence
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found");
  }

  // 3. Update Technician Profile (excluding availability updates)
  const updatedProfile = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }), // Accepts string[] array or Json
      ...(experience !== undefined && { experience: Number(experience) }),
      ...(hourlyRate !== undefined && {
        hourlyRate: hourlyRate !== null ? Number(hourlyRate) : null,
      }),
      ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
      ...(status !== undefined && { status: Boolean(status) }),
    },
  });

  return updatedProfile;
};
const getTechnicianProfile = async (userId: string) => {
  if (!userId) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: Missing user ID",
    );
  }

  const techProfile = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId },
    include: {
      user: true,
    },
  });

  return techProfile;
};

export const TechnicianService = {
  UpdateProfile,
  UpdateAvailability,
  GetBookingHistory,
  GetOverview,
  GetAvailability,
  UpdateBookingStatus,
  UpdateTechnicianProfile,
  getTechnicianProfile,
};
