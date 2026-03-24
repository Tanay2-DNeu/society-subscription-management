import express from "express";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";
import { getSubscriptionPlansBundle } from "../controllers/subscriptions.controller.js";

const router = express.Router();

// GET /api/subscription-plans → { active, history }
router.get("/", authenticateAdmin, getSubscriptionPlansBundle);

export default router;
