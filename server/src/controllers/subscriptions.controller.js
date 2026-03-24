import {
  createPlanService,
  getActiveAndHistoryBundleService,
  getActivePlansService,
  getPlanHistoryService,
  updatePlanPriceService,
} from "../services/subscriptions.service.js";

const normalizeFlatTypeOrThrow = (flat_type) => {
  if (!flat_type) {
    const err = new Error("flat_type is required");
    err.statusCode = 400;
    throw err;
  }
  const value = String(flat_type).toLowerCase().trim();
  if (!["1bhk", "2bhk", "3bhk"].includes(value)) {
    const err = new Error("Invalid flat_type");
    err.statusCode = 400;
    throw err;
  }
  return value;
};

const normalizeMonthlyCostOrThrow = (monthly_cost) => {
  if (monthly_cost === undefined || monthly_cost === null || monthly_cost === "") {
    const err = new Error("monthly_cost is required");
    err.statusCode = 400;
    throw err;
  }

  const num = Number(monthly_cost);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    const err = new Error("monthly_cost must be a number");
    err.statusCode = 400;
    throw err;
  }

  if (num <= 0) {
    const err = new Error("monthly_cost must be greater than 0");
    err.statusCode = 400;
    throw err;
  }

  return num;
};

export const getActivePlans = async (req, res) => {
  try {
    const plans = await getActivePlansService();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Combined payload for admin UI: active plans + full history (sorted newest first). */
export const getSubscriptionPlansBundle = async (req, res) => {
  try {
    const data = await getActiveAndHistoryBundleService();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlanHistory = async (req, res) => {
  try {
    const { flat_type } = req.query;
    const normalizedType = flat_type ? normalizeFlatTypeOrThrow(flat_type) : null;
    const plans = await getPlanHistoryService(normalizedType);
    res.json(plans);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const flat_type = normalizeFlatTypeOrThrow(req.body.flat_type);
    const monthly_cost = normalizeMonthlyCostOrThrow(req.body.monthly_cost);

    const plan = await createPlanService({ flat_type, monthly_cost });
    res.status(201).json(plan);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updatePlanPrice = async (req, res) => {
  try {
    const planId = Number(req.params.id);
    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({ message: "Invalid plan id" });
    }

    // Frontend might send amount; backend stores monthly_cost
    const monthly_cost = normalizeMonthlyCostOrThrow(
      req.body.monthly_cost ?? req.body.amount,
    );

    const plan = await updatePlanPriceService(planId, monthly_cost);
    res.json(plan);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

