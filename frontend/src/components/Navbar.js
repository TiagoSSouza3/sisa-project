import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
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
          <>
            <button onClick={() => setMenuAberto(true)} className="menu-button">
              ☰ Menu
            </button>
            <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
          </>
        )}
      </div>
    </nav>
  );
}