import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";
import { useLanguage } from '../components/LanguageContext';
import InlineNotification from '../components/InlineNotification';
import { validatePassword, validatePasswordConfirmation } from '../utils/validation';

import '../styles/global.css';
import '../styles/login.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
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

  const handleResetPassword = async (e) => {
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
        message: language === "english" ? "Password reset successfully! You can now log in." : "Senha redefinida com sucesso! Você pode fazer login agora.",
        type: 'success'
      });
      
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setNotification({
        message: error.response?.data?.error || (language === "english" ? "Error resetting password" : "Erro ao redefinir senha"),
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
          {userInfo?.first_login 
            ? (language === "english" ? "Set New Password" : "Definir Nova Senha")
            : (language === "english" ? "Reset Password" : "Redefinir Senha")
          }
        </h2>
        
        {userInfo && tokenValid && (
          <>
            <p className="welcome-message">
              {userInfo.first_login 
                ? (language === "english" 
                    ? `Welcome, ${userInfo.name}! Set your password to access the system.`
                    : `Bem-vindo, ${userInfo.name}! Defina sua senha para acessar o sistema.`)
                : (language === "english"
                    ? `Hello, ${userInfo.name}! Set your new password.`
                    : `Olá, ${userInfo.name}! Defina sua nova senha.`)
              }
            </p>
            
            <form className="login-form" onSubmit={handleResetPassword}>
              <div className="form-group password-group">
                <input 
                  type={showPasswords ? "text" : "password"}
                  placeholder={language === "english" ? "New password" : "Nova senha"}
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
              </div>
              <div className="form-group password-group">
                <input 
                  type={showPasswords ? "text" : "password"}
                  placeholder={language === "english" ? "Confirm new password" : "Confirmar nova senha"}
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
                  : (language === "english" ? "Save New Password" : "Salvar Nova Senha")
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