import express from "express";
import { MapController } from "./map.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/technicians", auth(), MapController.getNearbyTechnicians);
router.get("/tasks", auth(), MapController.getNearbyTasks);

export const MapRouter = router;