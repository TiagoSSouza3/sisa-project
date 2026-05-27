const axios = require("axios");
require("dotenv").config();

const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;
const FIREBASE_AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode";
const FRONTEND_BASE = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

const isConfigured = () => !!FIREBASE_WEB_API_KEY;

const sendFirebasePasswordEmail = async (email) => {
  if (!isConfigured()) {
    throw new Error("Configuração ausente. Defina FIREBASE_WEB_API_KEY no .env");
  }

  const payload = {
    requestType: "PASSWORD_RESET",
    email
  };

  if (FRONTEND_BASE) {
    payload.continueUrl = `${FRONTEND_BASE}/`;
  }

  try {
    await axios.post(`${FIREBASE_AUTH_BASE_URL}?key=${FIREBASE_WEB_API_KEY}`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });
    return { success: true };
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error("Erro ao enviar email via Firebase Auth:", status, data || error.message);
    return { success: false, error: data || error.message };
  }
};

const testConnection = async () => {
  const ok = isConfigured();
  if (!ok) {
    console.error("Firebase Auth não configurado corretamente (verifique FIREBASE_WEB_API_KEY)");
  }
  return ok;
};

const sendPasswordResetEmail = async (email) => {
  return sendFirebasePasswordEmail(email);
};

const sendFirstAccessEmail = async (email) => {
  return sendFirebasePasswordEmail(email);
};

const sendRegistrationNotificationEmail = async () => {
  return { success: true };
};

module.exports = {
  sendPasswordResetEmail,
  sendFirstAccessEmail,
  sendRegistrationNotificationEmail,
  testConnection
};
