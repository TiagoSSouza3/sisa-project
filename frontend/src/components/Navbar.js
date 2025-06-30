import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
  }, []);

  return (
    <nav className="navbar">
      <div>
        {isLoggedIn
          ? <><button onClick={() => {setMenuAberto(true);}} className="menu-button">
              ☰ Menu
              </button>
              <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
            </>
          : <button className="menu-button">
            ☰ Menu
          </button>
        }
      </div>
    </nav>
  );
}
