import { dispatchNotificationService } from "../services/notificationDispatch.service.js";
import { listNotificationsModel } from "../models/notifications.model.js";

export const sendAdminNotification = async (req, res) => {
  try {
    const { title, message, targetType, userId } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await dispatchNotificationService({
      title,
      message,
      targetType,
      userId,
      adminId,
    });

    res.status(201).json({
      success: true,
      sentTo: result.sentTo,
      notification: result.notification,
      fcm: result.fcm,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to send notification",
    });
  }
};

export const listAdminNotifications = async (req, res) => {
  try {
    const rows = await listNotificationsModel();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
