// Email Templates - SISA System
// Clean, modern design using CSS classes for better maintainability
// CSS styles are now organized in separate files in frontend/src/styles/

const getPasswordResetTemplate = (userName, resetUrl) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - SISA</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #ffffff;
      line-height: 1.8;
    }

    .email-container {
      max-width: 700px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 3px solid #2563eb;
      border-radius: 15px;
      overflow: hidden;
    }

    .email-header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 60px 40px;
      text-align: center;
    }

    .system-name {
      color: #ffffff;
      margin: 0 0 15px 0;
      font-size: 48px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 3px;
    }

    .email-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 36px;
      font-weight: bold;
    }

    .email-content {
      padding: 60px 40px;
    }

    .email-content h2 {
      color: #000000;
      margin: 0 0 30px;
      font-size: 32px;
      font-weight: bold;
    }

    .email-content p {
      color: #000000;
      font-size: 22px;
      margin: 0 0 40px;
      line-height: 1.8;
      font-weight: 500;
    }

    .important-notice {
      background-color: #fef2f2;
      border: 3px solid #dc2626;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
      text-align: center;
    }

    .important-notice h3 {
      color: #dc2626;
      margin: 0 0 15px;
      font-size: 26px;
      font-weight: bold;
    }

    .important-notice p {
      color: #000000;
      margin: 0;
      font-size: 22px;
      line-height: 1.8;
      font-weight: bold;
    }

    .cta-container {
      text-align: center;
      margin: 50px 0;
    }

    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      text-decoration: none;
      padding: 25px 50px;
      border-radius: 12px;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      border: 3px solid #047857;
    }

    .info-card {
      background-color: #fef3c7;
      border: 3px solid #f59e0b;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
    }

    .info-card h3 {
      color: #000000;
      margin: 0 0 15px;
      font-size: 24px;
      font-weight: bold;
    }

    .info-card p {
      color: #000000;
      margin: 0;
      font-size: 20px;
      line-height: 1.8;
      font-weight: 500;
    }

    .security-tip {
      background-color: #e0f2fe;
      border: 3px solid #0284c7;
      padding: 30px;
      margin: 40px 0;
      border-radius: 12px;
    }

    .security-tip p {
      color: #000000;
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .email-footer {
      background-color: #f3f4f6;
      border-top: 3px solid #d1d5db;
      padding: 40px;
      text-align: center;
    }

    .email-footer p:first-child {
      color: #000000;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .email-footer p:last-child {
      color: #374151;
      margin: 15px 0 0;
      font-size: 16px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="system-name">SISTEMA SISA</div>
      <h1>Redefinir Senha</h1>
    </div>

    <!-- Content -->
    <div class="email-content">
      <!-- Important Notice -->
      <div class="important-notice">
        <h3>📖 LEIA TODO O EMAIL</h3>
        <p>
          É MUITO IMPORTANTE que você leia este email completamente para garantir seu acesso correto ao sistema!
        </p>
      </div>

      <h2>Olá, ${userName}!</h2>
      
      <p>
        Recebemos uma solicitação para redefinir a senha da sua conta no SISTEMA SISA.
      </p>

      <p>
        <strong>PARA ACESSAR O SISTEMA:</strong> Você deve <strong>CLICAR</strong> no botão verde abaixo. Isso irá abrir uma página onde você poderá criar uma nova senha segura.
      </p>

      <!-- CTA Button -->
      <div class="cta-container">
        <a href="${resetUrl}" class="cta-button">
          ➤ CLIQUE AQUI PARA REDEFINIR SENHA
        </a>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <h3>⚠️ IMPORTANTE</h3>
        <p>
          Este link é válido por <strong>1 HORA</strong>. Se não conseguir usá-lo a tempo, solicite uma nova redefinição.
        </p>
      </div>

      <!-- Security Tip -->
      <div class="security-tip">
        <p>
          <strong>DICA DE SEGURANÇA:</strong> Se você não solicitou esta redefinição, pode ignorar este email. Sua senha atual permanecerá inalterada.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>
        © ${new Date().getFullYear()} SISTEMA SISA - Todos os direitos reservados
      </p>
      <p>
        Este é um email automático. Não responda a esta mensagem.
      </p>
    </div>
  </div>
</body>
</html>`;
};

const getWelcomeTemplate = (userName, resetUrl) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao SISA</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #ffffff;
      line-height: 1.8;
    }

    .email-container {
      max-width: 700px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 3px solid #059669;
      border-radius: 15px;
      overflow: hidden;
    }

    .email-header {
      background: linear-gradient(135deg, #047857 0%, #10b981 100%);
      padding: 60px 40px;
      text-align: center;
    }

    .system-name {
      color: #ffffff;
      margin: 0 0 15px 0;
      font-size: 48px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 3px;
    }

    .email-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 36px;
      font-weight: bold;
    }

    .email-content {
      padding: 60px 40px;
    }

    .email-content h2 {
      color: #000000;
      margin: 0 0 30px;
      font-size: 32px;
      font-weight: bold;
    }

    .email-content p {
      color: #000000;
      font-size: 22px;
      margin: 0 0 40px;
      line-height: 1.8;
      font-weight: 500;
    }

    .cta-container {
      text-align: center;
      margin: 50px 0;
    }

    .important-notice {
      background-color: #fef2f2;
      border: 3px solid #dc2626;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
      text-align: center;
    }

    .important-notice h3 {
      color: #dc2626;
      margin: 0 0 15px;
      font-size: 26px;
      font-weight: bold;
    }

    .important-notice p {
      color: #000000;
      margin: 0;
      font-size: 22px;
      line-height: 1.8;
      font-weight: bold;
    }

    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      text-decoration: none;
      padding: 25px 50px;
      border-radius: 12px;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      border: 3px solid #047857;
    }

    .time-card {
      background-color: #e0f2fe;
      border: 3px solid #0284c7;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
    }

    .time-card h3 {
      color: #000000;
      margin: 0 0 15px;
      font-size: 24px;
      font-weight: bold;
    }

    .time-card p {
      color: #000000;
      margin: 0;
      font-size: 20px;
      line-height: 1.8;
      font-weight: 500;
    }

    .steps-card {
      background-color: #f0fdf4;
      border: 3px solid #10b981;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
    }

    .steps-card h3 {
      color: #000000;
      margin: 0 0 20px;
      font-size: 24px;
      font-weight: bold;
    }

    .steps-card ol {
      color: #000000;
      margin: 0;
      padding-left: 30px;
      font-size: 20px;
      font-weight: 500;
    }

    .steps-card li {
      margin-bottom: 15px;
      line-height: 1.8;
    }

    .help-tip {
      background-color: #fef3c7;
      border: 3px solid #f59e0b;
      padding: 30px;
      margin: 40px 0;
      border-radius: 12px;
    }

    .help-tip p {
      color: #000000;
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      line-height: 1.8;
    }

    .email-footer {
      background-color: #f3f4f6;
      border-top: 3px solid #d1d5db;
      padding: 40px;
      text-align: center;
    }

    .email-footer p:first-child {
      color: #000000;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .email-footer p:last-child {
      color: #374151;
      margin: 15px 0 0;
      font-size: 16px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="system-name">SISTEMA SISA</div>
      <h1>Bem-vindo!</h1>
    </div>

    <!-- Content -->
    <div class="email-content">
      <!-- Important Notice -->
      <div class="important-notice">
        <h3>📖 LEIA TODO O EMAIL</h3>
        <p>
          É MUITO IMPORTANTE que você leia este email completamente para garantir seu acesso correto ao sistema!
        </p>
      </div>

      <h2>Olá, ${userName}!</h2>
      
      <p>
        Sua conta foi criada com sucesso no SISTEMA SISA! Para começar a usar todas as funcionalidades, 
        você precisa definir sua senha pessoal.
      </p>

      <p>
        <strong>PARA ACESSAR O SISTEMA:</strong> Você deve <strong>CLICAR</strong> no botão verde abaixo. Isso irá abrir uma página onde você poderá definir sua senha de acesso.
      </p>

      <!-- CTA Button -->
      <div class="cta-container">
        <a href="${resetUrl}" class="cta-button">
          ➤ CLIQUE AQUI PARA DEFINIR SENHA
        </a>
      </div>

      <!-- Time Info Card -->
      <div class="time-card">
        <h3>⏰ PRAZO PARA ATIVAÇÃO</h3>
        <p>
          Este link é válido por <strong>24 HORAS</strong>. Após esse período, você pode usar a opção <strong>"ESQUECI MINHA SENHA"</strong> na tela de login para gerar um novo link.
        </p>
      </div>

      <!-- Steps -->
      <div class="steps-card">
        <h3>COMO ACESSAR O SISTEMA:</h3>
        <ol>
          <li><strong>OPÇÃO 1:</strong> Se você recebeu uma senha padrão do administrador, faça login com ela</li>
          <li><strong>OPÇÃO 2:</strong> Clique no botão "DEFINIR MINHA SENHA" acima</li>
          <li><strong>OPÇÃO 3:</strong> Acesse a tela de login e clique em "ESQUECI MINHA SENHA"</li>
          <li>Crie uma senha segura (mínimo 6 caracteres)</li>
          <li>Confirme sua nova senha</li>
          <li>Faça login no sistema com seu email e nova senha</li>
        </ol>
      </div>

      <!-- Help Tip -->
      <div class="help-tip">
        <p>
          <strong>💡 NÃO SABE QUAL SENHA USAR?</strong> Se o administrador não informou uma senha padrão, 
          use a opção "ESQUECI MINHA SENHA" na tela de login. Você receberá um novo link para definir sua senha.
          <br><br>
          <strong>⚠️ IMPORTANTE:</strong> Se você fizer login com uma senha padrão, o sistema solicitará que você a altere por segurança.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>
        © ${new Date().getFullYear()} SISTEMA SISA - Todos os direitos reservados
      </p>
      <p>
        Este é um email automático. Não responda a esta mensagem.
      </p>
    </div>
  </div>
</body>
</html>`;
};

const getRegistrationNotificationTemplate = (userName, userEmail) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro Realizado - SISA</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #ffffff;
      line-height: 1.8;
    }

    .email-container {
      max-width: 700px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 3px solid #10b981;
      border-radius: 15px;
      overflow: hidden;
    }

    .email-header {
      background: linear-gradient(135deg, #047857 0%, #10b981 100%);
      padding: 60px 40px;
      text-align: center;
    }

    .system-name {
      color: #ffffff;
      margin: 0 0 15px 0;
      font-size: 48px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 3px;
    }

    .email-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 36px;
      font-weight: bold;
    }

    .email-content {
      padding: 60px 40px;
    }

    .important-notice {
      background-color: #fef2f2;
      border: 3px solid #dc2626;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
      text-align: center;
    }

    .important-notice h3 {
      color: #dc2626;
      margin: 0 0 15px;
      font-size: 26px;
      font-weight: bold;
    }

    .important-notice p {
      color: #000000;
      margin: 0;
      font-size: 22px;
      line-height: 1.8;
      font-weight: bold;
    }

    .success-icon {
      text-align: center;
      margin: 40px 0;
    }

    .success-icon div {
      display: inline-block;
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      color: white;
      margin: 0 auto;
      border: 4px solid #047857;
    }

    .email-content h2 {
      color: #000000;
      margin: 0 0 30px;
      font-size: 32px;
      font-weight: bold;
      text-align: center;
    }

    .email-content p {
      color: #000000;
      font-size: 22px;
      margin: 0 0 40px;
      line-height: 1.8;
      font-weight: 500;
      text-align: center;
    }

    .info-card {
      background-color: #f0fdf4;
      border: 3px solid #10b981;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
    }

    .info-card h3 {
      color: #000000;
      margin: 0 0 15px;
      font-size: 24px;
      font-weight: bold;
    }

    .info-card p {
      color: #000000;
      margin: 0;
      font-size: 20px;
      line-height: 1.8;
      font-weight: 500;
    }

    .user-details {
      background-color: #e0f2fe;
      border: 3px solid #0284c7;
      border-radius: 12px;
      padding: 30px;
      margin: 40px 0;
    }

    .user-details h3 {
      color: #000000;
      margin: 0 0 20px;
      font-size: 24px;
      font-weight: bold;
    }

    .user-details .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 2px solid #0284c7;
    }

    .user-details .detail-row:last-child {
      border-bottom: none;
    }

    .user-details .detail-label {
      color: #000000;
      font-size: 20px;
      font-weight: bold;
    }

    .user-details .detail-value {
      color: #000000;
      font-size: 20px;
      font-weight: 500;
    }

    .next-steps {
      background-color: #fef3c7;
      border: 3px solid #f59e0b;
      padding: 30px;
      margin: 40px 0;
      border-radius: 12px;
    }

    .next-steps h3 {
      color: #000000;
      margin: 0 0 20px;
      font-size: 24px;
      font-weight: bold;
    }

    .next-steps p {
      color: #000000;
      margin: 0;
      font-size: 20px;
      line-height: 1.8;
      font-weight: 500;
    }

    .email-footer {
      background-color: #f3f4f6;
      border-top: 3px solid #d1d5db;
      padding: 40px;
      text-align: center;
    }

    .email-footer p:first-child {
      color: #000000;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .email-footer p:last-child {
      color: #374151;
      margin: 15px 0 0;
      font-size: 16px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="system-name">SISTEMA SISA</div>
      <h1>Cadastro Realizado</h1>
    </div>

    <!-- Content -->
    <div class="email-content">
      <!-- Important Notice -->
      <div class="important-notice">
        <h3>📖 LEIA TODO O EMAIL</h3>
        <p>
          É MUITO IMPORTANTE que você leia este email completamente para garantir seu acesso correto ao sistema!
        </p>
      </div>

      <div class="success-icon">
        <div>✓</div>
      </div>

      <h2>Parabéns, ${userName}!</h2>
      
      <p>
        Seu cadastro foi realizado com sucesso no SISTEMA SISA! Agora você tem acesso a todas as funcionalidades da plataforma.
      </p>

      <!-- Info Card -->
      <div class="info-card">
        <h3>✅ CADASTRO CONFIRMADO</h3>
        <p>
          Sua conta foi criada e está pronta para uso. Você receberá em breve um email com instruções para definir sua senha de acesso.
        </p>
      </div>

      <!-- User Details -->
      <div class="user-details">
        <h3>DETALHES DA CONTA</h3>
        <div class="detail-row">
          <span class="detail-label">NOME:</span>
          <span class="detail-value">${userName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">EMAIL:</span>
          <span class="detail-value">${userEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">DATA DE CADASTRO:</span>
          <span class="detail-value">${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="next-steps">
        <h3>PRÓXIMOS PASSOS</h3>
        <p>
          <strong>1.</strong> Aguarde o email com o link para definir sua senha<br><br>
          <strong>2.</strong> Quando receber o email, <strong>CLIQUE</strong> no botão verde para acessar o sistema<br><br>
          <strong>3.</strong> Defina uma senha segura (mínimo 6 caracteres)<br><br>
          <strong>4.</strong> Fa��a login no sistema e explore as funcionalidades<br><br>
          <strong>5.</strong> Em caso de dúvidas, entre em contato com o suporte
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>
        © ${new Date().getFullYear()} SISTEMA SISA - Todos os direitos reservados
      </p>
      <p>
        Este é um email automático. Não responda a esta mensagem.
      </p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = {
  getPasswordResetTemplate,
  getWelcomeTemplate,
  getRegistrationNotificationTemplate
};