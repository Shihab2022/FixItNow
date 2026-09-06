import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";

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
 * For technicians: list nearby users (customers) who have a location set,
 * sorted by distance (Haversine).
 */
const listNearbyUsers = async (query: NearQuery) => {
  const { latitude, longitude } = query;
  const radiusKm = clampRadius(query.radiusKm);

  const users = await prisma.user.findMany({
    where: {
      role: Role.CUSTOMER,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      imageUrl: true,
      address: true,
      latitude: true,
      longitude: true,
      reviewsReceived: { select: { rating: true } },
    },
  });

  const mapped = users
    .map((u) => {
      const lat = u.latitude as number;
      const lng = u.longitude as number;
      const distanceKm = haversineKm(latitude, longitude, lat, lng);
      const rating =
        u.reviewsReceived.length
          ? u.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
            u.reviewsReceived.length
          : 5;
      return {
        ...u,
        distanceKm: Number(distanceKm.toFixed(2)),
        rating: Number(rating.toFixed(1)),
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