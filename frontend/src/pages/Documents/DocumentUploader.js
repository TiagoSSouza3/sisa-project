import React, { useState } from 'react';
import API from '../../api';
import '../../styles/DocumentUploader.css';

export default function DocumentUploader({ onLayoutCreated, onCancel }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

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

      const response = await API.post('/document-layouts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onLayoutCreated(response.data);
      
      // Reset form
      setFile(null);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer upload do documento');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-uploader">
      <div className="uploader-header">
        <h2 className="uploader-title">Upload de Documento DOCX</h2>
        <p className="uploader-subtitle">
          Faça upload de um documento DOCX com placeholders no formato <code>{'{{campo}}'}</code>
        </p>
      </div>

      {error && (
        <div className="uploader-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="uploader-form">
        {/* Upload Area */}
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
                <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
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

        {/* Form Fields */}
        <div className="form-fields">
          <div className="field-group">
            <label htmlFor="name" className="field-label">
              Nome do Layout *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input"
              placeholder="Ex: Certificado de Conclusão"
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
              placeholder="Descreva o propósito deste documento..."
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4 className="info-title">Como usar placeholders</h4>
            <p className="info-text">
              Use placeholders no formato <code>{'{{nome_do_campo}}'}</code> no seu documento DOCX.
            </p>
            <p className="info-examples">
              Exemplo: <code>{'{{nome}}'}</code>, <code>{'{{data}}'}</code>, <code>{'{{curso}}'}</code>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            type="button"
            onClick={onCancel}
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
                📤 Salvar Layout
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}