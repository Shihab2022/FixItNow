import express from "express";
import { ServicesTechniciansController } from "./servicesTechnicians.controller";
const router = express.Router();

router.get("/", ServicesTechniciansController.getAllTechnicians);
router.get("/:id", ServicesTechniciansController.getTechnicianProfile);

export const TechniciansRouter = router;
