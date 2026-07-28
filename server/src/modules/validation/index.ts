// src/validations/schemas.ts
import { z } from "zod";

// --- AUTH VALIDATION ---
export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name is required"),
  role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- ADMIN VALIDATION ---
export const CreateCategorySchema = z.object({
  name: z.string().min(3, "Category name is required"),
  description: z.string().optional(),
});

export const UpdateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BANNED"]),
});

// --- SERVICE VALIDATION ---
export const CreateServiceSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().min(10, "Description must be thorough"),
  price: z.number().positive("Price must be greater than 0"),
  location: z.string().min(2, "Location area is required"),
  categoryId: z.string().uuid("Invalid Category ID"),
});

// --- BOOKING VALIDATION ---
export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid("Invalid Service ID"),
  technicianId: z.string().uuid("Invalid Technician ID"),
  scheduledDate: z
    .string()
    .datetime({ message: "Must be a valid ISO 8601 date string" }),
  totalPrice: z.number().positive(),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "DECLINED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
});

// --- PAYMENT VALIDATION ---
export const ProcessPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  provider: z.enum(["STRIPE", "SSLCOMMERZ"]),
  transactionId: z.string().min(5, "Transaction Reference code required"),
});

// --- REVIEW VALIDATION ---
export const CreateReviewSchema = z.object({
  bookingId: z.string().uuid(),
  technicianId: z.string().uuid(),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(3, "Comment cannot be empty"),
});
