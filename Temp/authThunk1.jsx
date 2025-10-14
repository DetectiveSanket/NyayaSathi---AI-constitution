// src/features/auth/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthHeader } from "../../services/api.js";

/**
    * Important: backend responses assumed from earlier conversations.
    * Adjust paths or response destructuring if your backend returns different shapes.
 */

// Register (creates user and triggers OTP email)
export const registerUser = createAsyncThunk(
    "auth/register",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/user/register", payload);
            return { message: data.message, email: payload.email };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


// Verify Email OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/verify-email", { email, otp });
      return data; // { message, token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Resend OTP
export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/resend-otp", { email });
      return data; // { message }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/user/login", { email, password });
            // backend: { accessToken, refreshToken }
            const { accessToken } = data;
            // set header to fetch profile
            setAuthHeader(accessToken);

            // get profile
            const profileResp = await api.get("/user/me");
            return {
                user: profileResp.data,
                token: accessToken,
                refreshToken: data.refreshToken,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);



// Logout
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            // attempt to call backend to clear refresh token
            await api.post("/user/logout");
            // Clear local axios header
            setAuthHeader(null);
            return { message: "Logged out" };
        } catch (err) {
            // even if backend fails, continue to clear client
            setAuthHeader(null);
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Refresh access token using refresh token (client can store refresh in cookie or in store)
export const refreshAccessToken = createAsyncThunk(
    "auth/refreshToken",
    async ({ refreshToken }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/user/refresh-token", { token: refreshToken });
            // backend returns { accessToken }
            setAuthHeader(data.accessToken);
            // fetch profile
            const profileResp = await api.get("/user/me");
            return { token: data.accessToken, user: profileResp.data };
        } catch (err) {
        setAuthHeader(null);
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Forgot password (send OTP)
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/forgot-password", { email });
      return { message: data.message, email };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Reset password (using OTP)
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/reset-password", { email, otp, newPassword });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch profile (explicit)
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/me");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update profile (optionally with avatar FormData)
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      // formData can be FormData(), with avatar file appended if used
      const { data } = await api.put("/api/users/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


/* 
   ## ⁡⁢⁣⁣𝗮𝘂𝘁𝗵𝗧𝗵𝘂𝗻𝗸𝘀.𝗷𝘀 → (𝗔𝘀𝘆𝗻𝗰 𝗢𝗽𝗲𝗿𝗮𝘁𝗶𝗼𝗻𝘀)⁡

        - Now here’s the most important file — and the one that looks scary at first.

        -> Let’s make it simple.

        🎯 Goal:
            * Handle async operations (like register, login, fetchProfile, etc.)
            * in a way that connects to Redux state automatically.

            ⁡⁣⁢⁣In plain words:⁡

                - A thunk is a fancy word for a “function that performs an async task, then updates Redux”.

                ⁡⁣⁣⁢Example (real-world flow):⁡

                ⁡⁢⁢⁢<> User clicks “Login”.
                <> You send API call → POST /login.
                <> Wait for server response.
                <> If success → store user + token in Redux.
                <> If error → show error message.⁡

            * Instead of writing this logic inside your components, you move it to thunks → centralized, reusable, testable.

    🧠 Example
    ? ⁡⁣⁢⁢Without Redux (component way):
        ⁡⁢⁢⁢const handleLogin = async () => {
            try {
                const { data } = await axios.post("/api/login", { email, password });
                setUser(data.user);
                localStorage.setItem("token", data.token);
            } catch (error) {
                alert(error.message);
            }
        };⁡
     
   ? With Redux Thunk:
        ⁡⁢⁢⁢export const loginUser = createAsyncThunk(
            "auth/login",
                async ({ email, password }, { rejectWithValue }) => {
                try {
                    const { data } = await api.post(LOGIN_URL, { email, password });
                    return data; // success -> goes to slice (fulfilled)
                } catch (err) {
                    return rejectWithValue(err.response.data.message); // error -> goes to slice (rejected)
                }
            }
        );⁡

    ✅ ⁡⁣⁢⁣createAsyncThunk automatically generates 3 states for every async action:⁡

        & pending → when the request starts
        & fulfilled → when it succeeds
        & rejected → when it fails
        
        * You don’t have to write manual loading logic anymore — Redux handles it.
        
        _________________________________________________________________⁡

   💡⁡⁢⁣⁣𝗪𝗵𝘆 𝘀𝗼 𝗺𝗮𝗻𝘆 𝘁𝗵𝘂𝗻𝗸𝘀?⁡

        ⁡⁣⁢⁣Each backend route has a separate purpose:⁡

            - registerUser → signup
            - verifyOtp → verify email OTP
            - loginUser → login
            - forgotPassword → send OTP
            - resetPassword → new password
            - fetchProfile → get logged-in user
            - updateProfile → update name/avatar
            - logoutUser → logout

        * You can think of thunks as controllers for the frontend — each one corresponds to a backend API endpoint.
    _________________________________________________________________⁡
    
    🔄 How They All Connect
        | File              | Responsibility          | Example                           |
        | ----------------- | ----------------------- | --------------------------------- |
        | `api.js`          | Talks to backend        | Axios setup                       |
        | `setAuthToken.js` | Attach JWT              | Keeps user logged in              |
        | `authThunks.js`   | Perform async calls     | Register/Login/Logout             |
        | `authSlice.js`    | Manage state & reducers | Store user, token, loading, error |

    _________________________________________________________________⁡
    
    ⁡⁢⁣⁣𝗦𝗼 𝘁𝗵𝗲 𝗱𝗮𝘁𝗮 𝗳𝗹𝗼𝘄 𝗹𝗼𝗼𝗸𝘀 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀:⁡
      UI
        Component (e.g. LoginForm)
            ↓ dispatch(loginUser({email, password}))
        authThunks.js → sends API call
            ↓
        authSlice.js → handles pending/fulfilled/rejected
            ↓
        Redux Store updated → UI re-renders automatically
    _________________________________________________________________⁡
 
 ⚡⁡⁢⁣⁣ In short⁡
        | File                | What it does                      | Why we need it                              |
        | ------------------- | --------------------------------- | ------------------------------------------- |
        | **api.js**          | Axios setup (base URL, token)     | So we don’t repeat code for every API call  |
        | **setAuthToken.js** | Manage Authorization header       | Keeps all future API requests authenticated |
        | **authThunks.js**   | Perform API calls via Redux       | Centralized async logic                     |
        | **authSlice.js**    | Store user, token, error, loading | Keeps UI in sync with authentication state  |

    ---------------------------------------------------------------------------------------------------    
    
   ⚙️ ⁡⁢⁣⁣𝗗𝗮𝘁𝗮 𝗙𝗹𝗼𝘄: 𝗨𝗜 → 𝗥𝗲𝗱𝘂𝘅 → 𝗕𝗮𝗰𝗸𝗲𝗻𝗱 → 𝗥𝗲𝗱𝘂𝘅 → 𝗨𝗜⁡

        ┌──────────────────────────────┐
        │        React UI Layer        │
        │ (e.g., Login / Register Form)│
        └──────────────┬───────────────┘
                       │ dispatch(loginUser(formData))
                       ▼
        ┌──────────────────────────┐
        │   Redux Thunk Layer      │
        │  (authThunks.js)         │
        │ - Makes async API calls  │
        │ - Handles try/catch      │
        └──────────────┬───────────┘
                       │ calls
                       ▼
            ┌─────────────────────┐
            │   Axios Service     │
            │   (api.js)          │
            │ - Uses BASE_URL     │
            │ - Sends HTTP req.   │
            │ - Adds JWT header   │
            └──────────┬──────────┘
                       │ hits backend route
                       ▼
             ┌────────────────────┐
             │    Backend API     │
             │  (Express Server)  │
             │ - Validates req    │
             │ - Authenticates    │
             │ - Responds w/ JSON │
             └──────────┬─────────┘
                        │ response (user, token, msg)
                        ▼
          ┌──────────────────────────┐
          │ Redux Slice Layer        │
          │ (authSlice.js)           │
          │ - Handles 3 states:      │
          │   pending → fulfilled →  │
          │   rejected               │
          │ - Updates store values   │
          │   user, token, error,    │
          │   loading, message       │
          └───────────┬─────────────┘
                      │ store updates
                      ▼
       ┌────────────────────────────────┐
       │   Redux Store (Global State)   │
       │ - Keeps user/token globally    │
       │ - Persisted via redux-persist  │
       └─────────────┬──────────────────┘
                     │ triggers re-render
                     ▼
     ┌───────────────────────────────────┐
     │ React Components Auto-Update UI   │
     │ - Navbar shows user avatar        │
     │ - Chatbot unlocks access          │
     │ - Loader stops                    │
     │ - Error toast if failed           │
     └───────────────────────────────────┘

     🔁 Example Cycle (Login)

UI → User enters email/password → dispatch(loginUser(formData))

Thunk (authThunks.js) → sends request to backend via Axios.

api.js → attaches JWT and sends to POST /api/v1/user/login.

Backend → validates credentials, returns { user, accessToken }.

authSlice.js → catches fulfilled state → updates store:

user = data.user

token = data.accessToken

isAuthenticated = true

Redux Store → now has updated state, saved in localStorage via redux-persist.

UI Re-renders automatically:

Navbar changes to show user avatar.

Chatbot UI unlocks.

“Login” page redirects to home/dashboard.

🔒 Example Cycle (Logout)

UI → dispatch(logoutUser())

Thunk → calls POST /logout on backend.

Slice → clears user/token → isAuthenticated = false.

Store → re-renders app, hiding protected routes.

🧠 Why This Structure Works

✅ Centralized logic — API details stay in one place.
✅ Predictable data flow — everything passes through Redux, not random components.
✅ Debuggable — you can see every action in Redux DevTools.
✅ Scalable — you can add more slices (chat, UI theme, settings) without breaking others.

*/