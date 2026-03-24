import pool from "../db/pool.js";

/** Current flat for user (flat_assignments.is_current). */
export const getCurrentFlatForUserModel = async (userId) => {
  const result = await pool.query(
    `SELECT f.*
     FROM flats f
     INNER JOIN flat_assignments fa ON fa.flat_id = f.id
     WHERE fa.user_id = $1 AND fa.is_current = true
     LIMIT 1`,
    [userId],
  );
  return result.rows[0] || null;
};

export const getMonthlyRecordForFlatPeriodModel = async (
  flatId,
  month,
  year,
) => {
  const result = await pool.query(
    `SELECT *
     FROM monthly_records
     WHERE flat_id = $1 AND month = $2 AND year = $3`,
    [flatId, month, year],
  );
  return result.rows[0] || null;
};

/** Payments for this flat with billing period from monthly_records. */
export const getPaymentHistoryForFlatModel = async (flatId) => {
  const result = await pool.query(
    `SELECT
        p.id,
        p.monthly_record_id,
        p.amount,
        p.payment_mode,
        p.status,
        p.transaction_id,
        p.created_at,
        mr.month,
        mr.year,
        mr.amount_due,
        mr.status AS monthly_record_status
     FROM payments p
     INNER JOIN monthly_records mr ON p.monthly_record_id = mr.id
     WHERE mr.flat_id = $1
     ORDER BY mr.year DESC, mr.month DESC`,
    [flatId],
  );
  return result.rows;
};

/** All monthly rows for a flat with optional payment row (one payment per record). */
export const listMonthlyRecordsWithPaymentForFlatModel = async (flatId) => {
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
        p.id AS payment_id,
        p.amount AS payment_amount,
        p.payment_mode,
        p.status AS payment_status,
        p.created_at AS payment_created_at
     FROM monthly_records mr
     LEFT JOIN payments p ON p.monthly_record_id = mr.id
     WHERE mr.flat_id = $1
     ORDER BY mr.year DESC, mr.month DESC`,
    [flatId],
  );
  return result.rows;
};

/** Single monthly record + payment if exists; scoped to flat_id. */
export const getMonthlyRecordDetailForFlatModel = async (recordId, flatId) => {
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
        p.id AS payment_id,
        p.amount AS payment_amount,
        p.payment_mode,
        p.status AS payment_status,
        p.transaction_id,
        p.created_at AS payment_created_at
     FROM monthly_records mr
     LEFT JOIN payments p ON p.monthly_record_id = mr.id
     WHERE mr.id = $1 AND mr.flat_id = $2`,
    [recordId, flatId],
  );
  return result.rows[0] || null;
};

export const listPendingMonthlyRecordsForFlatModel = async (flatId) => {
  const result = await pool.query(
    `SELECT id, flat_id, plan_id, month, year, amount_due, status, created_at
     FROM monthly_records
     WHERE flat_id = $1 AND status = 'pending'
     ORDER BY year DESC, month DESC`,
    [flatId],
  );
  return result.rows;
};

/** Recent society notifications (same list for all residents). */
export const getRecentNotificationsModel = async (limit = 5) => {
  const result = await pool.query(
    `SELECT id, title, message, sent_at
     FROM notifications
     WHERE users_id = $1
     ORDER BY sent_at DESC NULLS LAST, id DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows;
};
