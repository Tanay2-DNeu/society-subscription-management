import {
  createPaymentAndMarkPaidModel,
  getMonthlyRecordForPaymentModel,
  getPaymentByMonthlyRecordIdModel,
} from "../models/payments.model.js";

const normalizePaymentModeOrThrow = (mode) => {
  if (!mode) {
    const err = new Error("payment_mode is required");
    err.statusCode = 400;
    throw err;
  }
  const value = String(mode).toLowerCase().trim();
  if (!["cash", "upi", "online"].includes(value)) {
    const err = new Error("Invalid payment_mode");
    err.statusCode = 400;
    throw err;
  }
  return value;
};

export const recordPaymentService = async (payload, adminUserId) => {
  const monthlyRecordId = Number(payload.monthly_record_id);
  if (!Number.isInteger(monthlyRecordId) || monthlyRecordId <= 0) {
    const err = new Error("Invalid monthly_record_id");
    err.statusCode = 400;
    throw err;
  }

  const payment_mode = normalizePaymentModeOrThrow(payload.payment_mode);
  const transaction_id = payload.transaction_id
    ? String(payload.transaction_id).trim()
    : null;

  const record = await getMonthlyRecordForPaymentModel(monthlyRecordId);
  if (!record) {
    const err = new Error("Monthly record not found");
    err.statusCode = 404;
    throw err;
  }

  if (String(record.status).toLowerCase() !== "pending") {
    const err = new Error("Payment already recorded");
    err.statusCode = 400;
    throw err;
  }

  const existingPayment = await getPaymentByMonthlyRecordIdModel(monthlyRecordId);
  if (existingPayment) {
    const err = new Error("Payment already recorded");
    err.statusCode = 400;
    throw err;
  }

  const amount = Number(record.amount_due);
  if (!Number.isFinite(amount) || amount <= 0) {
    const err = new Error("Invalid amount_due on monthly record");
    err.statusCode = 400;
    throw err;
  }

  try {
    return await createPaymentAndMarkPaidModel({
      monthly_record_id: monthlyRecordId,
      paid_by_user_id: adminUserId || null,
      amount,
      payment_mode,
      transaction_id,
    });
  } catch (error) {
    if (error?.code === "23505") {
      const err = new Error("Payment already recorded");
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
};
