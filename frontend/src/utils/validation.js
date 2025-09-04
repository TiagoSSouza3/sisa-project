// Função para validar email
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: "Email é obrigatório" };
  
  // Regex mais rigorosa para validação de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: "Por favor, insira um email válido (exemplo: usuario@dominio.com)" 
    };
  }
  
  // Verificações adicionais
  if (email.length > 254) {
    return { 
      isValid: false, 
      message: "Email muito longo (máximo 254 caracteres)" 
    };
  }
  
  // Verificar se não tem espaços
  if (email.includes(' ')) {
    return { 
      isValid: false, 
      message: "Email não pode conter espaços" 
    };
  }
  
  // Verificar se não começa ou termina com ponto
  if (email.startsWith('.') || email.endsWith('.')) {
    return { 
      isValid: false, 
      message: "Email não pode começar ou terminar com ponto" 
    };
  }
  
  // Verificar se não tem pontos consecutivos
  if (email.includes('..')) {
    return { 
      isValid: false, 
      message: "Email não pode ter pontos consecutivos" 
    };
  }
  
  return { isValid: true, message: "" };
};

// Função para validar senha
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: "Senha é obrigatória" };
  
  if (password.length < 6) {
    return { 
      isValid: false, 
      message: "A senha deve ter pelo menos 6 caracteres" 
    };
  }
  
  return { isValid: true, message: "" };
};

// Função para validar confirmação de senha
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) return { isValid: false, message: "Confirmação de senha é obrigatória" };
  
  if (password !== confirmPassword) {
    return { 
      isValid: false, 
      message: "As senhas não coincidem" 
    };
  }
  
  return { isValid: true, message: "" };
};