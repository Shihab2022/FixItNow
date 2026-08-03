import express from "express";
import { TechnicianController } from "./technician.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";

const router = express.Router();

router.get(
  "/",
  auth(Role.TECHNICIAN),
  TechnicianController.getTechnicianProfile,
);
router.put(
  "/profile",
  auth(Role.TECHNICIAN),
  TechnicianController.UpdateProfile,
);
router.patch(
  "/tech-profile",
  auth(Role.TECHNICIAN),
  TechnicianController.UpdateTechnicianProfile,
);
router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  TechnicianController.UpdateAvailability,
);
router.get(
  "/availability",
  auth(Role.TECHNICIAN),
  TechnicianController.GetAvailability,
);
router.get(
  "/overview",
  auth(Role.TECHNICIAN),
  TechnicianController.GetOverview,
);
router.get(
  "/bookings",
  auth(Role.TECHNICIAN),
  TechnicianController.GetBookingHistory,
);
router.patch(
  "/bookings/:id",
  auth(Role.TECHNICIAN),
  TechnicianController.UpdateBookingStatus,
);

export const TechnicianRouter = router;
