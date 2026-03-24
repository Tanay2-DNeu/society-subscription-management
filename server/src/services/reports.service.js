import { getAdminReportsModel } from "../models/reports.model.js";

export const getAdminReportsService = async (month, year) => {
  return await getAdminReportsModel(month, year);
};

