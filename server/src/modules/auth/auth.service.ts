import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IAuthUser, RegisterUserPayload } from "../../types";
import config from "../../config";
import { UserStatus } from "../../../generated/prisma/enums";
import { SignOptions } from "jsonwebtoken";
import { generateJwtToken } from "../../helpars/jwtHelpers";
import ApiError from "../../helpars/ApiError";
import httpStatus from "http-status";

const register = async (payload: RegisterUserPayload) => {
  const { email, password, name, role, phone, address } = payload;

  // Validate if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  // Dynamic database payload construction based on role choice
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
      phone,
      address,
      technicianProfile:
        role === "TECHNICIAN"
          ? { create: { experience: 0, skills: [] } }
          : undefined,
    },
    include: {
      technicianProfile: true,
    },
  });

  // Strip sensitive password out before responding
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const login = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  if (user.status === UserStatus.BANNED) {
    throw new Error("Your account has been blocked. Please contact support.");
  }

  const isPasswordCorrect = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw new Error("Password is not correct!");
  }
  const tokenData: IAuthUser = {
    id: user?.id,
    role: user.role,
    name: user.name,
  };
  const accessToken = generateJwtToken(
    tokenData,
    config.jwt_access_secret,
    config.jwt_access_expire_in as SignOptions,
  );
  const refreshToken = generateJwtToken(
    tokenData,
    config.jwt_refresh_secret,
    config.jwt_refresh_expire_in as SignOptions,
  );

  return { accessToken, refreshToken };
};

const getMe = async (user: IAuthUser) => {
  if (!user) {
    throw new Error("User not found");
  }
  const reUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      technicianProfile: true, // Will cleanly return data for techs, or null for customers/admins
    },
  });

  if (!reUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const { password: _, ...userWithoutPassword } = reUser;
  return userWithoutPassword;
};

export const AuthServices = {
  register,
  login,
  getMe,
};
