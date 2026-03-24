import pool from "../db/pool.js";

// UNIQUE (flat_id, month, year) on monthly_records for ON CONFLICT.

export const countActivePlansModel = async () => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS c FROM subscription_plans WHERE is_active = true`,
  );
  return result.rows[0]?.c ?? 0;
};

export const listMonthlyRecordsForPeriodModel = async (month, year) => {
  const result = await pool.query(
    `SELECT
        mr.id,
        mr.flat_id,
        mr.plan_id,
        mr.month,
        mr.year,
        mr.amount_due,
        mr.status,
        mr.created_at,
        EXISTS (
          SELECT 1
          FROM payments p
          WHERE p.monthly_record_id = mr.id
        ) AS has_payment,
        f.flat_number,
        f.block
     FROM monthly_records mr
     INNER JOIN flats f ON f.id = mr.flat_id
     WHERE mr.month = $1 AND mr.year = $2
     ORDER BY f.block ASC, f.flat_number ASC`,
    [month, year],
  );
  return result.rows;
};

export const getMonthlyRecordByIdModel = async (id) => {
  const result = await pool.query(
    `SELECT id, flat_id, plan_id, month, year, amount_due, status
     FROM monthly_records
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

/** One row for flat + month + year (or null). */
export const getMonthlyRecordByFlatMonthYearModel = async (flatId, month, year) => {
  const result = await pool.query(
    `SELECT id, amount_due, status
     FROM monthly_records
     WHERE flat_id = $1 AND month = $2 AND year = $3`,
    [flatId, month, year],
  );
  return result.rows[0] || null;
};

export const updateMonthlyRecordStatusModel = async (id, status) => {
  const result = await pool.query(
    `UPDATE monthly_records
     SET status = $2
     WHERE id = $1
     RETURNING id, flat_id, plan_id, month, year, amount_due, status`,
    [id, status],
  );
  return result.rows[0] || null;
};

export const generateMonthlyRecordsModel = async (month, year) => {
  const result = await pool.query(
    `INSERT INTO monthly_records (flat_id, plan_id, month, year, amount_due, status)
     SELECT f.id, sp.id, $1::int, $2::int, sp.monthly_cost, 'pending'
     FROM flats f
     INNER JOIN subscription_plans sp
       ON sp.flat_type = f.flattype AND sp.is_active = true
     WHERE f.is_active = true
       -- Billing is tied to flat existence at the start of the billing month.
       -- Flats added after the month starts will start billing from the next month.
       AND f.created_at <= make_date($2::int, $1::int, 1)
     ON CONFLICT (flat_id, month, year) DO NOTHING`,
    [month, year],
  );

  return { inserted: result.rowCount ?? 0 };
};
