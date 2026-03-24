import {
  createPlanModel,
  getActivePlansModel,
  getPlanByIdModel,
  getPlanHistoryModel,
  updatePlanPriceByVersioningModel,
} from "../models/subscriptions.model.js";

export const getActivePlansService = async () => {
  return await getActivePlansModel();
};

export const getPlanHistoryService = async (flatTypeOrNull) => {
  return await getPlanHistoryModel(flatTypeOrNull);
};

export const createPlanService = async ({ flat_type, monthly_cost }) => {
  return await createPlanModel({ flat_type, monthly_cost });
};

export const updatePlanPriceService = async (planId, monthly_cost) => {
  const existing = await getPlanByIdModel(planId);
  if (!existing) {
    const err = new Error("Plan not found");
    err.statusCode = 404;
    throw err;
  }

  // Only version from the current active row; avoids deactivating a newer plan via an old id.
  if (!existing.is_active) {
    const err = new Error(
      "Only the active plan can be updated. Open the Active Plans table to change price.",
    );
    err.statusCode = 400;
    throw err;
  }

  return await updatePlanPriceByVersioningModel(existing.flat_type, monthly_cost);
};

export const getActiveAndHistoryBundleService = async () => {
  const [active, history] = await Promise.all([
    getActivePlansModel(),
    getPlanHistoryModel(null),
  ]);
  return { active, history };
};

