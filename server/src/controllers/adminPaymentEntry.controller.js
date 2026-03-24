import { getFlatsMinimalForAdminModel } from "../models/flats.model.js";
import { getMonthlyRecordByFlatMonthYearService } from "../services/monthlyRecords.service.js";

/**
 * GET /api/admin/flats
 * Columns per DB: flats.id, flat_number, block (and is_active filter only).
 */
export const listAdminFlatsMinimal = async (req, res) => {
  try {
    const rows = await getFlatsMinimalForAdminModel();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/admin/monthly-record?flatId=&month=&year=
 * Reads monthly_records only (id, amount_due, status).
 */
export const getMonthlyRecordByFlatMonthYear = async (req, res) => {
  try {
    const { flatId, month, year } = req.query;
    const row = await getMonthlyRecordByFlatMonthYearService(
      flatId,
      month,
      year,
    );
    if (!row) {
      res.json(null);
      return;
    }
    res.json({
      id: row.id,
      amount_due: row.amount_due,
      status: row.status,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
