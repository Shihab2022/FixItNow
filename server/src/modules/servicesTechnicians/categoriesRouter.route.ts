import express from "express";
import { ServicesTechniciansController } from "./servicesTechnicians.controller";
import auth from "../../middlewares/auth";
const router = express.Router();

router.get("/", auth(), ServicesTechniciansController.getAllCategories);

export const CategoriesRouter = router;
