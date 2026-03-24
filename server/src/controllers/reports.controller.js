import { getAdminReportsService } from "../services/reports.service.js";

export const getAdminReports = async (req, res) => {
  try {
    const monthRaw = req.query.month;
    const yearRaw = req.query.year;

    const month = Number(monthRaw);
    const year = Number(yearRaw);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month. Use 1-12." });
    }
    if (!Number.isInteger(year)) {
      return res.status(400).json({ message: "Invalid year." });
    }

    const payload = await getAdminReportsService(month, year);
    res.json(payload);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

