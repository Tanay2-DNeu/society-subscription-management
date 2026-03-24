import {
  getCurrentFlatForUserModel,
  getMonthlyRecordForFlatPeriodModel,
  getPaymentHistoryForFlatModel,
  getRecentNotificationsModel,
} from "../models/residentDashboard.model.js";

export const buildResidentDashboardPayload = async (userId) => {
  const notifications = await getRecentNotificationsModel(userId, 5);

  const flat = await getCurrentFlatForUserModel(userId);
  if (!flat) {
    return {
      hasFlat: false,
      flat: null,
      currentRecord: null,
      paymentHistory: [],
      notifications,
    };
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const currentRecord = await getMonthlyRecordForFlatPeriodModel(
    flat.id,
    month,
    year,
  );
  const paymentHistory = await getPaymentHistoryForFlatModel(flat.id);

  return {
    hasFlat: true,
    flat,
    currentRecord,
    paymentHistory,
    notifications,
  };
};
