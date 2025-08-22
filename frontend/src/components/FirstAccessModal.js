import React, { useState } from 'react';
import API from '../api';
import '../styles/first-access-modal.css';

const FirstAccessModal = ({ userEmail, onClose }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      await API.post("/users/request-password-reset", { email: userEmail });
      setResendMessage('Email reenviado com sucesso!');
    } catch (error) {
      setResendMessage('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="first-access-modal-overlay">
      <div className="first-access-modal">
        <div className="modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2>Email de Redefinição Enviado!</h2>
        
        <p className="modal-description">
          Enviamos um email para <strong>{userEmail}</strong> com um link seguro para você definir sua nova senha.
        </p>
        
        <div className="info-card">
          <div className="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Você receberá o email em até 5 minutos</span>
        </div>

        <div className="steps-section">
          <h3>Próximos passos:</h3>
          <ol>
            <li>Clique no link do email para redefinir sua senha</li>
            <li>Defina uma nova senha segura</li>
            <li>Faça login novamente com sua nova senha</li>
          </ol>
        </div>

        <div className="warning-section">
          <div className="warning-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Não se esqueça de verificar sua caixa de spam</span>
        </div>

        {resendMessage && (
          <div className={`resend-message ${resendMessage.includes('sucesso') ? 'success' : 'error'}`}>
            {resendMessage}
          </div>
        )}
        
        <div className="modal-actions">
          <button className="modal-button primary" onClick={onClose}>
            Entendi
          </button>
          
          <button 
            className="modal-button secondary" 
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? 'Reenviando...' : 'Reenviar Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstAccessModal;