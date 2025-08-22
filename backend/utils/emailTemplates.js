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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f8fafc;
      line-height: 1.6;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .email-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      padding: 48px 32px;
      text-align: center;
    }

    .email-header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .email-header p {
      color: rgba(255, 255, 255, 0.9);
      margin: 8px 0 0;
      font-size: 16px;
    }

    .email-content {
      padding: 48px 32px;
    }

    .email-content h2 {
      color: #1f2937;
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 600;
    }

    .email-content p {
      color: #6b7280;
      font-size: 16px;
      margin: 0 0 32px;
      line-height: 1.6;
    }

    .cta-container {
      text-align: center;
      margin: 40px 0;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
    }

    .info-card {
      background-color: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      margin: 32px 0;
    }

    .info-card h3 {
      color: #92400e;
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .info-card p {
      color: #92400e;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }

    .security-tip {
      background-color: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 24px 0;
      border-radius: 0 6px 6px 0;
    }

    .security-tip p {
      color: #1e40af;
      margin: 0;
      font-size: 14px;
    }

    .email-footer {
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 32px;
      text-align: center;
    }

    .email-footer p:first-child {
      color: #6b7280;
      margin: 0;
      font-size: 14px;
    }

    .email-footer p:last-child {
      color: #9ca3af;
      margin: 8px 0 0;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1>Redefinir Senha</h1>
      <p>Sistema SISA</p>
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>Olá, ${userName}!</h2>
      
      <p>
        Recebemos uma solicitação para redefinir a senha da sua conta no sistema SISA. 
        Clique no botão abaixo para criar uma nova senha segura.
      </p>

      <!-- CTA Button -->
      <div class="cta-container">
        <a href="${resetUrl}" class="cta-button">
          Redefinir Senha
        </a>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <h3>⚠️ Importante</h3>
        <p>
          Este link é válido por <strong>1 hora</strong>. Se não conseguir usá-lo a tempo, solicite uma nova redefinição.
        </p>
      </div>

      <!-- Security Tip -->
      <div class="security-tip">
        <p>
          <strong>Dica de Segurança:</strong> Se você não solicitou esta redefinição, pode ignorar este email. Sua senha atual permanecerá inalterada.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>
        © ${new Date().getFullYear()} Sistema SISA - Todos os direitos reservados
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f8fafc;
      line-height: 1.6;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .email-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      padding: 48px 32px;
      text-align: center;
    }

    .email-header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .email-header p {
      color: rgba(255, 255, 255, 0.9);
      margin: 8px 0 0;
      font-size: 16px;
    }

    .email-content {
      padding: 48px 32px;
    }

    .email-content h2 {
      color: #1f2937;
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 600;
    }

    .email-content p {
      color: #6b7280;
      font-size: 16px;
      margin: 0 0 32px;
      line-height: 1.6;
    }

    .cta-container {
      text-align: center;
      margin: 40px 0;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
    }

    .time-card {
      background-color: #dbeafe;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 32px 0;
    }

    .time-card-header {
      display: flex;
      align-items: flex-start;
    }

    .time-icon {
      background-color: #3b82f6;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
      font-size: 12px;
    }

    .time-card h3 {
      color: #1e40af;
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .time-card p {
      color: #1e40af;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }

    .steps-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
    }

    .steps-card h3 {
      color: #374151;
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
    }

    .steps-card ol {
      color: #6b7280;
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
    }

    .steps-card li {
      margin-bottom: 8px;
    }

    .help-tip {
      background-color: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 16px;
      margin: 24px 0;
      border-radius: 0 6px 6px 0;
    }

    .help-tip p {
      color: #065f46;
      margin: 0;
      font-size: 14px;
    }

    .email-footer {
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 32px;
      text-align: center;
    }

    .email-footer p:first-child {
      color: #6b7280;
      margin: 0;
      font-size: 14px;
    }

    .email-footer p:last-child {
      color: #9ca3af;
      margin: 8px 0 0;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1>Bem-vindo!</h1>
      <p>Sistema SISA</p>
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>Olá, ${userName}!</h2>
      
      <p>
        Sua conta foi criada com sucesso no sistema SISA! Para começar a usar todas as funcionalidades, 
        você precisa definir sua senha pessoal.
      </p>

      <!-- CTA Button -->
      <div class="cta-container">
        <a href="${resetUrl}" class="cta-button">
          Definir Senha
        </a>
      </div>

      <!-- Time Info Card -->
      <div class="time-card">
        <div class="time-card-header">
          <div class="time-icon">⏰</div>
          <div>
            <h3>Prazo para Ativação</h3>
            <p>
              Este link é válido por <strong>24 horas</strong>. Após esse período, será necessário solicitar um novo link de ativação.
            </p>
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="steps-card">
        <h3>Primeiros passos:</h3>
        <ol>
          <li>Clique no botão "Definir Senha"</li>
          <li>Crie uma senha segura (mínimo 6 caracteres)</li>
          <li>Confirme sua nova senha</li>
          <li>Faça login no sistema com suas credenciais</li>
        </ol>
      </div>

      <!-- Help Tip -->
      <div class="help-tip">
        <p>
          <strong>Precisa de ajuda?</strong> Se você não solicitou esta conta ou tem dúvidas, entre em contato com o administrador do sistema.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>
        © ${new Date().getFullYear()} Sistema SISA - Todos os direitos reservados
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
  getWelcomeTemplate
};