const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ error: "Usuário não encontrado" });
    }
    
    console.log('👤 Usuário encontrado:', {
      id: user.id,
      email: user.email,
      first_login: user.first_login,
      has_reset_token: !!user.reset_token
    });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Senha incorreta para usuário:', email);
      return res.status(403).json({ error: "Senha incorreta" });
    }
    
    console.log('✅ Senha correta para usuário:', email);
    
        
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
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

module.exports = router;
