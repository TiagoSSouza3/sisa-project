import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import InlineNotification from "../components/InlineNotification";
import { validateEmail } from "../utils/validation";

import '../styles/global.css';
import '../styles/login.css';
import logoInstituto from '../assets/login-images/logoInstituto.png';

// Importar configuração das imagens
import { loginImages, animationConfig } from '../config/imageConfig';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  // Desabilitar rolagem apenas nesta página
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);


  // Limpar localStorage apenas uma vez quando o componente monta
  React.useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validar email antes de enviar
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setNotification({ 
        message: emailValidation.message, 
        type: 'error' 
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await API.post("/auth/login", { email, password });
      
      // Verificar se temos token
      if (!res.data.token) {
        setNotification({ message: "Erro: Token de autenticação não recebido", type: 'error' });
        setLoading(false);
        return;
      }
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("occupation_id", res.data.user.occupation_id);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("id", res.data.user.id);
      
      // Usar setTimeout para garantir que o localStorage foi salvo
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
      
    } catch (error) {
      setNotification({ message: error.response?.data?.error || "Erro ao fazer login", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(forgotEmail);
    if (!emailValidation.isValid) {
      setNotification({ 
        message: emailValidation.message, 
        type: 'error' 
      });
      return;
    }
    
    setLoading(true);
    setNotification(null);
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
        <div className="login-left">
          <div className="login-card">
            <div className="login-logo">
              <div className="responsive-logo">
                <img src={logoInstituto} alt="Logo Instituto" />
              </div>
            </div>
            <h2 className="login-title">Esqueci minha senha</h2>
            <form className="login-form" onSubmit={handleForgotPassword}>
              <div className="form-group">
                <input 
                  type="text" 
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

        {/* Lado Direito - Galeria Vertical */}
        <div className="login-right">
          <div 
            className="image-slider"
            style={{"--scroll-duration": `${animationConfig.scrollDurationMs}ms`}}
          >
            {[...loginImages, ...loginImages].map((src, index) => (
              <div className="slider-image" key={index}>
                <img src={src} alt={`slide-${index}`} />
              </div>
            ))}
          </div>

          <div className="promotional-content">
            <div className="promo-icon">
              <img src={logoInstituto} alt="Logo Instituto" />
            </div>
            <h1 className="promo-title">O que fazemos é resultado do que somos!</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      {/* Lado Esquerdo - Formulário de Login */}
      <div className="login-left">
        <div className="login-card">
          <div className="login-logo">
            <div className="responsive-logo">
              <img src={logoInstituto} alt="Logo Instituto" />
            </div>
          </div>
          <h2 className="login-title">Entrar no SISA</h2>
            <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group password-group">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Senha" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {showPassword ? (
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

      {/* Lado Direito - Galeria Vertical */}
      <div className="login-right">
        <div 
          className="image-slider"
          style={{"--scroll-duration": `${animationConfig.scrollDurationMs}ms`}}
        >
          {[...loginImages, ...loginImages].map((src, index) => (
            <div className="slider-image" key={index}>
              <img src={src} alt={`slide-${index}`} />
            </div>
          ))}
        </div>

        <div className="promotional-content">
          <div className="promo-icon">
            <img src={logoInstituto} alt="Logo Instituto" />
          </div>
          <h1 className="promo-title">O que fazemos é resultado do que somos!</h1>
        </div>

        {/* Indicadores removidos para rolagem contínua */}
      </div>
    </div>
  );
}