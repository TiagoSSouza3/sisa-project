import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";
import { useLanguage } from '../components/LanguageContext';
import InlineNotification from '../components/InlineNotification';

import '../styles/global.css';
import '../styles/login.css';

export default function ResetPassword() {
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

  const handleResetPassword = async (e) => {
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
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder={language === "english" ? "New password" : "Nova senha"}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder={language === "english" ? "Confirm new password" : "Confirmar nova senha"}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
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