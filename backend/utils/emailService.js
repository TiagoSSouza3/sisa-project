const axios = require('axios');
require('dotenv').config();
const { getPasswordResetTemplate, getWelcomeTemplate, getRegistrationNotificationTemplate } = require('./emailTemplates');

const FRONTEND_BASE = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

const isConfigured = () => {
  return !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isConfigured()) {
    throw new Error('Configuração do SendGrid ausente. Defina SENDGRID_API_KEY e SENDGRID_FROM_EMAIL no .env');
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'Sistema SISA' },
    subject,
    content: [
      { type: 'text/html', value: html }
    ]
  };

  try {
    await axios.post(SENDGRID_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return { success: true };
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('Erro ao enviar email via SendGrid Web API:', status, data || error.message);
    return { success: false, error: data || error.message };
  }
};

// Função de "teste de conexão" para Web API: valida apenas presença das variáveis necessárias
const testConnection = async () => {
  const ok = isConfigured();
  if (!ok) {
    console.error('SendGrid não configurado corretamente (verifique SENDGRID_API_KEY e SENDGRID_FROM_EMAIL)');
  }
  return ok;
};

// Enviar email de redefinição de senha
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${FRONTEND_BASE}/reset-password?token=${resetToken}`;
  const html = getPasswordResetTemplate(userName, resetUrl);
  return await sendEmail({ to: email, subject: '🔐 Redefinição de Senha - SISA', html });
};

// Enviar email de primeiro acesso
const sendFirstAccessEmail = async (email, resetToken, userName) => {
  const resetUrl = `${FRONTEND_BASE}/first-access/${resetToken}`;
  const html = getWelcomeTemplate(userName, resetUrl);
  return await sendEmail({ to: email, subject: '🎉 Bem-vindo ao SISA - Defina sua senha', html });
};

// Enviar email de notificação de cadastro
const sendRegistrationNotificationEmail = async (email, userName) => {
  const html = getRegistrationNotificationTemplate(userName, email);
  return await sendEmail({ to: email, subject: '✅ Cadastro Realizado com Sucesso - SISA', html });
};

module.exports = {
  sendPasswordResetEmail,
  sendFirstAccessEmail,
  sendRegistrationNotificationEmail,
  testConnection
};
