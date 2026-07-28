import express from "express";
import { ServicesTechniciansController } from "./servicesTechnicians.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";
const router = express.Router();
router.get("/", auth(), ServicesTechniciansController.getAllServices);
router.post(
  "/",
  auth(Role.TECHNICIAN),
  ServicesTechniciansController.createService,
);

export const ServicesTechniciansRouter = router;
