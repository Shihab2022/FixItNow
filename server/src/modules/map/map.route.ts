import express from "express";
import { MapController } from "./map.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/technicians", auth(), MapController.getNearbyTechnicians);
router.get("/tasks", auth(), MapController.getNearbyTasks);
router.get("/users", auth(), MapController.getNearbyUsers);

router.post("/locations", auth(), MapController.postLocation);
router.get("/locations", auth(), MapController.getLocationHistory);
router.get("/locations/last", auth(), MapController.getLastLocation);

export const MapRouter = router;