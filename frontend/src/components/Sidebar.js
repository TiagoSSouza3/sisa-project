import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { occupationEnum } from "../enums/occupationEnum"

export default function Sidebar({ isOpen, onClose }) {
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

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose}></div>}
      <div
        className={`sidebar ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
        >
        <div className="sidebar-header">
          <h2 className="menu-title">Menu</h2>
          <button onClick={onClose} className="back-button">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                >
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
            <Link to="/dashboard" className={isActive("/dashboard")}>
              Inicio
            </Link>

            {isLoggedIn && localStorage.getItem("occupation_id") !== occupationEnum.professor
            ? <Link to="/users" className={isActive("/users")}>
                Usuarios
              </Link>
            : ''
            }

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
        </nav>
      </div>
    </>
  );
}
