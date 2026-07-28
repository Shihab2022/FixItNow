import express from "express";
import { PaymentsController } from "./payments.controller";
import { Role } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/create", auth(Role.CUSTOMER), PaymentsController.create);
router.post("/confirm", auth(Role.CUSTOMER), PaymentsController.confirm);
router.get("/", auth(Role.CUSTOMER), PaymentsController.GetPaymentHistory);
router.get("/:id", auth(Role.CUSTOMER), PaymentsController.GetPaymentDetails);

export const PaymentsRouter = router;
