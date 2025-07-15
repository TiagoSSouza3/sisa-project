import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api';
import '../../styles/LayoutsList.css';
import '../../styles/LayoutsList-modal.css';
import { useLanguage } from '../../components/LanguageContext';

export default function LayoutsList({ layouts, loading, onSelectLayout, onDeleteLayout, onUseLayout, hasLoaded }) {
  const { language } = useLanguage();
  const [deletingId, setDeletingId] = useState(null);
  const [previewLayout, setPreviewLayout] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handleDelete = async (layoutId) => {
    if (!window.confirm('Tem certeza que deseja excluir este layout?')) {
      return;
    }

    setDeletingId(layoutId);
    try {
      await API.delete(`/document-layouts/${layoutId}`);
      onDeleteLayout(layoutId);
    } catch (err) {
      console.error('Erro ao deletar layout:', err);
      alert('Erro ao deletar layout');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = async (layout) => {
    setPreviewLayout(layout);
    setLoadingPreview(true);
    
    try {
      const response = await API.get(`/document-layouts/${layout.id}/preview`);
      setPreviewHtml(response.data.html);
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
      setPreviewHtml('<p>Erro ao carregar preview do documento</p>');
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewLayout(null);
    setPreviewHtml('');
  };

  // Bloquear scroll do body quando modal estiver aberto
  useEffect(() => {
    if (previewLayout) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewLayout]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && previewLayout) {
        closePreview();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [previewLayout]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para garantir que placeholders seja sempre um array
  const getPlaceholdersArray = (placeholders) => {
    if (!placeholders) return [];
    if (Array.isArray(placeholders)) return placeholders;
    if (typeof placeholders === 'string') {
      try {
        const parsed = JSON.parse(placeholders);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Componente do Modal
  const PreviewModal = () => {
    if (!previewLayout) return null;

    return createPortal(
      <div className="preview-modal">
        <div className="modal-overlay" onClick={closePreview}></div>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              📄 {language === "english" ? "Preview" : "Pré-Visualização"}: {previewLayout.name}
            </h3>
            <button onClick={closePreview} className="close-btn">
              ❌ {language === "english" ? "Close" : "Fechar"}
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-body-content">
              {loadingPreview ? (
                <div className="preview-loading-state">
                  <div className="loading-spinner-large"></div>
                  <p>{language === "english" ? "loading Preview..." : "Carregando Pré-Visualização..."}</p>
                </div>
              ) : (
                <div 
                  className="preview-document"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={closePreview} className="btn btn-secondary">
              {language === "english" ? "Close" : "Fechar"}
            </button>
            <button
              onClick={() => {
                onSelectLayout(previewLayout);
                onUseLayout(previewLayout);
                closePreview();
              }}
              className="btn btn-primary"
            >
              ✏️ {language === "english" ? "Use This Layout..." : "Usar Este Layout..."}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (loading) {
    return (
      <div className="layouts-loading">
        <div className="loading-spinner-large"></div>
        <p>{language === "english" ? "Loading layouts..." : "Carregando layouts..."}</p>
      </div>
    );
  }

  if (layouts.length === 0) {
    return (
      <div className="layouts-empty">
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3 className="empty-title">{language === "english" ? "No layouts found" : "Nenhum layout encontrado"}</h3>
          <p className="empty-subtitle">
            {language === "english" 
              ? "Start by creating your first document layout" 
              : "Comece criando seu primeiro layout de documento"
            }
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('switchToUpload'))}
            className="btn btn-primary"
          >
            📤 {language === "english" ? "Upload Document" : "Upload Documento"}
          </button>
          <div className="empty-tip">
            <span className="tip-icon">💡</span>
            <span>
              {language === "english" 
                ? "Use placeholders like <code>{'{{nome}}'}</code> in your DOCX" 
                : "Use placeholders como <code>{'{{nome}}'}</code> no seu DOCX"
              }
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layouts-list">
      <div className="layouts-header">
        <h2 className="layouts-title">
          {language === "english" ? "Available Layouts " : "Layouts Disponíveis "}({layouts.length})
        </h2>
        <p className="layouts-subtitle">
          {language === "english" 
            ? "Click 'Use Layout' to fill out a form and generate a document." 
            : "Clique em 'Usar Layout' para preencher um formulário e gerar documento "
          }
        </p>
      </div>

      <div className="layouts-grid">
        {layouts.map((layout) => {
          const placeholdersArray = getPlaceholdersArray(layout.placeholders);
          
          return (
            <div key={layout.id} className="layout-card">
              <div className="card-header">
                <div className="card-info">
                  <div className="card-icon">📄</div>
                  <h3 className="card-title">{layout.name}</h3>
                </div>
                <button
                  onClick={() => handleDelete(layout.id)}
                  disabled={deletingId === layout.id}
                  className="delete-btn"
                  title={language === "english" ? "Delete layout" : "Excluir layout"}
                >
                  {deletingId === layout.id ? (
                    <span className="loading-spinner-small"></span>
                  ) : (
                    '🗑️'
                  )}
                </button>
              </div>

              {layout.description && (
                <p className="card-description">{layout.description}</p>
              )}

              <div className="card-metadata">
                <div className="metadata-item">
                  <span className="metadata-icon">🕒</span>
                  <span className="metadata-text">{formatDate(layout.created_at)}</span>
                </div>
                
                {placeholdersArray.length > 0 && (
                  <div className="metadata-item">
                    <span className="metadata-icon">🏷️</span>
                    <span className="metadata-text">
                      {placeholdersArray.length} campo(s)
                    </span>
                  </div>
                )}
              </div>

              {placeholdersArray.length > 0 && (
                <div className="placeholders-preview">
                  <div className="placeholders-list">
                    {placeholdersArray.slice(0, 3).map((placeholder, index) => (
                      <span key={index} className="placeholder-tag">
                        {placeholder}
                      </span>
                    ))}
                    {placeholdersArray.length > 3 && (
                      <span className="placeholder-tag more">
                        +{placeholdersArray.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="card-actions">
                <button
                  onClick={() => {
                    onSelectLayout(layout);
                    onUseLayout(layout);
                  }}
                  className="btn btn-primary btn-small"
                >
                  ✏️ {language === "english" ? "Use Layout" : "Usar Layout"}
                </button>
                <button
                  onClick={() => handlePreview(layout)}
                  className="btn btn-secondary btn-small"
                >
                  👁️ {language === "english" ? "View" : "Visualizar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal renderizado via Portal */}
      <PreviewModal />
    </div>
  );
}