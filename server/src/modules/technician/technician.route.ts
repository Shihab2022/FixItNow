import express from "express";
import { TechnicianController } from "./technician.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";

const router = express.Router();

router.put(
  "/profile",
  auth(Role.TECHNICIAN),
  TechnicianController.UpdateProfile,
);
router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  TechnicianController.UpdateAvailability,
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
