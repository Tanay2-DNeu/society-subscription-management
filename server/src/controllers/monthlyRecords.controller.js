import {
  generateMonthlyRecordsService,
  listMonthlyRecordsService,
  markMonthlyRecordPaidService,
  markMonthlyRecordUnpaidService,
} from "../services/monthlyRecords.service.js";

/**
 * GET ?month=&year=
 * Returns rows from monthly_records only (joined to flats for display).
 */
export const listMonthlyRecords = async (req, res) => {
  try {
    const { month, year } = req.query;
    const rows = await listMonthlyRecordsService(month, year);
    res.json(rows);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * PATCH — mark record paid (status only; amount_due unchanged).
 */
export const markMonthlyRecordPaid = async (req, res) => {
  try {
    const row = await markMonthlyRecordPaidService(req.params.id);
    res.json(row);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * PATCH — mark record pending again.
 */
export const markMonthlyRecordUnpaid = async (req, res) => {
  try {
    const row = await markMonthlyRecordUnpaidService(req.params.id);
    res.json(row);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * POST body: { month: number, year: number }
 * Uses only active plans at generation time; does not modify existing rows (ON CONFLICT DO NOTHING).
 */
export const generateMonthlyRecords = async (req, res) => {
  try {
    const { month, year } = req.body;
    const result = await generateMonthlyRecordsService(month, year);
    res.json({
      message: "Generation complete (skipped rows that already existed for that month)",
      ...result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
