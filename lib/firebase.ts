import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Baseline configuration linking to env variables with hardcoded fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD2vvQu4Oxs562IocpT63-G8Zl9xfIt_b0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "noter-9060c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "noter-9060c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "noter-9060c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "2565473342",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:2565473342:web:2e1f63b9f8fa0b04de3d6f",
};

// Auto-detection of mock mode (switches off when active API keys exist)
export const isMockFirebase =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey === "" ||
  firebaseConfig.apiKey === "YOUR_API_KEY";

let app;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (!isMockFirebase) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn("Failed to initialize Firebase, switching to Mock Mode.", error);
  }
}

export { app, auth, db, storage };
