import express from "express";
import { BookingsController } from "./bookings.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";
const router = express.Router();
router.post("/", auth(Role.CUSTOMER), BookingsController.CreateNewBooking);
router.get("/", auth(Role.CUSTOMER), BookingsController.GetUserBookings);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), BookingsController.GetBookingDetails);

export const BookingsRouter = router;
