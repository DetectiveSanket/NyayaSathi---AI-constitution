import admin from "firebase-admin";

let initialized = false;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw || typeof raw !== "string") {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT must be valid JSON");
    return null;
  }
}

const serviceAccount = getServiceAccount();

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
}

export const firebaseAdminReady = initialized;

if (!initialized && !admin.apps.length) {
  console.warn(
    "Firebase Admin not initialized: set FIREBASE_SERVICE_ACCOUNT (JSON string) on the server."
  );
}

export default admin;
