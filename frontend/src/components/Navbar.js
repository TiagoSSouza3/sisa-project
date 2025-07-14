import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { changeLanguage } = useLanguage();
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
              onChange={(e) => {changeLanguage(e.target.checked ? 'english' : 'portugues'); setIsChecked(e.target.checked)}}
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
  </div>
</nav>
  );
}