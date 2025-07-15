import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../../api';
import '../../styles/AllDocuments.css';

export default function AllDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Estados do formulário de upload
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Carregar documentos
  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/all-documents');
      setDocuments(response.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setDocuments([]);
      } else {
        setError('Erro ao carregar documentos. Verifique se o backend está rodando.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Deletar documento
  const handleDelete = async (documentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    setDeletingId(documentId);
    try {
      await API.delete(`/all-documents/${documentId}`);
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Erro ao deletar documento:', err);
      alert('Erro ao deletar documento');
    } finally {
      setDeletingId(null);
    }
  };

  // Preview do documento
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

  // Download do documento
  const handleDownload = async (doc, format = 'docx') => {
    try {
      console.log('Iniciando download do documento:', doc.id, 'formato:', format);
      
      const response = await API.get(`/all-documents/${doc.id}/download?format=${format}`, {
        responseType: 'blob',
        timeout: 60000
      });

      console.log('Resposta do download:', {
        status: response.status,
        size: response.data?.size || 'N/A',
        type: response.data?.type || 'N/A',
        headers: response.headers
      });

      // Verificar se a resposta é válida
      if (!response.data) {
        throw new Error('Nenhum dado recebido do servidor');
      }

      // Verificar se é um erro em formato JSON
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Erro no servidor');
      }

      // Verificar tamanho mínimo do arquivo
      if (response.data.size < 100) {
        throw new Error('Arquivo muito pequeno, pode estar corrompido');
      }

      // Criar blob com o tipo correto
      const mimeType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      const blob = new Blob([response.data], { type: mimeType });
      
      // Verificar se o blob foi criado corretamente
      if (blob.size === 0) {
        throw new Error('Erro ao criar arquivo para download');
      }

      console.log('Blob criado:', {
        size: blob.size,
        type: blob.type
      });

      // Criar URL e elemento de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = format === 'pdf' 
        ? `${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        : doc.original_filename;
      
      link.download = fileName;
      link.style.display = 'none';
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL após um tempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('Download concluído com sucesso para:', fileName);
    } catch (err) {
      console.error('Erro detalhado ao fazer download:', err);
      
      let errorMessage = `Erro ao fazer download do documento em ${format.toUpperCase()}`;
      
      if (err.response?.data) {
        try {
          // Se a resposta é um blob, tentar ler como texto
          if (err.response.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorData = JSON.parse(reader.result);
                alert(errorData.message || errorMessage);
              } catch {
                alert(errorMessage + ': ' + reader.result);
              }
            };
            reader.readAsText(err.response.data);
            return;
          }
        } catch {
          // Se falhar, usar mensagem padrão
        }
      }
      
      alert(err.message || errorMessage);
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
    setPreviewHtml('');
  };

  // Upload de arquivo
  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace('.docx', ''));
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name.trim());
      formData.append('description', description.trim());

      const response = await API.post('/all-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocuments([response.data, ...documents]);
      
      // Reset form
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

  // Bloquear scroll do body quando modal estiver aberto
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

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && previewDocument) {
        closePreview();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [previewDocument]);

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

  // Componente do Modal
  const PreviewModal = () => {
    if (!previewDocument) return null;

    return createPortal(
      <div className="preview-modal">
        <div className="modal-overlay" onClick={closePreview}></div>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              📄 Preview: {previewDocument.name}
            </h3>
            <button onClick={closePreview} className="close-btn">
              ❌ Fechar
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-body-content">
              {loadingPreview ? (
                <div className="preview-loading-state">
                  <div className="loading-spinner-large"></div>
                  <p>Carregando preview...</p>
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
              Fechar
            </button>
            <div className="download-buttons">
              <button
                onClick={() => handleDownload(previewDocument, 'docx')}
                className="btn btn-primary"
              >
                📄 Download DOCX
              </button>
              <button
                onClick={() => handleDownload(previewDocument, 'pdf')}
                className="btn btn-primary"
              >
                📋 Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (loading) {
    return (
      <div className="all-documents-loading">
        <div className="loading-spinner-large"></div>
        <p>Carregando documentos...</p>
      </div>
    );
  }

  return (
    <div className="all-documents">
      <div className="all-documents-header">
        <div className="header-content">
          <h2 className="all-documents-title">
            Todos os Documentos ({documents.length})
          </h2>
          <p className="all-documents-subtitle">
            Documentos gerais sem campos de preenchimento
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn btn-primary"
        >
          {showUploadForm ? '❌ Cancelar' : '📤 Adicionar Documento'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Formulário de Upload */}
      {showUploadForm && (
        <div className="upload-form-container">
          <form onSubmit={handleSubmit} className="upload-form">
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
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
                    🗑️ Remover
                  </button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon">📤</div>
                  <div className="upload-text">
                    <label htmlFor="file-upload" className="upload-label">
                      <span className="upload-link">Clique para fazer upload</span>
                      <span> ou arraste e solte</span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="file-input"
                      accept=".docx"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                  </div>
                  <p className="upload-hint">Apenas arquivos DOCX até 10MB</p>
                </div>
              )}
            </div>

            <div className="form-fields">
              <div className="field-group">
                <label htmlFor="name" className="field-label">
                  Nome do Documento *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input"
                  placeholder="Ex: Manual de Procedimentos"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="description" className="field-label">
                  Descrição (opcional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="field-textarea"
                  placeholder="Descreva o conteúdo deste documento..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="btn btn-secondary"
              >
                ❌ Cancelar
              </button>
              <button
                type="submit"
                disabled={!file || !name.trim() || uploading}
                className="btn btn-primary"
              >
                {uploading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Fazendo Upload...
                  </>
                ) : (
                  <>
                    📤 Salvar Documento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Documentos */}
      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3 className="empty-title">Nenhum documento encontrado</h3>
          <p className="empty-subtitle">
            Adicione documentos gerais que não precisam de preenchimento
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="btn btn-primary"
          >
            📤 Adicionar Primeiro Documento
          </button>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((document) => (
            <div key={document.id} className="document-card">
              <div className="card-header">
                <div className="card-info">
                  <div className="card-icon">📄</div>
                  <h3 className="card-title">{document.name}</h3>
                </div>
                <button
                  onClick={() => handleDelete(document.id)}
                  disabled={deletingId === document.id}
                  className="delete-btn"
                  title="Excluir documento"
                >
                  {deletingId === document.id ? (
                    <span className="loading-spinner-small"></span>
                  ) : (
                    '🗑️'
                  )}
                </button>
              </div>

              {document.description && (
                <p className="card-description">{document.description}</p>
              )}

              <div className="card-metadata">
                <div className="metadata-item">
                  <span className="metadata-icon">🕒</span>
                  <span className="metadata-text">{formatDate(document.created_at)}</span>
                </div>
                
                <div className="metadata-item">
                  <span className="metadata-icon">📁</span>
                  <span className="metadata-text">{formatFileSize(document.file_size)}</span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-icon">📋</span>
                  <span className="metadata-text">{document.original_filename}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handlePreview(document)}
                  className="btn btn-secondary btn-small"
                >
                  👁️ Visualizar
                </button>
                <div className="download-buttons">
                  <button
                    onClick={() => handleDownload(document, 'docx')}
                    className="btn btn-primary btn-small"
                  >
                    📄 DOCX
                  </button>
                  <button
                    onClick={() => handleDownload(document, 'pdf')}
                    className="btn btn-primary btn-small"
                  >
                    📋 PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal renderizado via Portal */}
      <PreviewModal />
    </div>
  );
}