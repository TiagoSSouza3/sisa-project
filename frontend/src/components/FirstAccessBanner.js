import React, { useState } from 'react';
import API from '../api';
import InlineNotification from './InlineNotification';
import '../styles/first-access-banner.css';

const FirstAccessBanner = ({ userEmail, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleRequestPasswordChange = async () => {
    setLoading(true);
    setNotification(null);
    
    try {
      await API.post("/users/request-password-reset", { email: userEmail });
      setNotification({ 
        message: "Email enviado! Verifique sua caixa de entrada nos próximos minutos.", 
        type: 'success' 
      });
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      setNotification({ 
        message: error.response?.data?.error || "Erro ao enviar email de redefinição", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-access-banner">
      <div className="first-access-content">
        <div className="first-access-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="first-access-text">
          <h3>Primeiro Acesso Detectado</h3>
          <p>Por segurança, recomendamos que você altere sua senha padrão. Clique no botão abaixo para receber um email com instruções.</p>
        </div>
        <div className="first-access-actions">
          <button 
            className="change-password-btn" 
            onClick={handleRequestPasswordChange}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Alterar Senha"}
          </button>
          <button 
            className="dismiss-btn" 
            onClick={onClose}
          >
            Agora não
          </button>
        </div>
      </div>
      {notification && (
        <InlineNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default FirstAccessBanner;