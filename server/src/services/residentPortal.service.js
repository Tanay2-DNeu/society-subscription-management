import bcrypt from "bcrypt";
import {
  createPaymentAndMarkPaidModel,
  getPaymentByMonthlyRecordIdModel,
} from "../models/payments.model.js";
import { getMonthlyRecordByIdModel } from "../models/monthlyRecords.model.js";
import {
  getCurrentFlatForUserModel,
  getMonthlyRecordDetailForFlatModel,
  listMonthlyRecordsWithPaymentForFlatModel,
  listPendingMonthlyRecordsForFlatModel,
} from "../models/residentDashboard.model.js";
import {
  findUserByIdModel,
  updateResidentProfileModel,
} from "../models/user.model.js";

const err = (message, code = 400) => {
  const e = new Error(message);
  e.statusCode = code;
  return e;
};

export const getSubscriptionsForResident = async (userId) => {
  const flat = await getCurrentFlatForUserModel(userId);
  if (!flat) {
    return { hasFlat: false, flat: null, records: [] };
  }
  const records = await listMonthlyRecordsWithPaymentForFlatModel(flat.id);
  return { hasFlat: true, flat, records };
};

export const getSubscriptionByIdForResident = async (userId, recordId) => {
  const rid = Number(recordId);
  if (!Number.isInteger(rid) || rid <= 0) throw err("Invalid id", 400);

  const flat = await getCurrentFlatForUserModel(userId);
  if (!flat) throw err("No flat assigned", 400);

  const row = await getMonthlyRecordDetailForFlatModel(rid, flat.id);
  if (!row) throw err("Record not found", 404);
  return row;
};

export const getPendingDuesForResident = async (userId) => {
  const flat = await getCurrentFlatForUserModel(userId);
  if (!flat) {
    return { hasFlat: false, flat: null, pending: [] };
  }
  const pending = await listPendingMonthlyRecordsForFlatModel(flat.id);
  return { hasFlat: true, flat, pending };
};

/** Simulated online payment — same rules as admin manual entry. */
export const payPendingRecordForResident = async (userId, monthlyRecordId) => {
  const mid = Number(monthlyRecordId);
  if (!Number.isInteger(mid) || mid <= 0) throw err("Invalid monthly_record_id", 400);

  const flat = await getCurrentFlatForUserModel(userId);
  if (!flat) throw err("No flat assigned", 400);

  const record = await getMonthlyRecordByIdModel(mid);
  if (!record || record.flat_id !== flat.id) throw err("Record not found", 404);

  if (String(record.status).toLowerCase() !== "pending") {
    throw err("This bill is already paid", 400);
  }

  const existing = await getPaymentByMonthlyRecordIdModel(mid);
  if (existing) throw err("Payment already exists", 400);

  const amount = Number(record.amount_due);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw err("Invalid amount on record", 400);
  }

  try {
    return await createPaymentAndMarkPaidModel({
      monthly_record_id: mid,
      paid_by_user_id: userId,
      amount,
      payment_mode: "online",
      transaction_id: null,
    });
  } catch (error) {
    if (error?.code === "23505") {
      throw err("Payment already recorded", 400);
    }
    throw error;
  }
};

export const getResidentProfile = async (userId) => {
  const user = await findUserByIdModel(userId);
  if (!user || user.role !== "resident") throw err("Not found", 404);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
};

export const updateResidentProfile = async (userId, { phone, password }) => {
  const user = await findUserByIdModel(userId);
  if (!user || user.role !== "resident") throw err("Not found", 404);

  const updates = {};
  if (phone !== undefined) {
    const p = String(phone).trim();
    if (!p) throw err("Phone cannot be empty", 400);
    updates.phone = p;
  }

  if (password !== undefined) {
    const pw = String(password);
    if (pw.length < 6) throw err("Password must be at least 6 characters", 400);
    updates.passwordHash = await bcrypt.hash(pw, 10);
  }

  if (Object.keys(updates).length === 0) {
    throw err("Nothing to update", 400);
  }

  const row = await updateResidentProfileModel(userId, {
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
