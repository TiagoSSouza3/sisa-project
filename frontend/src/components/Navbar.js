import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLanguageChecked, setIsLanguageChecked] = useState(false);
  const { changeLanguage } = useLanguage();
  const { changeTheme, theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
    
    // Inicializar estados dos checkboxes
    const savedLanguage = localStorage.getItem("language") || "portugues";
    setIsLanguageChecked(savedLanguage === "english");
    
    // estado do tema já é controlado pelo ThemeContext
  }, [location]);

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(token !== null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <nav className="navbar">
  <div>
    {isLoggedIn && (
      <div className="slider-div">
        <button onClick={() => setMenuAberto(true)} className="menu-button">
          ☰ Menu
        </button>
        <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
        <div className="slider-div">
          {/* Language Toggle */}
          <div className="toggle-group">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/960px-Flag_of_Brazil.svg.png"
              alt="Português"
            />
            <label className="switch">
              <input 
                type="checkbox" 
                onChange={(e) => {changeLanguage(e.target.checked ? 'english' : 'portugues'); setIsLanguageChecked(e.target.checked)}}
                checked={isLanguageChecked} 
              />
              <span className="slider round"></span>
            </label>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"
              alt="English"
            />
          </div>
        </div>
      </div>
    )}
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