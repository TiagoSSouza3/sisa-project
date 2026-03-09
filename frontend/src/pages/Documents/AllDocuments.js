import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api';
import '../../styles/all-documents.css';
import { useLanguage } from '../../components/LanguageContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';
import { useDocumentPermissions } from '../../hooks/useDocumentPermissions_simple';
import TemplateCompletion from './TemplateCompletion';

export default function AllDocuments({ canEdit = false, canUpload = false, canDelete = false, onUseTemplate }) {
  const { language } = useLanguage();
  const { filterDocumentsWithGranularPermissions, userRole, isAdmin } = useDocumentPermissions();
  
  // Estados principais
  const [documents, setDocuments] = useState([]);
  const [partialTemplates, setPartialTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  // Estados do formulário
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Segurança e limites de entrada (título e descrição)
  const NAME_MAX = 120;
  const DESCRIPTION_MAX = 300;
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const sanitizeInput = (text) => {
    if (!text) return '';
    let t = String(text);
    // Remover scripts e tags HTML
    t = t.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    t = t.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    t = t.replace(/<[^>]*>/g, '');
    // Remover javascript: e handlers inline
    t = t.replace(/javascript:[^"'\s]*/gi, '');
    t = t.replace(/on\w+\s*=\s*(["']).*?\1/gi, '');
    // NÃO colapsar espaços aqui para permitir espaços normais na digitação
    return t;
  };

  const hasMaliciousPattern = (text) => {
    if (!text) return false;
    return /<[^>]+>|javascript:|on\w+\s*=|data:text\/html/i.test(text);
  };

  // Carregar documentos
  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔄 === INICIANDO CARREGAMENTO DE DOCUMENTOS ===');
      
      // Carregar documentos normais
      console.log('📄 Carregando documentos normais...');
      const documentsResponse = await API.get('/all-documents');
      console.log('📄 Documentos normais recebidos:', documentsResponse.data?.length || 0);
      setDocuments(documentsResponse.data || []);
      
      // Carregar templates parciais
      console.log('📋 Carregando templates parciais...');
      const templatesResponse = await API.get('/document-layouts/partial-templates');
      console.log('📋 Templates parciais recebidos do backend:', templatesResponse.data?.length || 0);
      console.log('📋 Primeiro template recebido:', templatesResponse.data?.[0]);
      setPartialTemplates(templatesResponse.data || []);

            
      console.log('✅ === CARREGAMENTO CONCLUÍDO ===');
    } catch (err) {
      console.error('❌ === ERRO NO CARREGAMENTO ===');
      console.error('Erro completo:', err);
      console.error('Status:', err.response?.status);
      console.error('Dados do erro:', err.response?.data);
      
      if (err.response?.status === 404) {
        console.log('🔍 404 detectado - definindo arrays vazios');
        setDocuments([]);
        setPartialTemplates([]);
      } else {
        setError('Erro ao carregar documentos. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (previewDocument) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewDocument]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && previewDocument) {
        closePreview();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [previewDocument]);

  // Handlers
  const handleDelete = async (documentId) => {
    const document = documents.find(doc => doc.id === documentId);
    
    showConfirmation({
      type: 'delete',
      title: language === "english" ? "Delete Document" : "Excluir Documento",
      message: language === "english" 
        ? `Are you sure you want to delete "${document?.name}"? This action cannot be undone.`
        : `Tem certeza que deseja excluir "${document?.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setDeletingId(documentId);
        try {
          await API.delete(`/all-documents/${documentId}`);
          setDocuments(documents.filter(doc => doc.id !== documentId));
        } catch (err) {
          console.error('Erro ao deletar documento:', err);
          setError(language === "english" ? "Error deleting document" : "Erro ao deletar documento");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) {
      return;
    }

    setDeletingId(templateId);
    try {
      await API.delete(`/document-layouts/partial-templates/${templateId}`);
      setPartialTemplates(partialTemplates.filter(template => template.id !== templateId));
      // Recarregar documentos para atualizar a lista combinada
      loadDocuments();
    } catch (err) {
      console.error('Erro ao deletar template:', err);
      alert('Erro ao deletar template');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = async (document) => {
    setPreviewDocument(document);
    setLoadingPreview(true);
    
    try {
      const response = await API.get(`/all-documents/${document.id}/preview`);
      setPreviewHtml(response.data.html);
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
      setPreviewHtml('<p>Erro ao carregar preview do documento</p>');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePreviewTemplate = async (template) => {
    setPreviewDocument(template);
    setLoadingPreview(true);
    
    try {
      // Para templates parciais, vamos mostrar o conteúdo preenchido pelo admin
      const adminData = { ...template.content };
      delete adminData._metadata; // Remover metadata
      
      // Criar HTML simples para mostrar os dados preenchidos
      let html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>📋 Template: ${template.title}</h2>
          <p><strong>Layout:</strong> ${template.layout_name}</p>
          <hr style="margin: 20px 0;">
          <h3>Dados Preenchidos pelo Administrador:</h3>
      `;
      
      if (Object.keys(adminData).length > 0) {
        html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
        Object.entries(adminData).forEach(([key, value]) => {
          html += `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px; font-weight: bold; background-color: #f5f5f5; width: 30%;">${key}</td>
              <td style="padding: 8px;">${value || '<em>Não preenchido</em>'}</td>
            </tr>
          `;
        });
        html += '</table>';
      } else {
        html += '<p><em>Nenhum dado foi preenchido ainda.</em></p>';
      }
      
      // Mostrar placeholders restantes
      const placeholders = Array.isArray(template.placeholders) ? template.placeholders : [];
      const filledFields = Object.keys(adminData);
      const remainingFields = placeholders.filter(p => !filledFields.includes(p));
      
      if (remainingFields.length > 0) {
        html += `
          <hr style="margin: 20px 0;">
          <h3>Campos Restantes para Completar:</h3>
          <ul style="margin-top: 10px;">
        `;
        remainingFields.forEach(field => {
          html += `<li style="margin: 5px 0;"><strong>${field}</strong></li>`;
        });
        html += '</ul>';
      }
      
      html += '</div>';
      
      setPreviewHtml(html);
    } catch (err) {
      console.error('Erro ao carregar preview do template:', err);
      setPreviewHtml('<p>Erro ao carregar preview do template</p>');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async (doc, format = 'docx') => {
    try {
      console.log('Iniciando download do documento:', doc.id, 'formato:', format);
      
      const response = await API.get(`/all-documents/${doc.id}/download?format=${format}`, {
        responseType: 'blob',
        timeout: 60000
      });

      if (!response.data) {
        throw new Error('Nenhum dado recebido do servidor');
      }

      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Erro no servidor');
      }

      if (response.data.size < 100) {
        throw new Error('Arquivo muito pequeno, pode estar corrompido');
      }

      const mimeType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      const blob = new Blob([response.data], { type: mimeType });
      
      if (blob.size === 0) {
        throw new Error('Erro ao criar arquivo para download');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = format === 'pdf' 
        ? `${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        : doc.original_filename;
      
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (err) {
      console.error('Erro detalhado ao fazer download:', err);
      alert(`Erro ao fazer download do documento em ${format.toUpperCase()}: ${err.message}`);
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
    setPreviewHtml('');
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(selectedFile);
      if (!name) {
        let baseName = selectedFile.name.replace(/\.docx$/i, '');
        baseName = sanitizeInput(baseName).slice(0, NAME_MAX);
        setName(baseName);
        setNameError(hasMaliciousPattern(selectedFile.name) ? (language === 'english' ? 'Suspicious content detected in file name' : 'Conteúdo suspeito detectado no nome do arquivo') : '');
      }
      setError('');
    } else {
      setError('Por favor, selecione um arquivo DOCX válido');
      setFile(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !name.trim()) {
      setError('Por favor, selecione um arquivo e forneça um nome');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Sanitização e validações finais antes do envio
      const sanitizedName = sanitizeInput(name).slice(0, NAME_MAX).trim();
      // No envio, apenas trim nas pontas para evitar espaços no início/fim; manter espaços internos
      const sanitizedDescription = sanitizeInput(description).slice(0, DESCRIPTION_MAX).trim();

      if (!sanitizedName) {
        setError(language === 'english' ? 'Document name is required' : 'Nome do documento é obrigatório');
        return;
      }
      if (name.length > NAME_MAX || description.length > DESCRIPTION_MAX) {
        setError(language === 'english' ? 'Title or description exceeds the allowed length' : 'Título ou descrição excede o tamanho permitido');
        return;
      }
      if (hasMaliciousPattern(name) || hasMaliciousPattern(description)) {
        setError(language === 'english' ? 'Remove HTML/JS code from the fields' : 'Remova código HTML/JS dos campos');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', sanitizedName);
      formData.append('description', sanitizedDescription);

      const response = await API.post('/all-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocuments([response.data, ...documents]);
      
      setFile(null);
      setName('');
      setDescription('');
      setShowUploadForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer upload do documento');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Components
  const PreviewModal = () => {
    if (!previewDocument) return null;

    return createPortal(
      <div className="preview-modal">
        <div className="modal-overlay" onClick={closePreview}></div>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              📄 {language === "english" ? "Preview" : "Pré-visualização"}: {previewDocument.name}
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
                  <p>{language === "english" ? "Loading Preview..." : "Carregando Pré-visualização..."}</p>
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
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="all-documents-loading">
        <div className="loading-spinner-large"></div>
        <p>{language === "english" ? "Loading Documents..." : "Carregando Documentos..."}</p>
      </div>
    );
  }

  // Filtrar documentos com permissões granulares
  const filteredDocuments = filterDocumentsWithGranularPermissions(documents);
  
  // DEBUG: Log informações do usuário
  console.log('👤 DEBUG - Informações do usuário:');
  console.log('  - User Role:', userRole);
  console.log('  - Is Admin:', isAdmin);
  console.log('  - User ID:', localStorage.getItem("id"));
  console.log('  - Occupation ID:', localStorage.getItem("occupation_id"));
  
  // DEBUG: Log antes do filtro de templates
  console.log('🔍 DEBUG - Templates antes do filtro:', partialTemplates.length);
  console.log('🔍 DEBUG - Primeiro template:', partialTemplates[0]);
  
  // Filtrar templates parciais e layouts com permissões granulares
  const filteredTemplates = filterDocumentsWithGranularPermissions(partialTemplates);

  // Filtrar templates parciais por audiência (professor | colaborador | all)
  const filteredTemplatesByAudience = filteredTemplates.filter(t => {
    try {
      const aud = t?.content?._metadata?.visibility_audience;
      if (!aud || aud === 'all') return true;
      if (isAdmin) return true;
      if (aud === 'professor') return userRole === 'professor';
      if (aud === 'colaborador') return userRole === 'colaborador';
      return true;
    } catch (e) {
      return true;
    }
  });

  // DEBUG: Log depois do filtro de templates e layouts
  console.log('🔍 DEBUG - Templates depois do filtro:', filteredTemplates.length);
  console.log('🔍 DEBUG - Primeiro template filtrado:', filteredTemplates[0]);
  console.log('🔍 DEBUG - Templates após audiência:', filteredTemplatesByAudience.length);
  console.log('🔍 DEBUG - Primeiro template após audiência:', filteredTemplatesByAudience[0]);

  // Combinar documentos e templates parciais (sem incluir layouts)
  const allItems = [
    ...filteredDocuments.map(doc => ({ ...doc, type: 'document' })),
    ...filteredTemplatesByAudience.map(t => ({ ...t, type: 'template', source: 'partial' }))
  ].sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));

  // DEBUG: Log final
  console.log('🔍 DEBUG - Total de itens combinados:', allItems.length);
  console.log('🔍 DEBUG - Itens por tipo:', {
    documents: allItems.filter(item => item.type === 'document').length,
    templates: allItems.filter(item => item.type === 'template').length
  });

  
  // Main render
  return (
    <div className="all-documents">

      <div className="all-documents-header">
        <div className="header-content">
          <h2 className="all-documents-title">
            {language === "english" ? "All Documents " : "Todos os Documentos "} ({allItems.length})
          </h2>
          <p className="all-documents-subtitle">
            {language === "english" 
              ? "General documents and templates to complete" 
              : "Documentos gerais e templates para completar"
            }
          </p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn btn-primary"
          >
            {showUploadForm 
              ? language === "english" ? '❌ Cancel' : '❌ Cancelar'
              : language === "english" ? '📤 Add Document' : '📤 Adicionar Documento'
            }
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {showUploadForm && (
        <div className="upload-form-container">
          <form onSubmit={handleSubmit} className="upload-form">
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && document.getElementById('file-upload').click()}
            >
              {file ? (
                <div className="file-preview">
                  <div className="file-icon success">✓</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="remove-file-btn"
                  >
                    🗑️ {language === "english" ? "Remove" : "Remover"}
                  </button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon">📤</div>
                  <div className="upload-text">
                    <span className="upload-link">
                      {language === "english" ? "Click to upload" : "Clique Para Fazer Upload"}
                    </span>
                    <span>
                      {language === "english" ? "or Drag and Drop" : "ou Arraste e Solte"}
                    </span>
                  </div>
                  <p className="upload-hint">{language === "english" ? "Only DOCX files up to 10MB" : "Apenas arquivos DOCX até 10MB"}</p>
                </div>
              )}
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="file-input"
                accept=".docx"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>

            <div className="form-fields">
              <div className="field-group">
                <label htmlFor="name" className="field-label">
                  {language === "english" ? "Document name *" : "Nome do Documento *"}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Verificar padrões suspeitos antes de sanitizar para feedback
                    setNameError(hasMaliciousPattern(value) ? (language === 'english' ? 'Remove HTML/JS code from the title' : 'Remova código HTML/JS do título') : '');
                    value = sanitizeInput(value).slice(0, NAME_MAX);
                    setName(value);
                  }}
                  className="field-input"
                  placeholder={language === "english" ? "Ex: Procedures Manual" : "Ex: Manual de Procedimentos"}
                  required
                />
                <div className="field-info-row">
                  <small className="field-hint">{name.length}/{NAME_MAX}</small>
                  {nameError && <span className="error-message" style={{ marginLeft: '8px' }}>{nameError}</span>}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="description" className="field-label">
                  {language === "english" ? "Description" : "Descrição"} ({language === "english" ? "optional" : "opcional"})
                </label>
                <textarea
                  id="description"
                  value={description}
                  maxLength={DESCRIPTION_MAX}
                  onChange={(e) => {
                    let value = e.target.value;
                    setDescriptionError(
                      hasMaliciousPattern(value)
                        ? (language === 'english' ? 'Remove HTML/JS code from the description' : 'Remova código HTML/JS da descrição')
                        : ''
                    );
                    // Apenas remover tags/scripts, sem colapsar espaços; preservar o que o usuário digita
                    value = sanitizeInput(value).slice(0, DESCRIPTION_MAX);
                    setDescription(value);
                  }}
                  rows={3}
                  className="field-textarea"
                  placeholder={language === "english" ? "Describe the contents of this document..." : "Descreva o conteúdo deste documento..."}
                />
                <div className="field-info-row">
                  <small className="field-hint">{description.length}/{DESCRIPTION_MAX}</small>
                  {descriptionError && <span className="error-message" style={{ marginLeft: '8px' }}>{descriptionError}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="btn btn-secondary"
              >
                ❌ {language === "english" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="submit"
                disabled={!file || !name.trim() || uploading || Boolean(nameError) || Boolean(descriptionError)}
                className="btn btn-primary"
              >
                {uploading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {language === "english" ? "Uploading..." : "Fazendo Upload..."}
                  </>
                ) : (
                  <>
                    📤 {language === "english" ? "Save Documents..." : "Salvar Documentos..."}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Todos os Itens (Documentos + Templates) */}
      {allItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3 className="empty-title">{language === "english" ? "No Documents Found..." : "Nenhum Documento Encontrado..."}</h3>
          <p className="empty-subtitle">
            {language === "english" 
              ? "Add general documents or create partial templates from layouts"
              : "Adicione documentos gerais ou crie templates parciais a partir de layouts"
            }
          </p>
          {canUpload && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="btn btn-primary"
            >
              📤 {language === "english" ? "Add First Document" : "Adicionar Primeiro Documento"}
            </button>
          )}
        </div>
      ) : (
        <div className="documents-grid">
          {allItems.map((item) => {
            if (item.type === 'template') {
              // Renderizar template parcial
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
              
              const placeholders = getPlaceholdersArray(item.placeholders);
              const adminData = item.content || {};
              
              // Remover metadata dos dados do admin para contar apenas campos reais
              const cleanAdminData = { ...adminData };
              delete cleanAdminData._metadata;
              
              const filledByAdmin = Object.keys(cleanAdminData).filter(key => 
                cleanAdminData[key] && cleanAdminData[key].toString().trim()
              ).length;
              const remainingFields = placeholders.length - filledByAdmin;
              
              return (
                <div key={`template-${item.id}`} className="document-card template-card">
                  <div className="card-header">
                    <div className="card-info">
                      <div className="card-icon">📋</div>
                      <h3 className="card-title">{item.title}</h3>
                    </div>
                    <div className="card-header-actions">
                      <div className="template-badge">
                        {language === "english" ? "Template" : "Template"}
                      </div>
                      {canDelete && item.source !== 'layout' && (
                        <button
                          onClick={() => handleDeleteTemplate(item.id)}
                          disabled={deletingId === item.id}
                          className="delete-btn"
                          title={language === "english" ? "Delete Template" : "Excluir Template"}
                        >
                          {deletingId === item.id ? (
                            <span className="loading-spinner-small"></span>
                          ) : (
                            '🗑️'
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="card-description">{item.description}</p>
                  )}

                  <div className="card-metadata">
                    <div className="metadata-item">
                      <span className="metadata-icon">🕒</span>
                      <span className="metadata-text">{formatDate(item.createdAt)}</span>
                    </div>
                    
                    <div className="metadata-item">
                      <span className="metadata-icon">📄</span>
                      <span className="metadata-text">{item.layout_name}</span>
                    </div>

                    <div className="metadata-item">
                      <span className="metadata-icon">✏️</span>
                      <span className="metadata-text">
                        {filledByAdmin}/{placeholders.length} {language === "english" ? "filled" : "preenchidos"}
                      </span>
                    </div>
                  </div>

                  <div className="template-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(filledByAdmin / placeholders.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {Math.round((filledByAdmin / placeholders.length) * 100)}% {language === "english" ? "complete" : "completo"}
                    </span>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => handlePreviewTemplate(item)}
                      className="btn btn-secondary btn-small"
                    >
                      👁️ {language === "english" ? "View" : "Visualizar"}
                    </button>
                    <button
                      onClick={() => {
                        if (onUseTemplate) {
                          onUseTemplate(item);
                        } else {
                          // Fallback para modal se não tiver onUseTemplate
                          setSelectedTemplate(item);
                          setShowTemplateForm(true);
                        }
                      }}
                      className="btn btn-primary btn-small"
                      disabled={remainingFields === 0}
                    >
                      ✏️ {language === "english" ? "Complete" : "Completar"}
                    </button>
                    {remainingFields > 0 && (
                      <span className="remaining-fields">
                        {remainingFields} {language === "english" ? "fields left" : "campos restantes"}
                      </span>
                    )}
                  </div>
                </div>
              );
            } else {
              // Renderizar documento normal
              return (
                <div key={`document-${item.id}`} className="document-card">
                  <div className="card-header">
                    <div className="card-info">
                      <div className="card-icon">📄</div>
                      <h3 className="card-title">{item.name}</h3>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="delete-btn"
                        title={language === "english" ? "Delete Documents" : "Excluir Documentos"}
                      >
                        {deletingId === item.id ? (
                          <span className="loading-spinner-small"></span>
                        ) : (
                          '🗑️'
                        )}
                      </button>
                    )}
                  </div>

                  {item.description && (
                    <p className="card-description">{item.description}</p>
                  )}

                  <div className="card-metadata">
                    <div className="metadata-item">
                      <span className="metadata-icon">🕒</span>
                      <span className="metadata-text">{formatDate(item.created_at)}</span>
                    </div>
                    
                    <div className="metadata-item">
                      <span className="metadata-icon">📁</span>
                      <span className="metadata-text">{formatFileSize(item.file_size)}</span>
                    </div>

                    <div className="metadata-item">
                      <span className="metadata-icon">📋</span>
                      <span className="metadata-text">{item.original_filename}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => handlePreview(item)}
                      className="btn btn-secondary btn-small"
                    >
                      👁️ {language === "english" ? "View" : "Vizualizar"}
                    </button>
                    <div className="download-buttons">
                      <button
                        onClick={() => handleDownload(item, 'docx')}
                        className="btn btn-primary btn-small"
                      >
                        📄 DOCX
                      </button>
                      <button
                        onClick={() => handleDownload(item, 'pdf')}
                        className="btn btn-primary btn-small"
                      >
                        📋 PDF
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Modal para completar template */}
      {showTemplateForm && selectedTemplate && createPortal(
        <div className="preview-modal">
          <div className="modal-overlay" onClick={() => setShowTemplateForm(false)}></div>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                ✏️ {language === "english" ? "Complete Template" : "Completar Template"}: {selectedTemplate.title}
              </h3>
              <button onClick={() => setShowTemplateForm(false)} className="close-btn">
                ❌ {language === "english" ? "Close" : "Fechar"}
              </button>
            </div>
            <div className="modal-body">
              <TemplateCompletion
                template={selectedTemplate}
                onCancel={() => setShowTemplateForm(false)}
                onComplete={() => {
                  setShowTemplateForm(false);
                  setSelectedTemplate(null);
                  // Recarregar templates para atualizar o status
                  loadDocuments();
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal renderizado via Portal */}
      <PreviewModal />
      
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        type={confirmationState.type}
        isLoading={confirmationState.isLoading}
      />
    </div>
  );
}