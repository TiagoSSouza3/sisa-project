import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const isLoggedIn = localStorage.getItem("token") ? true : false;
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  if (!isLoggedIn || localStorage.length == 0) {
    return (
      <nav className="navbar">
        <Link to="/" className="navbar-brand">SISA</Link>
      </nav>
    );
  }

  if (localStorage.getItem("occupation_id") === "3") {
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
            onClick={() => localStorage.clear()}
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
          onClick={() => localStorage.clear()}
          className="logout-btn"
        >
          Sair
        </Link>
      </div>
    </nav>
  );
}
