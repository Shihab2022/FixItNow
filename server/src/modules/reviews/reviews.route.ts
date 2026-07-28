import express from "express";
import { ReviewsController } from "./reviews.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(), ReviewsController.CreateReview);

export const ReviewsRouter = router;
