const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const userService = require("../services/userService");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('🔐 Tentativa de login:', {
      email: email,
      passwordLength: password ? password.length : 0,
      timestamp: new Date().toISOString()
    });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Erro de configuração do servidor" });
    }

    if (!process.env.FIREBASE_WEB_API_KEY) {
      return res.status(500).json({ error: "FIREBASE_WEB_API_KEY não configurada no servidor" });
    }

    const firebaseLoginResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000
      }
    );

    if (!firebaseLoginResponse?.data?.localId) {
      return res.status(401).json({ error: "Falha de autenticação no Firebase" });
    }

    const user = await userService.findOne({ where: { email: email } });
    if (!user) {
      console.log("❌ Usuário autenticado no Firebase, mas ausente no Firestore local:", email);
      return res.status(403).json({ error: "Usuário sem perfil autorizado no sistema" });
    }
    
    console.log('👤 Usuário encontrado:', {
      id: user.id,
      email: user.email,
      first_login: user.first_login,
      firebase_uid: user.firebase_uid || "N/A"
    });
    console.log("✅ Login validado no Firebase para usuário:", email);
    
        
    // Converter occupation_id numérico para string compatível com enum
    const occupationMap = {
      1: 'ADMINISTRADOR',
      2: 'COLABORADOR', 
      3: 'PROFESSOR'
    };
    
    const occupationString = occupationMap[user.occupation_id] || user.occupation_id;
    
    const token = jwt.sign(
      { id: user.id, occupation_id: occupationString }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    if (user.first_login) {
      await userService.update(user.id, { first_login: false });
    }

    console.log('✅ Login bem-sucedido para:', email);

    res.json({ 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        occupation_id: occupationString
      }
    });
  } catch (error) {
    const firebaseErrorMessage = error.response?.data?.error?.message;
    if (firebaseErrorMessage === "EMAIL_NOT_FOUND") {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }
    if (firebaseErrorMessage === "INVALID_PASSWORD") {
      return res.status(403).json({ error: "Senha incorreta" });
    }
    if (firebaseErrorMessage === "USER_DISABLED") {
      return res.status(403).json({ error: "Conta desabilitada" });
    }

    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

module.exports = router;
