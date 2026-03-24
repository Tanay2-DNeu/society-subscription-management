import {
  assignResidentModel,
  unassignResidentModel,
  getFlatResidentsModel,
} from "../models/flatAssignments.model.js";

export const assignResidentService = async (flatId, userId, role) => {
  const parsedFlatId = Number(flatId);
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedFlatId) || parsedFlatId <= 0) {
    const error = new Error("Invalid flat ID");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    const error = new Error("Valid user_id is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedRole = role ? String(role).toLowerCase() : "owner";
  if (!["owner", "tenant"].includes(normalizedRole)) {
    const error = new Error("Invalid role. Use owner or tenant");
    error.statusCode = 400;
    throw error;
  }

  return await assignResidentModel(parsedFlatId, parsedUserId, normalizedRole);
};

export const unassignResidentService = async (flatId) => {
  return await unassignResidentModel(flatId);
};

export const getFlatResidentsService = async (flatId) => {
  return await getFlatResidentsModel(flatId);
};
