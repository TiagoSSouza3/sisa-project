import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { occupationEnum } from "../enums/occupationEnum"

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
  }, [location]);

  if (isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.professor) {
    return (
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">SISA</Link>
        <div className="navbar-links">
          <Link to="/students" className={isActive("/students")}>
            Alunos
          </Link>
          <Link to="/subjects" className={isActive("/subjects")}>
            Atividades
          </Link>
          <Link 
            to="/" 
            onClick={handleLogout}
            className="logout-btn"
          >
            Sair
          </Link>
        </div>
      </nav>
    );
  }	

  if (isLoggedIn) {
    return (
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">SISA</Link>
        <div className="navbar-links">
          <Link to="/users" className={isActive("/users")}>
            Usuários
          </Link>
          <Link to="/students" className={isActive("/students")}>
            Alunos
          </Link>
          <Link to="/subjects" className={isActive("/subjects")}>
            Disciplinas
          </Link>
          <Link 
            to="/" 
            onClick={handleLogout}
            className="logout-btn"
          >
            Sair
          </Link>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">SISA</Link>
    </nav>
  );
}
