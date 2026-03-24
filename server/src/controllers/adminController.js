import {
  fetchDashboardStats,
  fetchAdminProfile,
  fetchResidentsForAssignment,
  updateAdminProfile,
} from "../services/admin.service.js";

export const getDashboardStats = async (req, res) => {
  try {
    const data = await fetchDashboardStats();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getResidentsForAssignment = async (req, res) => {
  try {
    const users = await fetchResidentsForAssignment();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const profile = await fetchAdminProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const patchAdminProfile = async (req, res) => {
  try {
    const profile = await updateAdminProfile(req.user.id, req.body);
    res.json({ message: "Profile updated", user: profile });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
