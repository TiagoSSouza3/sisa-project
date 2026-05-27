const userService = require("../services/userService");
const { sendPasswordResetEmail, sendFirstAccessEmail, testConnection } = require("../utils/emailService");
require("../config/firebase");
const admin = require("firebase-admin");

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await userService.findPk(id);
  user.password = "";
  res.json(user);
};

exports.getAllUsers = async (req, res) => {
  const users = await userService.getAll();
  
  // Converter occupation_id numérico para string
  const occupationMap = {
    1: 'ADMINISTRADOR',
    2: 'COLABORADOR', 
    3: 'PROFESSOR'
  };
  
  const usersWithStringOccupation = users.map((user) => ({
    ...user,
    occupation_id: occupationMap[user.occupation_id] || user.occupation_id
  }));
  
  res.json(usersWithStringOccupation);
};

exports.editUser = async (req, res) => {
  let { id, name, email, password, occupation_id } = req.body;
  const user = await userService.findPk(id);

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

  if (user.firebase_uid) {
    const authUpdateData = {};
    if (email && email !== user.email) authUpdateData.email = email;
    if (name && name !== user.name) authUpdateData.displayName = name;
    if (password && password.trim() !== "") authUpdateData.password = password;
    if (Object.keys(authUpdateData).length > 0) {
      await admin.auth().updateUser(user.firebase_uid, authUpdateData);
    }
  }

  if (password && password.trim() !== "") {
    updateData.first_login = false;
  }

  await userService.update(user, updateData);
  const updatedUser = await userService.findPk(id);
  res.json(updatedUser);
}

exports.createUser = async (req, res) => {
  try {
    const { name, email, occupation_id } = req.body;

    const existingUser = await userService.findOneByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Já existe um usuário com este email" });
    }

    const temporaryPassword = Math.random().toString(36).slice(-12) + "A1!";

    const authUser = await admin.auth().createUser({
      email,
      password: temporaryPassword,
      displayName: name,
      emailVerified: false
    });

    const user = await userService.create({
      name,
      email,
      occupation_id,
      first_login: true,
      firebase_uid: authUser.uid
    });

    // Disparar email de primeiro acesso em background (não bloquear a resposta)
    sendFirstAccessEmail(email)
      .then((emailResult) => {
        if (!emailResult.success) {
          console.error('Erro ao enviar email de primeiro acesso:', emailResult.error);
        }
      })
      .catch((error) => {
        console.error('Erro ao enviar email de primeiro acesso (async):', error);
      });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      occupation_id: user.occupation_id,
      message: 'Usuário criado com sucesso. Email de definição de senha enviado pelo Firebase.'
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email já cadastrado no Firebase Authentication" });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await userService.destroy(id);
  res.status(204).end();
};

// Solicitar redefinição de senha
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await userService.findOneByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }

    const emailResult = await sendPasswordResetEmail(email);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Erro ao enviar email de redefinição' });
    }

    res.json({ message: 'Email de redefinição enviado com sucesso via Firebase' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Redefinir senha com token
exports.resetPassword = async (req, res) => {
  try {
    return res.status(410).json({
      error: "Este endpoint foi descontinuado. Use o link de redefinição de senha enviado pelo Firebase."
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

// Verificar se é primeiro acesso
exports.checkFirstLogin = async (req, res) => {
  try {
    return res.status(410).json({
      error: "Validação por token local foi descontinuada. Use o fluxo de reset do Firebase."
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
    
    const user = await userService.findPk(id);
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
