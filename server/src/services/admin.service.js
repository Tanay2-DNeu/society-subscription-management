import {
  getDashboardStatsModel,
  getResidentsForAssignmentModel,
} from "../models/admin.model.js";
import bcrypt from "bcrypt";
import {
  findUserByIdModel,
  updateAdminProfileModel,
} from "../models/user.model.js";

export const fetchDashboardStats = async () => {
  const stats = await getDashboardStatsModel();
  return stats;
};

export const fetchResidentsForAssignment = async () => {
  return await getResidentsForAssignmentModel();
};

const err = (message, code = 400) => {
  const e = new Error(message);
  e.statusCode = code;
  return e;
};

export const fetchAdminProfile = async (userId) => {
  const user = await findUserByIdModel(userId);
  if (!user || user.role !== "admin") throw err("Not found", 404);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
};

export const updateAdminProfile = async (userId, { name, phone, password }) => {
  const user = await findUserByIdModel(userId);
  if (!user || user.role !== "admin") throw err("Not found", 404);

  const updates = {};

  if (name !== undefined) {
    const n = String(name).trim();
    if (n.length < 2) throw err("Name must be at least 2 characters", 400);
    if (n.length > 80) throw err("Name is too long", 400);
    updates.name = n;
  }

  if (phone !== undefined) {
    const p = String(phone).trim();
    if (!p) throw err("Phone cannot be empty", 400);
    if (!/^[0-9]{10,15}$/.test(p)) {
      throw err("Phone must be 10-15 digits", 400);
    }
    updates.phone = p;
  }

  if (password !== undefined) {
    const pw = String(password);
    if (pw.length < 6) throw err("Password must be at least 6 characters", 400);
    updates.passwordHash = await bcrypt.hash(pw, 10);
  }

  if (Object.keys(updates).length === 0) throw err("Nothing to update", 400);

  const row = await updateAdminProfileModel(userId, {
    name: updates.name,
    phone: updates.phone,
    passwordHash: updates.passwordHash,
  });

  if (!row) throw err("Update failed", 400);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
  };
};
