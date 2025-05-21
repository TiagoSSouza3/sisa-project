const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Erro de configuração do servidor" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(403).json({ error: "Senha incorreta" });

    const token = jwt.sign(
      { id: user.id, occupation_id: user.occupation_id }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

module.exports = router;
