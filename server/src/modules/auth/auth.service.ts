import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IAuthUser, RegisterUserPayload } from "../../types";
import config from "../../config";
import { UserStatus } from "../../../generated/prisma/enums";
import { SignOptions } from "jsonwebtoken";
import { generateJwtToken } from "../../helpars/jwtHelpers";
import ApiError from "../../helpars/ApiError";
import httpStatus from "http-status";
import transporter from "../../utils/nodemailer";
import { createToken } from "../../utils/auth";
import { emailSenderMessages } from "../../constant";
import { formatHtml } from "../../utils/formatHtml";
import crypto from "crypto";

const register = async (payload: RegisterUserPayload) => {
  const { email, password, name, role, phone, address } = payload;

  // Validate if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User with this email already exists.",
    );
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

  // Confirmation email is best-effort: a broken SMTP should NEVER block account creation
  try {
    const jwtPayload = {
      id: user.id,
      role: user.role,
      name: user.name,
    };
    const token = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expire_in as number | undefined,
    );
    const html = await formatHtml("src/templates/confirmAccount.ejs", {
      name: name,
      url: `${config?.front_end_base_url}/confirm?token=${token}`,
      baseUrl: config?.front_end_base_url as string,
      year: new Date().getFullYear(),
    });
    const notifyMsg = {
      to: [email],
      from: `"FixItNow" <${config.smtp.user_name}>`,
      subject: emailSenderMessages.WELCOME_EMAIL_SUBJECT,
      replyTo: config.smtp.user_name,
      text: emailSenderMessages.CONFIRM_EMAIL_MESSAGE,
      html,
    };

    await transporter.sendMail(notifyMsg);
  } catch (emailErr) {
    console.error("[Auth] Confirmation email could not be sent:", emailErr);
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const login = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found with this email. Please register first.",
    );
  }

  if (user.status === UserStatus.BANNED) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your account has been blocked. Please contact support.",
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is not correct!");
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
  // Original behavior: fetch user safely, never expose password
  const result = await prisma.user.findUnique({
    where: { id: user?.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      address: true,
      imageUrl: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: {
        select: {
          id: true,
          bio: true,
          skills: true,
          experience: true,
          completedJobs: true,
          isAvailable: true,
          hourlyRate: true,
          availability: true,
          status: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return result;
};

const updateMe = async (user: IAuthUser, payload: any) => {
  const updateData = Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => value !== undefined),
  );
  const result = await prisma.user.update({
    where: { id: user?.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      address: true,
      imageUrl: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const forgetPassword = async (payload: { email: string }) => {
  const { email } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const jwtPayload = {
    id: user.id,
    role: user.role,
  };
  const token = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expire_in as number | undefined,
  );
  const pin = crypto.randomInt(100000, 999999).toString();

  try {
    const html = await formatHtml("src/templates/forgotPassword.ejs", {
      name: user.name,
      url: `${config?.front_end_base_url}/reset-password?token=${token}`,
      baseUrl: config?.front_end_base_url as string,
      pin: pin,
      year: new Date().getFullYear(),
    });

    const notifyMsg = {
      to: [email],
      from: `"FixItNow" <${config.smtp.user_name}>`,
      subject: emailSenderMessages.FORGET_PASSWORD_SUBJECT,
      replyTo: config.smtp.user_name,
      text: emailSenderMessages.FORGET_PASSWORD_MESSAGE,
      html,
    };

    await transporter.sendMail(notifyMsg);
  } catch (emailErr) {
    console.error("[Auth] Forgot-password email could not be sent:", emailErr);
  }
  return null;
};

const updatePassword = async (payload: { email: string }) => {
  const { email } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  try {
    const html = await formatHtml("src/templates/passwordResetSuccess.ejs", {
      name: user.name,
      loginUrl: `${config?.front_end_base_url}/login`,
      baseUrl: config?.front_end_base_url as string,
    });

    const notifyMsg = {
      to: [email],
      from: `"FixItNow" <${config.smtp.user_name}>`,
      subject: emailSenderMessages.PASSWORD_RESET_SUCCESS_SUBJECT,
      replyTo: config.smtp.user_name,
      text: emailSenderMessages.PASSWORD_RESET_SUCCESS_MESSAGE,
      html,
    };

    await transporter.sendMail(notifyMsg);
  } catch (emailErr) {
    console.error("[Auth] Password-reset-email could not be sent:", emailErr);
  }
  return null;
};

const resetPassword = async (payload: { email: string }) => {
  const { email } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  try {
    const html = await formatHtml("src/templates/passwordResetSuccess.ejs", {
      name: user.name,
      loginUrl: `${config?.front_end_base_url}/login`,
      baseUrl: config?.front_end_base_url as string,
    });

    const notifyMsg = {
      to: [email],
      from: `"FixItNow" <${config.smtp.user_name}>`,
      subject: emailSenderMessages.PASSWORD_RESET_SUCCESS_SUBJECT,
      replyTo: config.smtp.user_name,
      text: emailSenderMessages.PASSWORD_RESET_SUCCESS_MESSAGE,
      html,
    };

    await transporter.sendMail(notifyMsg);
  } catch (emailErr) {
    console.error("[Auth] Password-reset email could not be sent:", emailErr);
  }
  return null;
};

export const AuthServices = {
  register,
  login,
  getMe,
  updateMe,
  forgetPassword,
  updatePassword,
  resetPassword,
};
