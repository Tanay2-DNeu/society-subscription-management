import express from "express";
import {
  getFlatData,
  updateFlat,
  deleteFlat,
  createFlat,
} from "../controllers/flatsController.js";

import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateAdmin, getFlatData);

router.post("/", authenticateAdmin, createFlat);

router.put("/:id", authenticateAdmin, updateFlat);

router.delete("/:id", authenticateAdmin, deleteFlat);

import {
  assignResident,
  unassignResident,
  getFlatResidents,
} from "../controllers/flatAssignments.controller.js";

router.post("/:id/assign", authenticateAdmin, assignResident);

router.delete("/:id/unassign", authenticateAdmin, unassignResident);

router.get("/:id/residents", authenticateAdmin, getFlatResidents);

export default router;

// GET    /api/flats
// POST   /api/flats
// PUT    /api/flats/:id
// DELETE /api/flats/:id
