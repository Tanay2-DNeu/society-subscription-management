import express from "express";
import { authenticateResident } from "../middlewares/residentMiddleware.js";
import { getResidentDashboard } from "../controllers/resident.controller.js";
import {
  getProfile,
  getSubscriptionById,
  listPendingDues,
  listSubscriptions,
  patchProfile,
  postResidentPayment,
} from "../controllers/residentPortal.controller.js";

const router = express.Router();

router.get("/dashboard", authenticateResident, getResidentDashboard);

router.get("/subscriptions", authenticateResident, listSubscriptions);
router.get("/subscriptions/:id", authenticateResident, getSubscriptionById);

router.get("/pending-dues", authenticateResident, listPendingDues);
router.post("/payments", authenticateResident, postResidentPayment);

router.get("/profile", authenticateResident, getProfile);
router.patch("/profile", authenticateResident, patchProfile);

export default router;
