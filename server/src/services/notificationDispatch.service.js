import pool from "../db/pool.js";
import admin from "../config/firebase.js";
import {
  getAllResidentUserIdsModel,
  getDeviceTokensForUsersModel,
  getUserIdIfResidentModel,
  getUserIdsWithPendingDuesModel,
} from "../models/notifications.model.js";

const FCM_BATCH = 500;

const sendFcmMulticast = async (tokens, title, body) => {
  if (!tokens.length) return { sent: 0, failed: 0 };

  const messaging = admin.messaging();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < tokens.length; i += FCM_BATCH) {
    const batch = tokens.slice(i, i + FCM_BATCH);
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
      });
      sent += response.successCount;
      failed += response.failureCount;
    } catch (err) {
      console.error("FCM batch error:", err?.message || err);
      failed += batch.length;
    }
  }

  return { sent, failed };
};

/**
 * One row in `notifications` + optional FCM to target users' device tokens.
 * No per-user tracking table — targeting is only used to resolve who gets push.
 */
export const dispatchNotificationService = async ({
  title,
  message,
  targetType,
  userId,
  adminId,
}) => {
  const t = String(title || "").trim();
  const m = String(message || "").trim();

  if (!t) {
    const err = new Error("title is required");
    err.statusCode = 400;
    throw err;
  }
  if (!m) {
    const err = new Error("message is required");
    err.statusCode = 400;
    throw err;
  }

  const tt = String(targetType || "").toLowerCase();
  if (!["all", "user", "pending_dues"].includes(tt)) {
    const err = new Error("targetType must be all, user, or pending_dues");
    err.statusCode = 400;
    throw err;
  }

  let targetUserIds = [];

  if (tt === "all") {
    targetUserIds = await getAllResidentUserIdsModel();
  } else if (tt === "user") {
    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) {
      const err = new Error("userId is required for target user");
      err.statusCode = 400;
      throw err;
    }
    const found = await getUserIdIfResidentModel(uid);
    if (!found) {
      const err = new Error("User not found or not an active resident");
      err.statusCode = 404;
      throw err;
    }
    targetUserIds = [found];
  } else {
    targetUserIds = await getUserIdsWithPendingDuesModel();
  }

  const uniqueIds = [...new Set(targetUserIds)];

  // Schema requires `users_id` to be non-null, so insert one row per recipient.
  // This keeps the API contract (controller still returns `sentTo` and a notification row).
  let notificationRow = null;
  if (uniqueIds.length > 0) {
    const ins = await pool.query(
      `INSERT INTO notifications
         (users_id, title, message, created_by_admin_id, is_read, sent_at)
       SELECT
         unnest($1::int[]),
         $2,
         $3,
         $4,
         false,
         NOW()
       RETURNING id, title, message, sent_at AS created_at`,
      [uniqueIds, t, m, adminId],
    );
    notificationRow = ins.rows[0] ?? null;
  }

  const tokens = await getDeviceTokensForUsersModel(uniqueIds);
  let fcm = { sent: 0, failed: 0 };

  const uniqueTokens = [...new Set(tokens.filter(Boolean))];

  try {
    fcm = await sendFcmMulticast(uniqueTokens, t, m);
  } catch (err) {
    console.error("FCM send error:", err?.message || err);
  }

  return {
    notification: notificationRow,
    sentTo: uniqueIds.length,
    fcm,
  };
};
