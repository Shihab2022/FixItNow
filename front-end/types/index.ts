import { toastTypes } from "@/app/constant";

export interface Service {
  id: string;
  name: string;
  category: string;
  startingPrice: number;
  duration: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export interface Technician {
  id: string;
  name: string;
  profession: string;
  rating: number;
  completedJobs: number;
  experienceYears: number;
  startingPrice: number;
  isVerified: boolean;
  isAvailable: boolean;
  avatarUrl: string;
}

export interface Category {
  id: string;
  title: string;
  iconName: string;
  technicianCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  serviceUsed: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type UserRole = "customer" | "technician" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  status: "active" | "banned" | "pending";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  servicesCount: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  features: string[];
}

export interface Technician {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  bio: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experienceYears: number;
  isVerified: boolean;
  skills: string[];
  categories: string[];
  completedJobs: number;
  location: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  technicianAvatar: string;
  bookingDate: string;
  timeSlot: string;
  address: string;
  status: BookingStatus;
  amount: number;
  paymentStatus: "paid" | "pending" | "refunded";
  createdAt: string;
}

export interface StatMetric {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: string;
}
export type ToastTypes = (typeof toastTypes)[keyof typeof toastTypes];
