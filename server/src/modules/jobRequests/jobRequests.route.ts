import express from "express";
import { JobRequestController } from "./jobRequests.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth("CUSTOMER"), JobRequestController.createJobRequest);
router.get("/", auth(), JobRequestController.listJobRequests);
router.get(
  "/technician/applications",
  auth("TECHNICIAN"),
  JobRequestController.getMyApplications,
);
router.get("/:id", auth(), JobRequestController.getJobRequestById);
router.get(
  "/:id/applications",
  auth(),
  JobRequestController.getJobRequestApplications,
);
router.post(
  "/:id/applications",
  auth("TECHNICIAN"),
  JobRequestController.applyToJobRequest,
);
router.post(
  "/:id/applications/:applicationId/accept",
  auth("CUSTOMER"),
  JobRequestController.acceptApplication,
);

export const JobRequestRouter = router;