import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import logoInstituto from "../assets/login-images/logoInstituto2.png";

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLanguageChecked, setIsLanguageChecked] = useState(localStorage.getItem("language") === "english");
  const { changeLanguage } = useLanguage();
  const { changeTheme, theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Páginas onde não deve mostrar o menu, apenas o seletor de idioma
  const isPasswordResetPage = location.pathname === '/reset-password' || location.pathname === '/first-access';

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
    
    // Inicializar estados dos checkboxes
    const savedLanguage = localStorage.getItem("language") || "portugues";
    setIsLanguageChecked(savedLanguage === "english");
    
    // estado do tema já é controlado pelo ThemeContext
  }, [location]);

  useEffect(() => {
    // Sincronizar o checkbox com o idioma armazenado
    const currentLanguage = localStorage.getItem("language");
    setIsLanguageChecked(currentLanguage === "english");
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(token !== null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.checked ? 'english' : 'portugues';
    changeLanguage(newLanguage);
    setIsLanguageChecked(e.target.checked);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Menu completo - APENAS quando logado E NÃO nas páginas de redefinição */}
        {isLoggedIn && !isPasswordResetPage && (
          <div className="slider-div navbar-controls">
            <button onClick={() => setMenuAberto(true)} className="menu-button">
              ☰ Menu
            </button>
            <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
          </div>
        )}
        {/* Seletor de idioma APENAS para páginas de redefinição de senha */}
        {isPasswordResetPage && (
          <div className="slider-div">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/960px-Flag_of_Brazil.svg.png"
              alt="Português"
            />
            <label className="switch">
              <input 
                type="checkbox" 
                onChange={handleLanguageChange}
                checked={isLanguageChecked} 
              />
              <span className="slider round"></span>
            </label>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"
              alt="English"
            />
          </div>
        )}
      </div>
      
      <div className="navbar-center">
        <button
          type="button"
          className="logo-nav-btn"
          onClick={() => navigate("/dashboard")}
          aria-label="Ir para o dashboard"
        >
          <img src={logoInstituto} alt="Logo Instituto" />
        </button>
      </div>

      {/* Botão único de tema no canto superior direito */}
      {isLoggedIn && (
        <button
          className="theme-toggle-btn"
          aria-label="Alternar tema"
          onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? '☾' : '🔆'}
        </button>
      )}
    </nav>
  );
}