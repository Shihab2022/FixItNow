import { Role } from "../../../generated/prisma/browser";
import ApiError from "../../helpars/ApiError";
import { IAuthUser } from "../../types";
import httpStatus from "http-status";
import { CreateServiceSchema } from "../validation";
import { prisma } from "../../lib/prisma";

const getAllTechnicians = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    minRate,
    maxRate,
    minExperience,
    available,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  // Search
  if (searchTerm) {
    where.OR = [
      {
        bio: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        user: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          email: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // Hourly Rate
  if (minRate || maxRate) {
    where.hourlyRate = {};

    if (minRate) {
      where.hourlyRate.gte = Number(minRate);
    }

    if (maxRate) {
      where.hourlyRate.lte = Number(maxRate);
    }
  }

  // Experience
  if (minExperience) {
    where.experience = {
      gte: Number(minExperience),
    };
  }

  // Availability
  if (available !== undefined) {
    where.isAvailable = available === "true";
  }

  // Status
  if (status !== undefined) {
    where.status = status === "true";
  }

  const technicians = await prisma.technicianProfile.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  const total = await prisma.technicianProfile.count({
    where,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: technicians,
  };
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};

const getAllServices = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    categoryId,
    technicianId,
    location,
    minPrice,
    maxPrice,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  // Search by title or description
  if (searchTerm) {
    where.OR = [
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  // Category Filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Technician Filter
  if (technicianId) {
    where.technicianId = technicianId;
  }

  // Location Filter
  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  // Price Range Filter
  if (minPrice || maxPrice) {
    where.price = {};

    if (minPrice) {
      where.price.gte = Number(minPrice);
    }

    if (maxPrice) {
      where.price.lte = Number(maxPrice);
    }
  }

  // Status Filter
  if (status !== undefined) {
    where.status = status === "true";
  }

  const services = await prisma.service.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  const total = await prisma.service.count({
    where,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: services,
  };

  // const services = await prisma.service.findMany();
  // return services;
};
const getTechnicianProfile = async (technicianId: string) => {
  const user = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          // password is intentionally omitted
        },
      },
    },
  });
  return user;
};
const createService = async (req: any) => {
  const user = req.user;
  const payload = req.body;
  if (user?.role !== Role.TECHNICIAN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only technicians can create services",
    );
  }

  const validatedData = CreateServiceSchema.parse(payload);
  const service = await prisma.service.create({
    data: {
      ...validatedData,
      technicianId: user.id, // Set automatically from JWT payload authentication
    },
  });

  return service;
};

export const ServicesTechniciansService = {
  getAllTechnicians,
  getAllCategories,
  getAllServices,
  getTechnicianProfile,
  createService,
};
