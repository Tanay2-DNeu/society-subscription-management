import pool from "../db/pool.js";

export const getDashboardStatsModel = async () => {
  // Simple counts first: keep the backend fast + explainable.
  const totalFlats = await pool.query("SELECT COUNT(*) AS count FROM flats");
  const totalResidents = await pool.query(
    "SELECT COUNT(*) AS count FROM users WHERE role='resident'",
  );
  const pendingPayments = await pool.query(
    "SELECT COUNT(*) AS count FROM monthly_records WHERE status='pending'",
  );
  const paidMonthlyRecords = await pool.query(
    "SELECT COUNT(*) AS count FROM monthly_records WHERE status='paid'",
  );
  const totalCollection = await pool.query(
    "SELECT COALESCE(SUM(amount), 0)::double precision AS totalCollection FROM payments",
  );

  // Single grouped query for monthly revenue (no date loops / no gap filling).
  const monthlyRevenue = await pool.query(
    `SELECT
        EXTRACT(YEAR FROM created_at)::int AS year,
        EXTRACT(MONTH FROM created_at)::int AS month,
        COALESCE(SUM(amount), 0)::double precision AS revenue
     FROM payments
     WHERE created_at >= (CURRENT_DATE - INTERVAL '11 months')
     GROUP BY year, month
     ORDER BY year, month`,
  );

  return {
    flats: totalFlats.rows[0].count,
    residents: totalResidents.rows[0].count,
    pendingPayments: pendingPayments.rows[0].count,
    paidMonthlyRecords: paidMonthlyRecords.rows[0].count,
    totalCollection: totalCollection.rows[0].totalCollection,
    monthlyRevenue: monthlyRevenue.rows,
  };
};

export const getResidentsForAssignmentModel = async () => {
  const result = await pool.query(
    `SELECT id, name, email, status
     FROM users
     WHERE role = 'resident' AND is_active = true
     ORDER BY name ASC`,
  );

  return result.rows;
};
