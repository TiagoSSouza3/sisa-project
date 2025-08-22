import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecked, setIsChecked] = useState(localStorage.getItem("language") === "english");
  const { changeLanguage } = useLanguage();
  const location = useLocation();

  // Páginas onde não deve mostrar o menu, apenas o seletor de idioma
  const isPasswordResetPage = location.pathname === '/reset-password' || location.pathname === '/first-access';

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
  }, [location]);

  useEffect(() => {
    // Sincronizar o checkbox com o idioma armazenado
    const currentLanguage = localStorage.getItem("language");
    setIsChecked(currentLanguage === "english");
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
    setIsChecked(e.target.checked);
  };

  return (
    <nav className="navbar">
      <div>
        {/* Menu completo - APENAS quando logado E NÃO nas páginas de redefinição */}
        {isLoggedIn && !isPasswordResetPage && (
          <div className="slider-div">
            <button onClick={() => setMenuAberto(true)} className="menu-button">
              ☰ Menu
            </button>
            <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
            <div className="slider-div">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/960px-Flag_of_Brazil.svg.png"
              />
              <label className="switch">
                <input 
                  type="checkbox" 
                  onChange={handleLanguageChange}
                  checked={isChecked} 
                />
                <span className="slider round"></span>
              </label>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"
              />
            </div>
          </div>
        )}
        
        {/* Seletor de idioma APENAS para páginas de redefinição de senha */}
        {isPasswordResetPage && (
          <div className="slider-div">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/960px-Flag_of_Brazil.svg.png"
            />
            <label className="switch">
              <input 
                type="checkbox" 
                onChange={handleLanguageChange}
                checked={isChecked} 
              />
              <span className="slider round"></span>
            </label>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"
            />
          </div>
        )}
      </div>
    </nav>
  );
}