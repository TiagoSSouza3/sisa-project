const nodemailer = require('nodemailer');
const { getPasswordResetTemplate, getWelcomeTemplate } = require('./emailTemplates');
require('dotenv').config();

// Configuração do transporter de email
const createTransporter = () => {
  // Configuração para Gmail com Senha de App
  const config = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  // Log da configuração (sem mostrar a senha)
  console.log('📧 Configuração de email:', {
    service: config.service,
    host: config.host,
    port: config.port,
    user: config.auth.user,
    passwordLength: config.auth.pass ? config.auth.pass.length : 0
  });

  return nodemailer.createTransport(config);
};

// Função para testar a conexão
const testConnection = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('✅ Servidor de email conectado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com servidor de email:', error.message);
    return false;
  }
};

// Enviar email de redefinição de senha
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Sistema SISA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Redefinição de Senha - SISA',
    html: getPasswordResetTemplate(userName, resetUrl),
    encoding: 'utf8'
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

// Enviar email de primeiro acesso
const sendFirstAccessEmail = async (email, resetToken, userName) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/first-access?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Sistema SISA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Bem-vindo ao SISA - Defina sua senha',
    html: getWelcomeTemplate(userName, resetUrl),
    encoding: 'utf8'
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendFirstAccessEmail,
  testConnection
};