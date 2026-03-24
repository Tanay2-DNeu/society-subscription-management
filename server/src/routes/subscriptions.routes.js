import express from "express";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";
import {
  createPlan,
  getActivePlans,
  getPlanHistory,
  updatePlanPrice,
} from "../controllers/subscriptions.controller.js";

const router = express.Router();

// View active plans
router.get("/", authenticateAdmin, getActivePlans);

// View full plan history (optional filter by flat_type)
router.get("/history", authenticateAdmin, getPlanHistory);

// Create initial plan (or new active plan) for a flat_type
router.post("/", authenticateAdmin, createPlan);

// Update a plan price by creating a new version
router.put("/:id", authenticateAdmin, updatePlanPrice);

export default router;

