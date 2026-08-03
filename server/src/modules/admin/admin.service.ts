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

  // 1. Total Marketplace Volume (Successful Payments)
  const totalVolumeResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED" },
  });
  const totalVolume = totalVolumeResult._sum.amount || 0;

  // Current Month Volume vs Last Month Volume for Growth Rate
  const currentMonthVolume = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "COMPLETED",
      paidAt: { gte: startOfCurrentMonth },
    },
  });

  const lastMonthVolume = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "COMPLETED",
      paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
    },
  });

  const currentVol = currentMonthVolume._sum.amount || 0;
  const lastVol = lastMonthVolume._sum.amount || 0;
  const volumeGrowth =
    lastVol > 0
      ? (((currentVol - lastVol) / lastVol) * 100).toFixed(1)
      : currentVol > 0
        ? "100"
        : "0";

  // 2. Active & Pending Technicians
  const activeTechnicians = await prisma.technicianProfile.count({
    where: { status: true, isAvailable: true },
  });

  const pendingTechnicians = await prisma.technicianProfile.count({
    where: { status: false },
  });

  // 3. Total Bookings & Success Rate
  const totalBookings = await prisma.booking.count();
  const completedBookings = await prisma.booking.count({
    where: { status: "COMPLETED" },
  });
  const successRate =
    totalBookings > 0
      ? ((completedBookings / totalBookings) * 100).toFixed(1)
      : "0.0";

  // 4. Platform Commission (e.g., 15% platform take rate)
  const platformCommission = totalVolume * 0.15;

  // 5. Chart Data: Monthly Revenue Trend for the last 6 months
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

    const monthRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
    });

    monthlyTrends.push({
      month: monthName,
      revenue: monthRevenue._sum.amount || 0,
      commission: (monthRevenue._sum.amount || 0) * 0.15,
    });
  }

  return {
    metrics: {
      totalVolume,
      volumeGrowth: Number(volumeGrowth),
      activeTechnicians,
      pendingTechnicians,
      totalBookings,
      successRate: Number(successRate),
      platformCommission,
    },
    chartData: monthlyTrends,
  };
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
