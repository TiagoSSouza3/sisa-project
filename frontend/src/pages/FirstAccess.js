import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { useLanguage } from '../components/LanguageContext';
import InlineNotification from '../components/InlineNotification';
import { validatePassword, validatePasswordConfirmation } from '../utils/validation';

import '../styles/global.css';
import '../styles/login.css';

export default function FirstAccess() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { language } = useLanguage();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (token) {
      checkToken();
    } else {
      setNotification({
        message: language === "english" ? "Token not found" : "Token não encontrado",
        type: 'error'
      });
      setTimeout(() => navigate("/"), 3000);
    }
  }, [token, navigate, language]);

  const checkToken = async () => {
    try {
      const res = await API.get(`/users/check-token/${token}`);
      setTokenValid(res.data.valid);
      setUserInfo(res.data.user);
    } catch (error) {
      console.error("Token inválido:", error);
      setNotification({
        message: language === "english" ? "Invalid or expired token" : "Token inválido ou expirado",
        type: 'error'
      });
      setTimeout(() => navigate("/"), 3000);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    // Validar senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setNotification({
        message: passwordValidation.message,
        type: 'error'
      });
      return;
    }

    // Validar confirmação de senha
    const confirmValidation = validatePasswordConfirmation(newPassword, confirmPassword);
    if (!confirmValidation.isValid) {
      setNotification({
        message: confirmValidation.message,
        type: 'error'
      });
      return;
    }

    setLoading(true);
    setNotification(null);
    
    try {
      await API.post("/users/reset-password", {
        token,
        newPassword
      });
      
      // Deslogar o usuário removendo o token e dados do localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("occupation_id");
      
      // Disparar evento de storage para atualizar outros componentes (como Navbar)
      window.dispatchEvent(new Event("storage"));
      
      setNotification({
        message: language === "english" ? "Password set successfully! You can now log in." : "Senha definida com sucesso! Você pode fazer login agora.",
        type: 'success'
      });
      
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Erro ao definir senha:", error);
      setNotification({
        message: error.response?.data?.error || (language === "english" ? "Error setting password" : "Erro ao definir senha"),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid && !notification) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">
            {language === "english" ? "Verifying token..." : "Verificando token..."}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {language === "english" ? "Welcome to SISA!" : "Bem-vindo ao SISA!"}
        </h2>
        
        {userInfo && tokenValid && (
          <>
            <div className="welcome-section">
              <p className="welcome-message">
                {language === "english" ? "Hello" : "Olá"}, <strong>{userInfo.name}</strong>!
              </p>
              <p className="welcome-description">
                {language === "english" 
                  ? "This is your first time in the system. For your security, set a personal password to access SISA."
                  : "Esta é sua primeira vez no sistema. Para sua segurança, defina uma senha pessoal para acessar o SISA."
                }
              </p>
            </div>
            
            <form className="login-form" onSubmit={handleSetPassword}>
              <div className="form-group password-group">
                <input 
                  type={showPasswords ? "text" : "password"}
                  placeholder={language === "english" ? "Set your password" : "Defina sua senha"}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswords(!showPasswords)}
                  aria-label={showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
                  title={showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {showPasswords ? (
                      // Ícone de olho fechado (senha oculta)
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    ) : (
                      // Ícone de olho aberto (senha visível)
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    )}
                  </svg>
                </button>
                <small className="password-hint">
                  {language === "english" ? "Minimum 6 characters" : "Mínimo de 6 caracteres"}
                </small>
              </div>
              <div className="form-group password-group">
                <input 
                  type={showPasswords ? "text" : "password"}
                  placeholder={language === "english" ? "Confirm your password" : "Confirme sua senha"}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswords(!showPasswords)}
                  aria-label={showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
                  title={showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {showPasswords ? (
                      // Ícone de olho fechado (senha oculta)
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    ) : (
                      // Ícone de olho aberto (senha visível)
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              <button className="login-button" type="submit" disabled={loading}>
                {loading 
                  ? (language === "english" ? "Saving..." : "Salvando...")
                  : (language === "english" ? "Set Password and Access" : "Definir Senha e Acessar")
                }
              </button>
            </form>
          </>
        )}
        
        {notification && (
          <InlineNotification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}