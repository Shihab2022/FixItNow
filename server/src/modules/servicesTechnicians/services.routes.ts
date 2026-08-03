import express from "express";
import { ServicesTechniciansController } from "./servicesTechnicians.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";
const router = express.Router();
router.get("/", ServicesTechniciansController.getAllServices);

router.post(
  "/",
  auth(Role.TECHNICIAN),
  ServicesTechniciansController.createService,
);
router.get(
  "/technician",
  auth(Role.TECHNICIAN),
  ServicesTechniciansController.getTechnicianServices,
);
router.get("/:id", ServicesTechniciansController.getSingleServices);

export const ServicesTechniciansRouter = router;
