import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";
import { useLanguage } from '../components/LanguageContext';
import InlineNotification from '../components/InlineNotification';

import '../styles/global.css';
import '../styles/login.css';

export default function FirstAccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { language } = useLanguage();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    
    if (newPassword !== confirmPassword) {
      setNotification({
        message: language === "english" ? "Passwords do not match" : "As senhas não coincidem",
        type: 'error'
      });
      return;
    }

    if (newPassword.length < 6) {
      setNotification({
        message: language === "english" ? "Password must be at least 6 characters" : "A senha deve ter pelo menos 6 caracteres",
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
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder={language === "english" ? "Set your password" : "Defina sua senha"}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
                <small className="password-hint">
                  {language === "english" ? "Minimum 6 characters" : "Mínimo de 6 caracteres"}
                </small>
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder={language === "english" ? "Confirm your password" : "Confirme sua senha"}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
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