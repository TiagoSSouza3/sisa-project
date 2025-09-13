import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from './LanguageContext';
import '../styles/confirmation-modal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  type = 'delete', // 'delete' ou 'edit'
  isLoading = false 
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Textos padrão baseados no tipo e idioma
  const defaultTitle = type === 'delete' 
    ? (language === "english" ? "Confirm Deletion" : "Confirmar Exclusão")
    : (language === "english" ? "Confirm Edit" : "Confirmar Edição");

  const defaultMessage = type === 'delete'
    ? (language === "english" ? "Are you sure you want to delete this item? This action cannot be undone." : "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.")
    : (language === "english" ? "Are you sure you want to edit this item?" : "Tem certeza que deseja editar este item?");

  const defaultConfirmText = type === 'delete'
    ? (language === "english" ? "Delete" : "Excluir")
    : (language === "english" ? "Edit" : "Editar");

  const defaultCancelText = language === "english" ? "Cancel" : "Cancelar";

  return createPortal(
    <div 
      className="confirmation-modal-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="confirmation-modal">
        <div className="confirmation-modal-header">
          <div className={`confirmation-modal-icon ${type}`}>
            {type === 'delete' ? '🗑️' : '✏️'}
          </div>
          <h3 className="confirmation-modal-title">
            {title || defaultTitle}
          </h3>
        </div>
        
        <div className="confirmation-modal-body">
          <p className="confirmation-modal-message">
            {message || defaultMessage}
          </p>
        </div>
        
        <div className="confirmation-modal-footer">
          <button 
            className="confirmation-modal-cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText || defaultCancelText}
          </button>
          <button 
            className={`confirmation-modal-confirm-btn ${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner-small"></span>
            ) : (
              confirmText || defaultConfirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
