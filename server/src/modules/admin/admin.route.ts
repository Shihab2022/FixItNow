import express from "express";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";

const router = express.Router();

router.get("/users", auth(Role.ADMIN), AdminController.GetAllUsers);
router.patch("/users/:id", auth(Role.ADMIN), AdminController.UpdateUserStatus);
router.get("/bookings", auth(Role.ADMIN), AdminController.GetAllBookings);
router.get("/categories", auth(Role.ADMIN), AdminController.GetAllCategories);
router.post("/categories", auth(Role.ADMIN), AdminController.CreateCategory);

export const AdminRouter = router;
