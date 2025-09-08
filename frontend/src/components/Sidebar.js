import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { occupationEnum } from "../enums/occupationEnum";
import { useLanguage } from './LanguageContext';

export default function Sidebar({ isOpen, onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const { language } = useLanguage();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleNavClick = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
  }, [location]);

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose} />}
      <aside
        className={`sidebar${isOpen ? " open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sidebar-header">
          <h2 className="menu-title">Menu</h2>
          <button
            onClick={onClose}
            className="close-button"
            aria-label="Fechar menu"
          >
            &#10005;
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={isActive("/dashboard")} onClick={handleNavClick}>
            <span role="img" aria-label="Início">🏠</span> 
            {language === "english" ? "Dashboard" : "Início"}
          </Link>

          {isLoggedIn &&
            localStorage.getItem("occupation_id") !== occupationEnum.professor && (
              <Link to="/users" className={isActive("/users")} onClick={handleNavClick}>
                <span role="img" aria-label="Usuários">👥</span> 
                {language === "english" ? "Users" : "Usuários"}
              </Link>
          )}

          <Link to="/students" className={isActive("/students")} onClick={handleNavClick}> 
            <span role="img" aria-label="Alunos">🎓</span> 
            {language === "english" ? "Students" : "Alunos"}
          </Link>

          <Link to="/subjects" className={isActive("/subjects")} onClick={handleNavClick}>
            <span role="img" aria-label="Atividades">📚</span> 
            {language === "english" ? "Subjects" : "Atividades"}
          </Link>

          <Link to="/documents" className={isActive("/documents")} onClick={handleNavClick}>
            <span role="img" aria-label="Documentos">📄</span>
            {language === "english" ? "Documents" : "Documentos"}
          </Link>

          <Link to="/storage" className={isActive("/storage")} onClick={handleNavClick}>
            <span role="img" aria-label="Estoque">📦</span>
            {language === "english" ? "Storage" : "Estoque"}
          </Link>

          <Link
            to="/"
            onClick={() => { handleLogout(); handleNavClick(); }}
            className="logout-btn"
          >
            <span role="img" aria-label="Sair">🚪</span>
            {language === "english" ? "Exit" : "Sair"}
          </Link>
        </nav>
      </aside>
    </>
  );
}