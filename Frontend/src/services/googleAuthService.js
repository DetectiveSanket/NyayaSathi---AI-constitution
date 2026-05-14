import api from "./api.js";
import { signInWithGoogle } from "../config/firebase.js";
import { GOOGLE_AUTH_URL } from "../utils/api.js";

/**
 * Firebase popup → backend verifies token → returns app JWT (same contract as email login).
 * Does not persist Firebase tokens; Redux persist stores the app access token.
 */
export async function loginWithGoogle() {
  const idToken = await signInWithGoogle();
  const { data } = await api.post(GOOGLE_AUTH_URL, { idToken });
  const accessToken = data.accessToken || data.token;
  if (!accessToken) {
    throw new Error("No access token returned from server");
  }
  return {
    accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  };
}
