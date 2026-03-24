import {
  countActivePlansModel,
  generateMonthlyRecordsModel,
  getMonthlyRecordByFlatMonthYearModel,
  getMonthlyRecordByIdModel,
  listMonthlyRecordsForPeriodModel,
  updateMonthlyRecordStatusModel,
} from "../models/monthlyRecords.model.js";
import { getPaymentByMonthlyRecordIdModel } from "../models/payments.model.js";

const parseMonthYearOrThrow = (month, year) => {
  const m = Number(month);
  const y = Number(year);

  if (!Number.isInteger(m) || m < 1 || m > 12) {
    const err = new Error("month must be an integer between 1 and 12");
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isInteger(y) || y < 2000 || y > 2100) {
    const err = new Error("year must be a valid integer");
    err.statusCode = 400;
    throw err;
  }

  return { m, y };
};

export const listMonthlyRecordsService = async (month, year) => {
  const { m, y } = parseMonthYearOrThrow(month, year);
  return await listMonthlyRecordsForPeriodModel(m, y);
};

export const getMonthlyRecordByFlatMonthYearService = async (flatId, month, year) => {
  const fid = Number(flatId);
  if (!Number.isInteger(fid) || fid <= 0) {
    const err = new Error("flatId must be a positive integer");
    err.statusCode = 400;
    throw err;
  }
  const { m, y } = parseMonthYearOrThrow(month, year);
  return await getMonthlyRecordByFlatMonthYearModel(fid, m, y);
};

export const markMonthlyRecordPaidService = async (id) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    const err = new Error("Invalid record id");
    err.statusCode = 400;
    throw err;
  }

  const existing = await getMonthlyRecordByIdModel(parsedId);
  if (!existing) {
    const err = new Error("Record not found");
    err.statusCode = 404;
    throw err;
  }

  const row = await updateMonthlyRecordStatusModel(parsedId, "paid");
  return row;
};

export const markMonthlyRecordUnpaidService = async (id) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    const err = new Error("Invalid record id");
    err.statusCode = 400;
    throw err;
  }

  const existing = await getMonthlyRecordByIdModel(parsedId);
  if (!existing) {
    const err = new Error("Record not found");
    err.statusCode = 404;
    throw err;
  }

  const existingPayment = await getPaymentByMonthlyRecordIdModel(parsedId);
  if (existingPayment) {
    const err = new Error(
      "Cannot mark unpaid because a payment record already exists.",
    );
    err.statusCode = 400;
    throw err;
  }

  const row = await updateMonthlyRecordStatusModel(parsedId, "pending");
  return row;
};

export const generateMonthlyRecordsService = async (month, year) => {
  const { m, y } = parseMonthYearOrThrow(month, year);

  // Prevent generating records for months beyond the current calendar month.
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (y > currentYear || (y === currentYear && m > currentMonth)) {
    const err = new Error(
      "Future months cannot be generated. Select the current month or a past month.",
    );
    err.statusCode = 400;
    throw err;
  }

  const activePlans = await countActivePlansModel();
  if (activePlans === 0) {
    const err = new Error(
      "No active subscription plans. Create plans before generating monthly records.",
    );
    err.statusCode = 400;
    throw err;
  }

  return await generateMonthlyRecordsModel(m, y);
};
