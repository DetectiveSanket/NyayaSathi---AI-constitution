// src/utils/setAuthToken.js
import { setAuthHeader } from "../services/api.js";

/*
    * Call this when you have an access token (e.g. after login or refresh)
    * It sets the default Authorization header for axios.

    🎯 Goal: Make token management reusable.

    After login, you get an access token.
    Now you need to attach that token to all protected routes (/me, /update-profile, etc.)

    This tiny helper file is just a convenience wrapper:

    ✅ So when user logs in:

    setAuthToken(accessToken);


    * and all future API calls automatically carry the token.

    Without this, you’d need to manually add headers.Authorization every time.
 */
export const setAuthToken = (token) => {
  setAuthHeader(token);
};


