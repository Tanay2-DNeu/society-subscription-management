import { buildResidentDashboardPayload } from "../services/residentDashboard.service.js";

export const getResidentDashboard = async (req, res) => {
  try {
    const data = await buildResidentDashboardPayload(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
