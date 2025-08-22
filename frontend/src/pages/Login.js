import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import InlineNotification from "../components/InlineNotification";

import '../styles/global.css';
import '../styles/login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Limpar localStorage apenas uma vez quando o componente monta
  React.useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('🔐 Frontend: Tentativa de login', { email, passwordLength: password.length });
    
    try {
      const res = await API.post("/auth/login", { email, password });
      
      console.log('✅ Frontend: Resposta recebida', res.data);
      
      // Verificar se temos token
      if (!res.data.token) {
        console.error('❌ Frontend: Token não recebido', res.data);
        setNotification({ message: "Erro: Token de autenticação não recebido", type: 'error' });
        setLoading(false);
        return;
      }
      
      console.log('💾 Frontend: Salvando dados no localStorage');
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("occupation_id", res.data.user.occupation_id);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("id", res.data.user.id);
      
      // Verificar se os dados foram salvos
      console.log('🔍 Frontend: Verificando localStorage:', {
        token: localStorage.getItem("token") ? 'Salvo' : 'Não salvo',
        occupation_id: localStorage.getItem("occupation_id"),
        name: localStorage.getItem("name"),
        id: localStorage.getItem("id")
      });
      
      console.log('🚀 Frontend: Navegando para dashboard');
      
      // Usar setTimeout para garantir que o localStorage foi salvo
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
      
    } catch (error) {
      console.error("❌ Frontend: Erro no login:", error.response?.data || error.message);
      setNotification({ message: error.response?.data?.error || "Erro ao fazer login", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null); // Limpar notificação anterior
    try {
      await API.post("/users/request-password-reset", { email: forgotEmail });
      setNotification({ 
        message: "Email enviado! Verifique sua caixa de entrada nos próximos minutos.", 
        type: 'success' 
      });
      setForgotEmail("");
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      setNotification({ 
        message: error.response?.data?.error || "Erro ao enviar email de redefinição", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Esqueci minha senha</h2>
          <form className="login-form" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Digite seu email" 
                value={forgotEmail} 
                onChange={(e) => setForgotEmail(e.target.value)} 
                required 
              />
            </div>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Processando..." : "Enviar email de redefinição"}
            </button>
            <button 
              type="button" 
              className="forgot-password-link" 
              onClick={() => {
                setShowForgotPassword(false);
                setNotification(null);
              }}
            >
              Voltar ao login
            </button>
            {notification && (
              <InlineNotification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Entrar no SISA</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button 
            type="button" 
            className="forgot-password-link" 
            onClick={() => setShowForgotPassword(true)}
          >
            Esqueci minha senha
          </button>
          {notification && (
            <InlineNotification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </form>
      </div>
    </div>
  );
}
