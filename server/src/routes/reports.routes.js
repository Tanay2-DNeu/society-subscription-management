import express from "express";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";
import { getAdminReports } from "../controllers/reports.controller.js";

const router = express.Router();

// GET /api/reports?month=<1-12>&year=<number>
router.get("/reports", authenticateAdmin, getAdminReports);

export default router;

