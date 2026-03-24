import express from "express";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";
import {
  getAdminProfile,
  getDashboardStats,
  patchAdminProfile,
  getResidentsForAssignment,
} from "../controllers/adminController.js";
import {
  getMonthlyRecordByFlatMonthYear,
  listAdminFlatsMinimal,
} from "../controllers/adminPaymentEntry.controller.js";
import {
  generateMonthlyRecords,
  listMonthlyRecords,
  markMonthlyRecordPaid,
  markMonthlyRecordUnpaid,
} from "../controllers/monthlyRecords.controller.js";
import { recordPayment } from "../controllers/payments.controller.js";
import {
  listAdminNotifications,
  sendAdminNotification,
} from "../controllers/adminNotifications.controller.js";

const router = express.Router();
router.get("/dashboard", authenticateAdmin, getDashboardStats);
router.get("/profile", authenticateAdmin, getAdminProfile);
router.patch("/profile", authenticateAdmin, patchAdminProfile);
router.get("/users", authenticateAdmin, getResidentsForAssignment);
router.get("/flats", authenticateAdmin, listAdminFlatsMinimal);

// Monthly records — register static paths before `/:id` to avoid matching "generate"
router.get("/monthly-record", authenticateAdmin, getMonthlyRecordByFlatMonthYear);
router.post(
  "/monthly-records/generate",
  authenticateAdmin,
  generateMonthlyRecords,
);
router.get("/monthly-records", authenticateAdmin, listMonthlyRecords);
router.patch(
  "/monthly-records/:id/pay",
  authenticateAdmin,
  markMonthlyRecordPaid,
);
router.patch(
  "/monthly-records/:id/unpay",
  authenticateAdmin,
  markMonthlyRecordUnpaid,
);
router.post("/payments", authenticateAdmin, recordPayment);

router.post("/notifications/send", authenticateAdmin, sendAdminNotification);
router.get("/notifications", authenticateAdmin, listAdminNotifications);

export default router;
