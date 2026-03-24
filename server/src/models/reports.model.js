import pool from "../db/pool.js";

export const getAdminReportsModel = async (month, year) => {
  // Payments are stored against monthly_records via monthly_record_id.
  // For financial metrics we use monthly_records.status (paid/pending).
  // For payment modes we break down *paid* payments by payment_mode.
  const totals = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN mr.status = 'paid' THEN mr.amount_due ELSE 0 END), 0)::double precision AS "paidAmount",
      COALESCE(SUM(CASE WHEN mr.status = 'pending' THEN mr.amount_due ELSE 0 END), 0)::double precision AS "pendingAmount",
      COALESCE(SUM(mr.amount_due), 0)::double precision AS "totalCollection"
     FROM monthly_records mr
     WHERE mr.month = $1 AND mr.year = $2`,
    [month, year],
  );

  const paymentModes = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN p.payment_mode = 'cash' THEN p.amount ELSE 0 END), 0)::double precision AS cash,
      COALESCE(SUM(CASE WHEN p.payment_mode = 'upi' THEN p.amount ELSE 0 END), 0)::double precision AS upi,
      COALESCE(SUM(CASE WHEN p.payment_mode = 'online' THEN p.amount ELSE 0 END), 0)::double precision AS online
     FROM payments p
     INNER JOIN monthly_records mr ON mr.id = p.monthly_record_id
     WHERE mr.month = $1
       AND mr.year = $2
       AND mr.status = 'paid'
       AND p.status = 'approved'`,
    [month, year],
  );

  const t = totals.rows[0] || {
    paidAmount: 0,
    pendingAmount: 0,
    totalCollection: 0,
  };
  const pm = paymentModes.rows[0] || { cash: 0, upi: 0, online: 0 };

  return {
    totalCollection: Number(t.totalCollection) || 0,
    paidAmount: Number(t.paidAmount) || 0,
    pendingAmount: Number(t.pendingAmount) || 0,
    paymentModes: {
      cash: Number(pm.cash) || 0,
      upi: Number(pm.upi) || 0,
      online: Number(pm.online) || 0,
    },
  };
};

