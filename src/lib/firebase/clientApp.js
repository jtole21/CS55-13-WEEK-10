"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getFirebaseConfig } from "@/src/lib/firebase/config";

function getClientConfig() {
  const config = getFirebaseConfig();
  if (config) {
    return config;
  }
  // Preview mode still loads the header, which constructs a Firebase app.
  // The placeholder config is never used for reads when preview mode is on.
  if (process.env.NEXT_PUBLIC_SHELFSIDE_PREVIEW === "1") {
    return {
      apiKey: "preview",
      authDomain: "preview.firebaseapp.com",
      projectId: "preview",
      storageBucket: "preview.appspot.com",
      messagingSenderId: "0",
      appId: "1:0:web:preview",
    };
  }
  return undefined;
}

// Local development passes the web app config from .env.local.
// App Hosting leaves that config empty, and initializeApp() fills it in.
// https://firebase.google.com/docs/app-hosting/firebase-sdks#initialize-with-no-arguments
export const firebaseApp = getApps().some((app) => app.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(getClientConfig());

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Point the browser SDK at the local emulators when that mode is enabled.
if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1") {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  } catch {
    // Hot reload can evaluate this module again after the emulators are connected.
  }
}
