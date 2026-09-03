import express from "express";
import { ServicesTechniciansController } from "./servicesTechnicians.controller";
const router = express.Router();

router.get("/", ServicesTechniciansController.getAllCategories);

export const CategoriesRouter = router;
