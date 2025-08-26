import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const changeTheme = (newTheme) => {
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
    
    // Aplicar o tema ao body
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  useEffect(() => {
    // Aplicar tema inicial
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);

    return () => {
      window.removeEventListener("themeChanged", handleThemeChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
