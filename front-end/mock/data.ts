import {
  Category,
  ServiceItem,
  Technician,
  Booking,
  StatMetric,
} from "@/types";

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Plumbing",
    title: "Plumbing",
    slug: "plumbing",
    icon: "wrench",
    iconName: "wrench",
    description: "Pipe repairs, leak detection, and installations.",
    servicesCount: 24,
    technicianCount: 45,
  },
  {
    id: "cat-2",
    name: "Electrical",
    title: "Electrical",
    slug: "electrical",
    icon: "zap",
    iconName: "zap",
    description: "Wiring, panel upgrades, and fixture setups.",
    servicesCount: 18,
    technicianCount: 38,
  },
  {
    id: "cat-3",
    name: "HVAC",
    title: "HVAC",
    slug: "hvac",
    icon: "wind",
    iconName: "wind",
    description: "AC repair, heating installation, and duct cleaning.",
    servicesCount: 15,
    technicianCount: 32,
  },
  {
    id: "cat-4",
    name: "Carpentry",
    title: "Carpentry",
    slug: "carpentry",
    icon: "hammer",
    iconName: "hammer",
    description: "Furniture assembly, framing, and custom woodwork.",
    servicesCount: 12,
    technicianCount: 28,
  },
];

export const mockServices: ServiceItem[] = [
  {
    id: "srv-101",
    title: "Emergency Pipe Leak Repair",
    categoryId: "cat-1",
    categoryName: "Plumbing",
    description:
      "Rapid diagnostic and pipe sealing service to prevent water damage.",
    price: 85,
    duration: "1-2 hrs",
    rating: 4.9,
    reviewCount: 128,
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    features: ["24/7 Availability", "Includes Inspection", "90-day Guarantee"],
  },
  {
    id: "srv-102",
    title: "Smart Home Panel Upgrade",
    categoryId: "cat-2",
    categoryName: "Electrical",
    description:
      "Modernize your home circuit panel with smart load management.",
    price: 350,
    duration: "4-6 hrs",
    rating: 4.95,
    reviewCount: 84,
    imageUrl:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    features: [
      "Licensed Electrician",
      "Code Compliant",
      "Full Surge Protection",
    ],
  },
];

export const mockTechnicians: Technician[] = [
  {
    id: "tech-1",
    userId: "usr-201",
    name: "Marcus Vance",
    profession: "Master Plumber & Pipe Specialist",
    title: "Master Plumber & Pipe Specialist",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    bio: "Over 12 years of residential and commercial plumbing experience. Certified in tankless water heater installations.",
    rating: 4.9,
    reviewCount: 210,
    startingPrice: 65,
    hourlyRate: 65,
    experienceYears: 12,
    isVerified: true,
    isAvailable: true,
    skills: ["Leak Repair", "Water Heaters", "Pipe Inspection", "Sewer Lines"],
    categories: ["Plumbing"],
    completedJobs: 430,
    location: "San Francisco, CA",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "BK-8901",
    serviceId: "srv-101",
    serviceTitle: "Emergency Pipe Leak Repair",
    customerId: "usr-100",
    customerName: "Sarah Jenkins",
    technicianId: "tech-1",
    technicianName: "Marcus Vance",
    technicianAvatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80",
    bookingDate: "2026-08-05",
    timeSlot: "10:00 AM - 12:00 PM",
    address: "742 Evergreen Terrace, San Francisco, CA",
    status: "confirmed",
    amount: 170,
    paymentStatus: "paid",
    createdAt: "2026-07-28",
  },
];

export const mockAdminStats: StatMetric[] = [
  {
    title: "Total Revenue",
    value: "$128,450",
    change: "+14.2%",
    isPositive: true,
    icon: "dollar",
  },
  {
    title: "Active Bookings",
    value: "342",
    change: "+8.1%",
    isPositive: true,
    icon: "calendar",
  },
  {
    title: "Verified Technicians",
    value: "1,280",
    change: "+5.4%",
    isPositive: true,
    icon: "users",
  },
  {
    title: "Completion Rate",
    value: "98.6%",
    change: "+0.3%",
    isPositive: true,
    icon: "check-circle",
  },
];
