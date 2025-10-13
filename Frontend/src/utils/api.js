
//* Default API URL
export const API_URL = 'http://localhost:5000/api/v1/';

//^ User related endpoints
export const REGISTER_URL = `${API_URL}user/register`;
export const LOGIN_URL = `${API_URL}user/login`;
export const LOGOUT_URL = `${API_URL}user/logout`;
export const REFRESH_TOKEN_URL = `${API_URL}user/refresh-token`;
export const FORGOT_PASSWORD_URL = `${API_URL}user/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}user/reset-password`;
export const VERIFY_EMAIL_URL = `${API_URL}user/verify-email`;
export const RESEND_OTP_URL = `${API_URL}user/resend-otp`;
export const GET_USER_PROFILE_URL = `${API_URL}user/me`;
export const UPDATE_USER_PROFILE_URL = `${API_URL}user/me`;

/* 
⁡⁢⁣⁣𝗘𝘅𝗮𝗺𝗽𝗹𝗲 𝘂𝘀𝗮𝗴𝗲 𝗶𝗻 𝗮 𝗥𝗲𝗮𝗰𝘁 𝗰𝗼𝗺𝗽𝗼𝗻𝗲𝗻𝘁:⁡
    ⁡⁢⁢⁢import { LOGIN_URL } from "../api"; // Adjust the path as necessary
    import axios from "axios";

    await axios.post(LOGIN_URL, { email, password });⁡
*/