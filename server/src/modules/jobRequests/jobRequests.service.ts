import { prisma } from "../../lib/prisma";
import ApiError from "../../helpars/ApiError";
import httpStatus from "http-status";
import { IAuthUser } from "../../types";
import { NotificationService } from "../../services/notification.service";
import {
  Role,
  JobRequestStatus,
  JobRequestApplicationStatus,
} from "../../../generated/prisma/enums";

const createJobRequest = async (authUser: NonNullable<IAuthUser>, payload: any) => {
  const {
    title,
    description,
    budget,
    address,
    latitude,
    longitude,
    categoryId,
  } = payload;

  if (
    !title ||
    !description ||
    !address ||
    latitude === undefined ||
    longitude === undefined ||
    !categoryId
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "title, description, address, latitude, longitude and categoryId are required",
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid latitude/longitude");
  }

  return prisma.jobRequest.create({
    data: {
      title: String(title),
      description: String(description),
      budget: budget === undefined || budget === null || budget === "" ? null : Number(budget),
      address: String(address),
      latitude: lat,
      longitude: lng,
      categoryId: String(categoryId),
      customerId: authUser.id,
    },
    include: { category: true },
  });
};
const listJobRequests = async (authUser: NonNullable<IAuthUser>, query: any) => {
  const { mine, categoryId, status } = query;
  const where: any = {};

  if (mine === "true" || mine === "1") {
    where.customerId = authUser.id;
  } else if (status && status !== "ALL" && status !== "all") {
    where.status = status;
  } else {
    where.status = "OPEN";
  }

  if (categoryId) where.categoryId = categoryId;

  return prisma.jobRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      customer: {
        select: { id: true, name: true, address: true, phone: true },
      },
      _count: { select: { applications: true } },
    },
  });
};

const getJobRequestById = async (jobRequestId: string) => {
  const job = await prisma.jobRequest.findUnique({
    where: { id: jobRequestId },
    include: {
      category: { select: { id: true, name: true } },
      customer: {
        select: { id: true, name: true, address: true, phone: true, imageUrl: true },
      },
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  return job;
};
const applyToJobRequest = async (
  authUser: NonNullable<IAuthUser>,
  jobRequestId: string,
  message?: string,
) => {
  const tech = await prisma.technicianProfile.findUnique({
    where: { userId: authUser.id },
  });
  if (!tech) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Technician profile not found. Please complete your profile first.",
    );
  }

  const job = await prisma.jobRequest.findUnique({
    where: { id: jobRequestId },
    include: {
      category: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
  });
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  if (job.status !== JobRequestStatus.OPEN) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This task is no longer accepting applications",
    );
  }
  if (job.customerId === authUser.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You cannot apply to your own task",
    );
  }

  const existing = await prisma.jobRequestApplication.findUnique({
    where: {
      jobRequestId_technicianId: {
        jobRequestId,
        technicianId: tech.id,
      },
    },
  });
  if (existing) {
    return existing;
  }

  const application = await prisma.jobRequestApplication.create({
    data: {
      jobRequestId,
      technicianId: tech.id,
      message: message?.trim() || null,
    },
  });

  const rating = await computeTechnicianRating(tech.userId);

  try {
    await NotificationService.sendJobRequestApplicationApplied({
      customer: job.customer,
      jobRequest: {
        id: job.id,
        title: job.title,
        category: job.category,
      },
      technician: {
        profileId: tech.id,
        name: authUser.name,
        skills: Array.isArray(tech.skills)
          ? (tech.skills as unknown as string[]).filter(
              (s): s is string => typeof s === "string",
            )
          : [],
        experience: tech.experience,
        hourlyRate: tech.hourlyRate,
        rating,
        message: message || null,
      },
    });
  } catch (emailErr) {
    console.error("[JobRequest] Application email could not be sent:", emailErr);
  }

  return application;
};

const computeTechnicianRating = async (userId: string): Promise<number> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { technicianId: userId },
      select: { rating: true },
    });
    if (!reviews.length) return 5;
    return Number(
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    );
  } catch {
    return 5;
  }
};
const getJobRequestApplications = async (
  authUser: NonNullable<IAuthUser>,
  jobRequestId: string,
) => {
  const job = await prisma.jobRequest.findUnique({
    where: { id: jobRequestId },
    select: { id: true, customerId: true },
  });
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  const where: any = { jobRequestId };

  if (authUser.role === Role.CUSTOMER) {
    if (job.customerId !== authUser.id) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Only the task owner can view applications",
      );
    }
  } else if (authUser.role === Role.TECHNICIAN) {
    const tech = await prisma.technicianProfile.findUnique({
      where: { userId: authUser.id },
    });
    if (!tech) {
      throw new ApiError(httpStatus.FORBIDDEN, "Technician profile not found");
    }
    where.technicianId = tech.id;
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  return prisma.jobRequestApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              imageUrl: true,
            },
          },
          services: {
            select: { category: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
};

const acceptApplication = async (
  authUser: NonNullable<IAuthUser>,
  jobRequestId: string,
  applicationId: string,
) => {
  const job = await prisma.jobRequest.findUnique({
    where: { id: jobRequestId },
    select: { id: true, customerId: true, title: true },
  });
  if (!job || job.customerId !== authUser.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only the task owner can accept applications",
    );
  }

  const app = await prisma.jobRequestApplication.findUnique({
    where: { id: applicationId },
    include: {
      technician: { include: { user: { select: { email: true, name: true } } } },
    },
  });
  if (!app || app.jobRequestId !== jobRequestId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }
  if (app.status !== JobRequestApplicationStatus.PENDING) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This application has already been processed",
    );
  }

  await prisma.$transaction([
    prisma.jobRequestApplication.update({
      where: { id: app.id },
      data: { status: JobRequestApplicationStatus.ACCEPTED },
    }),
    prisma.jobRequestApplication.updateMany({
      where: {
        jobRequestId,
        id: { not: app.id },
        status: JobRequestApplicationStatus.PENDING,
      },
      data: { status: JobRequestApplicationStatus.DECLINED },
    }),
    prisma.jobRequest.update({
      where: { id: jobRequestId },
      data: { status: JobRequestStatus.BOOKED },
    }),
  ]);

  try {
    await NotificationService.sendJobRequestApplicationAccepted({
      technician: {
        email: app.technician.user.email,
        name: app.technician.user.name,
      },
      jobRequest: { id: jobRequestId, title: job.title },
    });
  } catch (emailErr) {
    console.error("[JobRequest] Acceptance email could not be sent:", emailErr);
  }

  return app;
};

const getMyApplications = async (authUser: NonNullable<IAuthUser>) => {
  const tech = await prisma.technicianProfile.findUnique({
    where: { userId: authUser.id },
  });
  if (!tech) {
    throw new ApiError(httpStatus.FORBIDDEN, "Technician profile not found");
  }

  return prisma.jobRequestApplication.findMany({
    where: { technicianId: tech.id },
    orderBy: { createdAt: "desc" },
    include: {
      jobRequest: {
        include: {
          category: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, phone: true } },
        },
      },
    },
  });
};

export const JobRequestServices = {
  createJobRequest,
  listJobRequests,
  getJobRequestById,
  applyToJobRequest,
  getJobRequestApplications,
  acceptApplication,
  getMyApplications,
};