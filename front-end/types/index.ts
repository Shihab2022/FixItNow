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
