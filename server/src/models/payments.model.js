import pool from "../db/pool.js";

export const getMonthlyRecordForPaymentModel = async (monthlyRecordId) => {
  const result = await pool.query(
    `SELECT id, amount_due, status
     FROM monthly_records
     WHERE id = $1`,
    [monthlyRecordId],
  );

  return result.rows[0] || null;
};

export const getPaymentByMonthlyRecordIdModel = async (monthlyRecordId) => {
  const result = await pool.query(
    `SELECT id, monthly_record_id, amount, payment_mode, status
     FROM payments
     WHERE monthly_record_id = $1`,
    [monthlyRecordId],
  );

  return result.rows[0] || null;
};

export const createPaymentAndMarkPaidModel = async ({
  monthly_record_id,
  paid_by_user_id,
  amount,
  payment_mode,
  transaction_id,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const paymentResult = await client.query(
      `INSERT INTO payments (
        monthly_record_id,
        paid_by_user_id,
        amount,
        payment_mode,
        status,
        transaction_id
      )
      VALUES ($1, $2, $3, $4, 'approved', $5)
      RETURNING id, monthly_record_id, paid_by_user_id, amount, payment_mode, status, transaction_id, created_at`,
      [
        monthly_record_id,
        paid_by_user_id,
        amount,
        payment_mode,
        transaction_id || null,
      ],
    );

    await client.query(
      `UPDATE monthly_records
       SET status = 'paid'
       WHERE id = $1`,
      [monthly_record_id],
    );

    await client.query("COMMIT");
    return paymentResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
