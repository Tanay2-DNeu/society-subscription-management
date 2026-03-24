import pool from "../db/pool.js";

/** Active residents only */
export const getAllResidentUserIdsModel = async () => {
  const result = await pool.query(
    `SELECT id FROM users
     WHERE role = 'resident' AND is_active = true`,
  );
  return result.rows.map((r) => r.id);
};

export const getUserIdIfResidentModel = async (userId) => {
  const result = await pool.query(
    `SELECT id FROM users
     WHERE id = $1 AND role = 'resident' AND is_active = true`,
    [userId],
  );
  return result.rows[0]?.id ?? null;
};

export const getUserIdsWithPendingDuesModel = async () => {
  const result = await pool.query(
    `SELECT DISTINCT u.id
     FROM users u
     JOIN flat_assignments fa ON fa.user_id = u.id AND fa.is_current = true
     JOIN monthly_records mr ON mr.flat_id = fa.flat_id
     WHERE mr.status = 'pending'`,
  );
  return result.rows.map((r) => r.id);
};

/**
 * FCM tokens stored by the app in `device_tokens` (see deviceRoutes).
 * No separate firebase_tokens table required.
 */
export const getDeviceTokensForUsersModel = async (userIds) => {
  if (!userIds.length) return [];
  const result = await pool.query(
    `SELECT token FROM device_tokens
     WHERE user_id = ANY($1::int[])
       AND token IS NOT NULL
       AND TRIM(token) <> ''`,
    [userIds],
  );
  return result.rows.map((r) => r.token);
};

export const listNotificationsModel = async () => {
  const result = await pool.query(
    `SELECT id, title, message, sent_at AS created_at
     FROM notifications
     ORDER BY sent_at DESC`,
  );
  return result.rows;
};
