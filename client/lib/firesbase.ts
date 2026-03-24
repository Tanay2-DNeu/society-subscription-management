import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB0z7BhGnu-Pa2PUKVXrKpUTkZ_TyPEYAs",
  authDomain: "society-60d17.firebaseapp.com",
  projectId: "society-60d17",
  storageBucket: "society-60d17.firebasestorage.app",
  messagingSenderId: "971069490893",
  appId: "1:971069490893:web:cde3022159af30050d4b84",
  measurementId: "G-B7HEPNSXKM",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
