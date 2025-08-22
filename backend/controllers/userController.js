const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendPasswordResetEmail, sendFirstAccessEmail, testConnection } = require("../utils/emailService");

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  let user = await User.findByPk(id);
  user.password = "";
  res.json(user);
};

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll();
  
  // Converter occupation_id numérico para string
  const occupationMap = {
    1: 'ADMINISTRADOR',
    2: 'COLABORADOR', 
    3: 'PROFESSOR'
  };
  
  const usersWithStringOccupation = users.map(user => ({
    ...user.toJSON(),
    occupation_id: occupationMap[user.occupation_id] || user.occupation_id
  }));
  
  res.json(usersWithStringOccupation);
};

exports.editUser = async (req, res) => {
  let { id, name, email, password, occupation_id } = req.body;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: "User não encontrado" });
  }

  // Preparar dados para atualização
  const updateData = {
    id,
    name,
    email,
    occupation_id
  };

  // Só atualizar senha se foi fornecida
  if (password && password.trim() !== '') {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  }

  await user.update(updateData);
  const updatedUser = await User.findByPk(id);
  res.json(updatedUser);
}

exports.createUser = async (req, res) => {
  try {
    const { name, email, occupation_id } = req.body;
    
    // Senha padrão para novos usuários
    const defaultPassword = "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Gerar token para primeiro acesso
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      occupation_id,
      first_login: true,
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });

    // Enviar email de primeiro acesso
    const emailResult = await sendFirstAccessEmail(email, resetToken, name);
    
    if (!emailResult.success) {
      console.error('Erro ao enviar email de primeiro acesso:', emailResult.error);
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      occupation_id: user.occupation_id,
      message: 'Usuário criado com sucesso. Email de primeiro acesso enviado.'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  res.status(204).end();
};

// Solicitar redefinição de senha
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }

    // Gerar token de redefinição
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await user.update({
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });

    // Enviar email de redefinição
    const emailResult = await sendPasswordResetEmail(email, resetToken, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Erro ao enviar email de redefinição' });
    }

    res.json({ message: 'Email de redefinição enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Redefinir senha com token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log('🔄 Tentativa de redefinição de senha:', {
      tokenLength: token ? token.length : 0,
      passwordLength: newPassword ? newPassword.length : 0,
      timestamp: new Date().toISOString()
    });
    
    const user = await User.findOne({ 
      where: { 
        reset_token: token,
        reset_token_expires: { [require('sequelize').Op.gt]: new Date() }
      } 
    });

    if (!user) {
      console.log('❌ Token não encontrado ou expirado:', {
        token: token ? token.substring(0, 10) + '...' : 'null',
        currentTime: new Date().toISOString()
      });
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    console.log('✅ Usuário encontrado para redefinição:', {
      userId: user.id,
      email: user.email,
      first_login: user.first_login
    });

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar token
    await user.update({
      password: hashedPassword,
      first_login: false,
      reset_token: null,
      reset_token_expires: null
    });

    console.log('✅ Senha redefinida com sucesso para usuário:', user.email);

    res.json({ 
      message: 'Senha redefinida com sucesso',
      user: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('�� Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

// Verificar se é primeiro acesso
exports.checkFirstLogin = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ 
      where: { 
        reset_token: token,
        reset_token_expires: { [require('sequelize').Op.gt]: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    res.json({ 
      valid: true, 
      user: { 
        name: user.name, 
        email: user.email,
        first_login: user.first_login 
      } 
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Verificar status de primeiro acesso do usuário
exports.checkUserFirstAccess = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ 
      first_login: user.first_login,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Erro ao verificar primeiro acesso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Testar configuração de email
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Testar conexão primeiro
    const connectionTest = await testConnection();
    if (!connectionTest) {
      return res.status(500).json({ error: 'Falha na conexão com servidor de email' });
    }

    // Enviar email de teste
    const testToken = 'test-token-123';
    const emailResult = await sendPasswordResetEmail(email || 'teste@teste.com', testToken, 'Usuário Teste');
    
    if (emailResult.success) {
      res.json({ message: 'Email de teste enviado com sucesso!' });
    } else {
      res.status(500).json({ error: 'Erro ao enviar email de teste', details: emailResult.error });
    }
  } catch (error) {
    console.error('Erro no teste de email:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};
