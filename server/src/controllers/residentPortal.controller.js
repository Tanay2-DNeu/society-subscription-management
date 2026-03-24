import {
  getSubscriptionsForResident,
  getSubscriptionByIdForResident,
  getPendingDuesForResident,
  payPendingRecordForResident,
  getResidentProfile,
  updateResidentProfile,
} from "../services/residentPortal.service.js";

export const listSubscriptions = async (req, res) => {
  try {
    const data = await getSubscriptionsForResident(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const row = await getSubscriptionByIdForResident(req.user.id, req.params.id);
    res.json(row);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const listPendingDues = async (req, res) => {
  try {
    const data = await getPendingDuesForResident(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const postResidentPayment = async (req, res) => {
  try {
    const { monthly_record_id } = req.body;
    const payment = await payPendingRecordForResident(
      req.user.id,
      monthly_record_id,
    );
    res.status(201).json({ message: "Payment successful", payment });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(400).json({ message: "Payment already recorded" });
    }
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await getResidentProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const patchProfile = async (req, res) => {
  try {
    const profile = await updateResidentProfile(req.user.id, req.body);
    res.json({ message: "Profile updated", user: profile });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
