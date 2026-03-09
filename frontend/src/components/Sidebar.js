import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { occupationEnum } from "../enums/occupationEnum";
import { useLanguage } from './LanguageContext';
import API from "../api";

export default function Sidebar({ isOpen, onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [permissions, setPermissions] = useState({});
  const location = useLocation();
  const { language, changeLanguage } = useLanguage();
  const [isLanguageChecked, setIsLanguageChecked] = useState(localStorage.getItem("language") === "english");

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
    if (token) {
      loadUserPermissions();
    }
    // Sincronizar o checkbox com o idioma armazenado
    const currentLanguage = localStorage.getItem("language");
    setIsLanguageChecked(currentLanguage === "english");
  }, [location]);

  const loadUserPermissions = async () => {
    try {
      const userId = localStorage.getItem("id");
      const occupationIdRaw = localStorage.getItem("occupation_id");
      
      // Converter occupation_id para o formato correto
      let occupationId = occupationIdRaw;
      
      // Se está como string de nome, converter para número
      if (occupationIdRaw === "PROFESSOR" || occupationIdRaw === "professor") {
        occupationId = "3";
      } else if (occupationIdRaw === "COLABORADOR" || occupationIdRaw === "colaborador") {
        occupationId = "2";
      } else if (occupationIdRaw === "ADMINISTRADOR" || occupationIdRaw === "administrador") {
        occupationId = "1";
      }
      
      // Administradores têm acesso a tudo
      if (occupationId === "1" || occupationId === 1 || occupationId === "ADMINISTRADOR") {
        const adminPermissions = {
          can_access_dashboard: true,
          can_access_users: true,
          can_access_students: true,
          can_access_subjects: true,
          can_access_documents: true,
          can_access_storage: true,
          can_access_summary_data: true,
        };
        setPermissions(adminPermissions);
        return;
      }

      if (userId && occupationId) {
        // Usar o endpoint de permissões efetivas (individuais + globais)
        const response = await API.get(`/permissions/${userId}/effective?occupation_id=${occupationId}`);
        setPermissions(response.data);
      }
    } catch (error) {
      // Fallback: tentar carregar permissões individuais
      try {
        const userId = localStorage.getItem("id");
        if (userId) {
          const response = await API.get(`/permissions/${userId}`);
          setPermissions(response.data);
        }
      } catch (fallbackError) {
        // Em caso de erro total, definir permissões padrão
        const defaultPermissions = {
          can_access_dashboard: true,
          can_access_users: false,
          can_access_students: false,
          can_access_subjects: false,
          can_access_documents: false,
          can_access_storage: false,
          can_access_summary_data: false,
        };
        setPermissions(defaultPermissions);
      }
    }
  };

  const hasPermission = (permission) => {
    const occupationIdRaw = localStorage.getItem("occupation_id");
    
    // Converter occupation_id para o formato correto
    let occupationId = occupationIdRaw;
    if (occupationIdRaw === "PROFESSOR" || occupationIdRaw === "professor") {
      occupationId = "3";
    } else if (occupationIdRaw === "COLABORADOR" || occupationIdRaw === "colaborador") {
      occupationId = "2";
    } else if (occupationIdRaw === "ADMINISTRADOR" || occupationIdRaw === "administrador") {
      occupationId = "1";
    }
    
    // Administradores têm acesso a tudo
    if (occupationId === "1" || occupationId === 1) {
      return true;
    }
    
    return permissions[permission] === true;
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.checked ? 'english' : 'portugues';
    changeLanguage(newLanguage);
    setIsLanguageChecked(e.target.checked);
  };

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

          {hasPermission('can_access_dashboard') && (
            <Link to="/dashboard" className={isActive("/dashboard")} onClick={handleNavClick}>
              <span role="img" aria-label="Início">🏠</span> 
              {language === "english" ? "Dashboard" : "Início"}
            </Link>
          )}

          {hasPermission('can_access_users') && (
            <Link to="/users" className={isActive("/users")} onClick={handleNavClick}>
              <span role="img" aria-label="Usuários">👥</span> 
              {language === "english" ? "Users" : "Usuários"}
            </Link>
          )}

          {hasPermission('can_access_students') && (
            <Link to="/students" className={isActive("/students")} onClick={handleNavClick}>
              <span role="img" aria-label="Alunos">🎓</span> 
              {language === "english" ? "Students" : "Alunos"}
            </Link>
          )}

          {hasPermission('can_access_subjects') && (
            <Link to="/subjects" className={isActive("/subjects")} onClick={handleNavClick}>
              <span role="img" aria-label="Atividades">📚</span> 
              {language === "english" ? "Subjects" : "Atividades"}
            </Link>
          )}

          {hasPermission('can_access_documents') && (
            <Link to="/documents" className={isActive("/documents")} onClick={handleNavClick}>
              <span role="img" aria-label="Documentos">📄</span>
              {language === "english" ? "Documents" : "Documentos"}
            </Link>
          )}

          {/* {hasPermission('can_access_storage') && (
            <Link to="/storage" className={isActive("/storage")} onClick={handleNavClick}>
              <span role="img" aria-label="Estoque">📦</span>
              {language === "english" ? "Storage" : "Estoque"}
            </Link>
          )} */}

          {/* Botão de Internacionalização */}
          <div className="sidebar-language-toggle">
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