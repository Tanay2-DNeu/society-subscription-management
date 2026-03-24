import { getToken } from "firebase/messaging";
import { messaging } from "./firesbase";
import axios from "@/lib/axios";

export const initPushNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    console.log("FCM Token:", token);

    // send token to backend
    await axios.post("/save-token", { token });
  } catch (error) {
    console.error("Push init error:", error);
  }
};
