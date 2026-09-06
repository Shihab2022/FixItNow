import { prisma } from "../../lib/prisma";
import { Role, JobRequestStatus } from "../../../generated/prisma/enums";

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

interface NearQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  categoryId?: string;
  q?: string;
}

const clampRadius = (radius: unknown) => {
  const r = Number(radius);
  return Number.isFinite(r) && r > 0 ? Math.min(r, 500) : 10;
};

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** "HH:MM" → minutes since midnight for time comparisons. */
const toMinutes = (time: string): number => {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m || 0);
};

/**
 * Returns true only when the technician has a working slot that covers the
 * current day AND the current time. This hides technicians who are off-duty
 * or whose last slot has already ended (e.g. last slot ends 5 PM → hidden
 * after 5 PM).
 *
 * Supports both stored formats:
 *  - `{ "monday": [{ start: "09:00", end: "17:00" }] }` (backend)
 *  - `{ "monday": ["09:00-17:00"] }` (legacy/seed data)
 */
const isAvailableNow = (availability: unknown): boolean => {
  if (!availability) return false;
  const map = availability as Record<string, unknown>;
  // getDay() is always 0-6 and DAY_NAMES has 7 entries, so the cast is safe.
  const dayKey = DAY_NAMES[new Date().getDay()] as string;
  const slots = map[dayKey];
  if (!Array.isArray(slots) || slots.length === 0) return false;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.some((raw) => {
    const slot =
      typeof raw === "string"
        ? { start: raw.split("-")[0] ?? "", end: raw.split("-")[1] ?? "" }
        : (raw as { start?: string; end?: string });
    if (!slot.start || !slot.end) return false;
    return (
      toMinutes(slot.start) <= nowMinutes && nowMinutes < toMinutes(slot.end)
    );
  });
};

const listNearbyTechnicians = async (query: NearQuery) => {
  const { latitude, longitude } = query;
  const radiusKm = clampRadius(query.radiusKm);

  const where: any = {
    status: true,
    isAvailable: true,
    user: {
      role: Role.TECHNICIAN,
      latitude: { not: null },
      longitude: { not: null },
    },
  };

  if (query.categoryId) {
    where.services = { some: { categoryId: query.categoryId } };
  }

  if (query.q) {
    where.OR = [
      { bio: { contains: query.q, mode: "insensitive" } },
      { user: { name: { contains: query.q, mode: "insensitive" } } },
      { skills: { array_contains: [query.q] } },
    ];
  }

  const technicians = await prisma.technicianProfile.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          imageUrl: true,
          address: true,
          latitude: true,
          longitude: true,
          reviewsReceived: { select: { rating: true } },
        },
      },
      services: {
        select: { category: { select: { id: true, name: true } } },
      },
    },
  });

  const mapped = technicians
    .filter((t) => isAvailableNow(t.availability))
    .map((t) => {
      const u = t.user;
      const lat = u.latitude as number;
      const lng = u.longitude as number;
      const distanceKm = haversineKm(latitude, longitude, lat, lng);
      const rating =
        u.reviewsReceived.length
          ? u.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
            u.reviewsReceived.length
          : 5;
      const categories = t.services.map((s) => s.category);
      return {
        ...t,
        // Top-level coordinates so the frontend marker/renderer can place
        // them on the map without digging into the nested user object.
        latitude: lat,
        longitude: lng,
        distanceKm: Number(distanceKm.toFixed(2)),
        rating: Number(rating.toFixed(1)),
        categories,
        user: {
          id: u.id,
          name: u.name,
          phone: u.phone,
          imageUrl: u.imageUrl,
          address: u.address,
        },
      };
    })
    .filter((t) => t.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    meta: { total: mapped.length, radiusKm },
    data: mapped,
  };
};

/**
 * Save a location for the user — creates a LocationHistory entry and
 * updates the user's current latitude/longitude so the map can centre
 * on their last-shared position next time.
 */
const saveLocation = async (params: {
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  label?: string;
}) => {
  const { userId, latitude, longitude, address, label } = params;

  // 1. Update the user's current lat/lng (so the map centres on this next visit)
  await prisma.user.update({
    where: { id: userId },
    data: { latitude, longitude },
  });

  // 2. Append to the location history table (all searches & shared locations)
  return await prisma.locationHistory.create({
    data: {
      userId,
      latitude,
      longitude,
      address,
      label,
    },
  });
};

/**
 * Returns the user's most-recent saved location (or null if none exists).
 */
const getLastLocation = async (userId: string) => {
  return await prisma.locationHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      address: true,
      label: true,
      createdAt: true,
    },
  });
};

/**
 * Returns the full location history for a user (most-recent first).
 */
const getLocationHistory = async (userId: string) => {
  return await prisma.locationHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      address: true,
      label: true,
      createdAt: true,
    },
  });
};

/**
 * For technicians: list nearby customers who currently have an OPEN task.
 * Only users who raised a task appear on the map, and their marker/distance is
 * based on the task's location (not the customer's profile location). The task
 * details are included so the frontend can render a "View As Task & Apply"
 * popup without exposing the customer's email/phone.
 */
const listNearbyUsers = async (query: NearQuery) => {
  const { latitude, longitude } = query;
  const radiusKm = clampRadius(query.radiusKm);

  const users = await prisma.user.findMany({
    where: {
      role: Role.CUSTOMER,
      jobRequests: { some: { status: JobRequestStatus.OPEN } },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      latitude: true,
      longitude: true,
      jobRequests: {
        where: { status: JobRequestStatus.OPEN },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          title: true,
          description: true,
          budget: true,
          address: true,
          latitude: true,
          longitude: true,
          category: { select: { id: true, name: true } },
        },
      },
      reviewsReceived: { select: { rating: true } },
    },
  });

  const mapped = users
    .filter((u) => u.jobRequests.length > 0)
    .map((u) => {
      const job = u.jobRequests[0] as NonNullable<(typeof u.jobRequests)[0]>;
      const lat = job.latitude;
      const lng = job.longitude;
      const distanceKm = haversineKm(latitude, longitude, lat, lng);
      const rating =
        u.reviewsReceived.length
          ? u.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
            u.reviewsReceived.length
          : 5;
      return {
        id: u.id,
        name: u.name,
        imageUrl: u.imageUrl,
        // The task is where the technician will go, so the marker and distance
        // follow the task's coordinates/address rather than the user profile.
        address: job.address,
        latitude: lat,
        longitude: lng,
        distanceKm: Number(distanceKm.toFixed(2)),
        rating: Number(rating.toFixed(1)),
        task: {
          id: job.id,
          title: job.title,
          description: job.description,
          budget: job.budget,
          address: job.address,
          category: job.category,
        },
      };
    })
    .filter((u) => u.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    meta: { total: mapped.length, radiusKm },
    data: mapped,
  };
};

const listNearbyTasks = async (query: NearQuery) => {
  const { latitude, longitude } = query;
  const radiusKm = clampRadius(query.radiusKm);

  const where: any = { status: "OPEN" };
  if (query.categoryId) where.categoryId = query.categoryId;

  const requests = await prisma.jobRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      customer: {
        select: { id: true, name: true, address: true },
      },
      _count: { select: { applications: true } },
    },
  });

  const mapped = requests
    .map((j) => {
      const distanceKm = haversineKm(
        latitude,
        longitude,
        j.latitude,
        j.longitude,
      );
      return {
        ...j,
        distanceKm: Number(distanceKm.toFixed(2)),
      };
    })
    .filter((j) => j.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    meta: { total: mapped.length, radiusKm },
    data: mapped,
  };
};

export const MapService = {
  listNearbyTechnicians,
  listNearbyTasks,
  listNearbyUsers,
  saveLocation,
  getLastLocation,
  getLocationHistory,
};