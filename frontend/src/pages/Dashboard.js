import React, { useState, useEffect } from "react";
import { useLanguage } from '../components/LanguageContext';
import FirstAccessModal from '../components/FirstAccessModal';
import API from '../api';

export default function Dashboard() {
  const { language } = useLanguage();
  const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const name = localStorage.getItem("name");
  const userId = localStorage.getItem("id");
  const firstName = name ? name.split(" ")[0] : "Usuário";

  useEffect(() => {
    checkFirstAccess();
  }, []);

  const checkFirstAccess = async () => {
    try {
      if (!userId) return;
      
      const response = await API.get(`/users/check-first-access/${userId}`);
      
      if (response.data.first_login) {
        setShowFirstAccessModal(true);
        setUserEmail(response.data.email);
      }
    } catch (error) {
      console.error('Erro ao verificar primeiro acesso:', error);
    }
  };

  const handleCloseModal = () => {
    setShowFirstAccessModal(false);
  };

  return (
    <div className="container">
      <div>
        {showFirstAccessModal && (
          <FirstAccessModal 
            userEmail={userEmail} 
            onClose={handleCloseModal}
          />
        )}
        
        <h1>
          {language === "english" ? "Welcome to system " : "Bem-vindo ao sistema "}
          SISA, {firstName}!
        </h1>
      </div>
    </div>
  );
}
