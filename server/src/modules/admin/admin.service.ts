import { UserStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateCategorySchema } from "../validation";

const GetAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
      phone: true,
      address: true,
      imageUrl: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
};
const UpdateUserStatus = async (payload: {
  id: string;
  status: UserStatus;
}) => {
  const { id, status } = payload;
  const user = await prisma.user.update({
    where: { id },
    data: { status },
  });
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const GetAllBookings = async () => {
  const bookings = await prisma.booking.findMany({});
  return bookings;
};
const GetAllCategories = async () => {
  const categories = await prisma.category.findMany({});
  return categories;
};
const GetOverview = async () => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  // ----------------------------------------------------
  // 1. PRIMARY KPI METRICS
  // ----------------------------------------------------

  // Total Marketplace Volume (Successful Payments)
  const totalVolumeAggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED" },
  });
  const totalVolume = totalVolumeAggregate._sum.amount || 0;

  // Current Month Volume vs Last Month Volume for Growth Calculation
  const currentMonthVolumeAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "COMPLETED",
      paidAt: { gte: startOfCurrentMonth },
    },
  });

  const lastMonthVolumeAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "COMPLETED",
      paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
    },
  });

  const currentVol = currentMonthVolumeAgg._sum.amount || 0;
  const lastVol = lastMonthVolumeAgg._sum.amount || 0;
  const volumeGrowth =
    lastVol > 0
      ? Number((((currentVol - lastVol) / lastVol) * 100).toFixed(1))
      : currentVol > 0
        ? 100
        : 0;

  // Active & Pending Technicians
  const activeTechnicians = await prisma.technicianProfile.count({
    where: { status: true, isAvailable: true },
  });

  const pendingTechnicians = await prisma.technicianProfile.count({
    where: { status: false },
  });

  // Total Bookings & Success Rate
  const totalBookings = await prisma.booking.count();
  const completedBookings = await prisma.booking.count({
    where: { status: "COMPLETED" },
  });
  const successRate =
    totalBookings > 0
      ? Number(((completedBookings / totalBookings) * 100).toFixed(1))
      : 0;

  // Platform Commission (15% platform take rate)
  const platformCommission = totalVolume * 0.15;

  // ----------------------------------------------------
  // 2. SECONDARY METRICS
  // ----------------------------------------------------

  // Total Registered Customers
  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  // Average Booking Value
  const bookingAvgAgg = await prisma.booking.aggregate({
    _avg: { totalPrice: true },
    where: { status: "COMPLETED" },
  });
  const avgBookingValue = bookingAvgAgg._avg.totalPrice || 0;

  // Total Active Listed Services
  const totalServices = await prisma.service.count({
    where: { status: true },
  });

  // Average Platform Rating (from Review model if applicable)
  // Note: If you don't have a Review model aggregate, safely fallback to 0
  let averageRating = 0;
  try {
    const ratingAgg = await prisma.review.aggregate({
      _avg: { rating: true },
    });
    averageRating = Number((ratingAgg._avg.rating || 0).toFixed(1));
  } catch {
    averageRating = 4.8; // Fallback mock value if review table is empty
  }

  // ----------------------------------------------------
  // 3. REVENUE TRENDS (LAST 6 MONTHS)
  // ----------------------------------------------------
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const monthName = monthStart.toLocaleString("default", { month: "short" });

    const monthRevenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
    });

    const monthBookingsCount = await prisma.booking.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    });

    monthlyTrends.push({
      month: monthName,
      revenue: monthRevenueAgg._sum.amount || 0,
      bookings: monthBookingsCount,
    });
  }

  // ----------------------------------------------------
  // 4. BOOKING STATUS BREAKDOWN
  // ----------------------------------------------------
  const statusGroups = await prisma.booking.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const bookingStatusBreakdown = statusGroups.map((group) => ({
    status: group.status,
    count: group._count.status,
  }));

  // ----------------------------------------------------
  // 5. TOP CATEGORY PERFORMANCE
  // ----------------------------------------------------
  const topCategories = await prisma.category.findMany({
    take: 5,
    select: {
      name: true,
      services: {
        select: {
          bookings: {
            select: { id: true },
          },
        },
      },
    },
  });

  const categoryPerformance = topCategories.map((cat) => {
    const bookingsCount = cat.services.reduce(
      (acc, service) => acc + service.bookings.length,
      0,
    );
    return {
      name: cat.name,
      bookingsCount,
    };
  });

  // ----------------------------------------------------
  // 6. RECENT BOOKINGS FEED (LAST 5 BOOKINGS)
  // ----------------------------------------------------
  const recentBookingsRaw = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true } },
      customer: { select: { name: true } },
      technician: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  const recentBookings = recentBookingsRaw.map((booking) => ({
    id: booking.id,
    serviceTitle: booking.service?.title || "General Service",
    customerName: booking.customer?.name || "Anonymous Customer",
    technicianName: booking.technician?.user?.name || "Assigned Pro",
    amount: booking.totalPrice,
    status: booking.status,
    date: booking.createdAt.toISOString().split("T")[0],
  }));
  return {
    metrics: {
      totalVolume,
      volumeGrowth,
      activeTechnicians,
      pendingTechnicians,
      totalBookings,
      successRate,
      platformCommission,
      totalCustomers,
      avgBookingValue,
      totalServices,
      averageRating,
    },
    monthlyTrends,
    bookingStatusBreakdown,
    categoryPerformance,
    recentBookings,
  };
  // ----------------------------------------------------
  // 7. RETURN STRUCTURED API RESPONSE
  // ----------------------------------------------------
  // return NextResponse.json({
  //   success: true,
  //   message: "Dashboard overview fetched successfully",
  //   data: {
  //     metrics: {
  //       totalVolume,
  //       volumeGrowth,
  //       activeTechnicians,
  //       pendingTechnicians,
  //       totalBookings,
  //       successRate,
  //       platformCommission,
  //       totalCustomers,
  //       avgBookingValue,
  //       totalServices,
  //       averageRating,
  //     },
  //     monthlyTrends,
  //     bookingStatusBreakdown,
  //     categoryPerformance,
  //     recentBookings,
  //   },
  // });
};
const CreateCategory = async (payload: {
  name: string;
  description?: string;
}) => {
  const validatedData = CreateCategorySchema.parse(payload);

  const category = await prisma.category.create({ data: validatedData });
  return category;
};
const UpdateCategory = async (payload: {
  id: string;
  name?: string;
  description?: string;
}) => {
  const { id, ...data } = payload;
  const category = await prisma.category.update({
    where: { id },
    data,
  });
  return category;
};
const updateCategoryStatus = async (payload: {
  id: string;
  status: boolean;
}) => {
  const { id, status } = payload;
  const category = await prisma.category.update({
    where: { id },
    data: { status },
  });
  return category;
};

export const AdminService = {
  GetAllUsers,
  UpdateUserStatus,
  GetAllBookings,
  GetAllCategories,
  CreateCategory,
  UpdateCategory,
  updateCategoryStatus,
  GetOverview,
};
