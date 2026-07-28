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
const CreateCategory = async (payload: {
  name: string;
  description?: string;
}) => {
  const validatedData = CreateCategorySchema.parse(payload);

  const category = await prisma.category.create({ data: validatedData });
  return category;
};

export const AdminService = {
  GetAllUsers,
  UpdateUserStatus,
  GetAllBookings,
  GetAllCategories,
  CreateCategory,
};
