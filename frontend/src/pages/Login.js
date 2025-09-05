import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

import '../styles/global.css';
import '../styles/login.css';
import logoInstituto from '../assets/login-images/logoInstituto.png';

// Importar configuração das imagens
import { loginImages, animationConfig } from '../config/imageConfig';

export default function Login() {
  localStorage.clear();

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


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("occupation_id", res.data.user.occupation_id);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("id", res.data.user.id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro detalhado:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Erro ao fazer login");
    }
  };

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
              <label className="input-label">EMAIL</label>
              <input 
                type="email" 
                placeholder="Digite seu email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="input-label">SENHA</label>
              <input 
                type="password" 
                placeholder="Digite sua senha" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button className="login-button" type="submit">Entrar</button>
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