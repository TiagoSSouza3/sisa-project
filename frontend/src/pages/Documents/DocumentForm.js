import React, { useState, useEffect } from 'react';
import API from '../../api';
import '../../styles/document-form.css';
import { useLanguage } from '../../components/LanguageContext';
import { useDocumentPermissions } from '../../hooks/useDocumentPermissions_simple';

export default function DocumentForm({ layout, onCancel }) {
  const { language } = useLanguage();
  const { isAdmin } = useDocumentPermissions();
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [outputFormat, setOutputFormat] = useState('docx'); // docx or pdf
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  
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

  const placeholdersArray = getPlaceholdersArray(layout.placeholders);

  useEffect(() => {
    // Inicializar formData com campos vazios para cada placeholder
    if (placeholdersArray.length > 0) {
      const initialData = {};
      placeholdersArray.forEach(placeholder => {
        initialData[placeholder] = '';
      });
      setFormData(initialData);
    }
    
    // Carregar preview inicial do layout
    loadInitialPreview();
  }, [layout, placeholdersArray]);

  // Carregar preview inicial (sem dados)
  const loadInitialPreview = async () => {
    try {
      setLoadingPreview(true);
      const response = await API.get(`/document-layouts/${layout.id}/preview`);
      setPreviewHtml(response.data.html);
    } catch (err) {
      console.error('Erro ao carregar preview inicial:', err);
      setPreviewHtml('<p>Erro ao carregar preview do documento</p>');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Atualizar preview quando dados mudarem
  const updatePreview = async (newFormData) => {
    // Só atualizar se houver pelo menos um campo preenchido
    const hasData = Object.values(newFormData).some(value => value && value.trim());
    
    if (!hasData) {
      loadInitialPreview();
      return;
    }

    try {
      setLoadingPreview(true);
      const response = await API.post(`/document-layouts/${layout.id}/preview`, {
        data: newFormData
      });
      setPreviewHtml(response.data.html);
    } catch (err) {
      console.error('Erro ao atualizar preview:', err);
      // Manter o preview anterior em caso de erro
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleInputChange = (placeholder, value) => {
    const newFormData = {
      ...formData,
      [placeholder]: value
    };
    setFormData(newFormData);
    
    // Debounce para não fazer muitas requisições
    clearTimeout(window.previewTimeout);
    window.previewTimeout = setTimeout(() => {
      updatePreview(newFormData);
    }, 500);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Verificar se todos os campos obrigatórios estão preenchidos
    const emptyFields = placeholdersArray.filter(placeholder => !formData[placeholder]?.trim());
    if (emptyFields.length > 0) {
      setError(`Por favor, preencha todos os campos: ${emptyFields.join(', ')}`);
      return;
    }

    setGenerating(true);
    setError('');

    try {
      console.log('Iniciando geração de documento:', outputFormat);
      
      const response = await API.post(`/document-layouts/${layout.id}/generate`, {
        data: formData,
        format: outputFormat
      }, {
        responseType: 'blob',
        timeout: 120000, // 2 minutos timeout para PDF
        headers: {
          'Accept': outputFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      });

      console.log('Resposta recebida:', {
        status: response.status,
        headers: response.headers,
        dataSize: response.data.size
      });

      // Verificar se a resposta é válida
      if (!response.data || response.data.size === 0) {
        throw new Error('Arquivo vazio recebido do servidor');
      }

      // Criar blob com tipo correto
      const mimeType = outputFormat === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      const blob = new Blob([response.data], { type: mimeType });
      
      console.log('Blob criado:', {
        size: blob.size,
        type: blob.type
      });

      // Verificar se o blob é válido
      if (blob.size === 0) {
        throw new Error('Arquivo gerado está vazio');
      }

      // Para PDF, vamos verificar se o conteúdo é válido
      if (outputFormat === 'pdf') {
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Verificar se começa com %PDF (header do PDF)
        const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
        if (pdfHeader !== '%PDF') {
          console.error('Arquivo não é um PDF válido. Header:', pdfHeader);
          throw new Error('Arquivo PDF gerado é inválido');
        }
        
        console.log('PDF válido detectado');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const cleanName = layout.name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const fileName = `${cleanName}_${timestamp}.${outputFormat}`;
      link.download = fileName;
      
      console.log('Iniciando download:', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      const clearedData = {};
      placeholdersArray.forEach(placeholder => {
        clearedData[placeholder] = '';
      });
      setFormData(clearedData);
      loadInitialPreview();

      console.log('Download concluído com sucesso');

    } catch (err) {
      console.error('Erro detalhado na geração:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Timeout na geração do documento. Tente novamente.');
      } else if (err.response?.data) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              setError(errorData.message || 'Erro ao gerar documento');
            } catch {
              setError('Erro ao gerar documento');
            }
          };
          reader.readAsText(err.response.data);
        } catch {
          setError(err.response?.data?.message || 'Erro ao gerar documento');
        }
      } else {
        setError(err.message || 'Erro ao gerar documento');
      }
    } finally {
      setGenerating(false);
    }
  };

  // Função para salvar template parcial (apenas para admins)
  const handleSavePartial = async () => {
    // Verificar se há pelo menos um campo preenchido
    const filledFields = Object.entries(formData).filter(([key, value]) => value && value.trim());
    if (filledFields.length === 0) {
      setError('Preencha pelo menos um campo antes de salvar');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('Salvando template parcial...');
      
      // Usar o nome do layout como título padrão
      const defaultTitle = `${layout.name} - Template Parcial`;
      
      const response = await API.post(`/document-layouts/${layout.id}/save-partial`, {
        data: formData,
        title: defaultTitle,
        description: `Template parcial baseado no layout ${layout.name}`
      });

      console.log('Template parcial salvo:', response.data);
      
      setSuccess('Template salvo com sucesso! Agora está disponível em "Todos os Documentos" para outros usuários completarem.');
      
      // Limpar formulário após salvar
      const clearedData = {};
      placeholdersArray.forEach(placeholder => {
        clearedData[placeholder] = '';
      });
      setFormData(clearedData);
      loadInitialPreview();

    } catch (err) {
      console.error('Erro ao salvar template parcial:', err);
      setError(err.response?.data?.message || 'Erro ao salvar template parcial');
    } finally {
      setSaving(false);
    }
  };

  const getFieldType = (placeholder) => {
    const lowerPlaceholder = placeholder.toLowerCase();
    if (lowerPlaceholder.includes('data') || lowerPlaceholder.includes('date')) {
      return 'date';
    }
    if (lowerPlaceholder.includes('email')) {
      return 'email';
    }
    if (lowerPlaceholder.includes('telefone') || lowerPlaceholder.includes('phone')) {
      return 'tel';
    }
    if (lowerPlaceholder.includes('numero') || lowerPlaceholder.includes('number') || 
        lowerPlaceholder.includes('idade') || lowerPlaceholder.includes('ano')) {
      return 'number';
    }
    return 'text';
  };

  const formatPlaceholderLabel = (placeholder) => {
    return placeholder
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  };

  // Se não há placeholders, mostrar mensagem
  if (placeholdersArray.length === 0) {
    return (
      <div className="document-form">
        <div className="form-empty">
          <div className="empty-icon">⚠️</div>
          <h3 className="empty-title">Nenhum campo encontrado</h3>
          <p className="empty-subtitle">
            Este layout não possui placeholders configurados.
          </p>
          <button onClick={onCancel} className="btn btn-primary">
            📄 Voltar aos Layouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-form">
      <div className="form-header">
        <h2 className="form-title">{language === "english" ? "Fill out form" : "Preencher Formulario"}</h2>
        <div className="form-subtitle">
          <span className="layout-name">{layout.name}</span>
          {layout.description && (
            <span className="layout-description">{layout.description}</span>
          )}
          <span className="fields-count">
            {placeholdersArray.length} {language === "english" ? "field(s) to fill" : "campo(s) para preencher"}
          </span>
        </div>
      </div>

      {error && (
        <div className="form-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="form-success">
          <span className="success-icon">✅</span>
          <p>{success}</p>
        </div>
      )}

      <div className="form-layout">
        {/* Formulário */}
        <div className="form-section">
          <form onSubmit={handleGenerate} className="form-content">
            {/* Format Selection */}
            <div className="format-selection">
              <h3 className="format-title">{language === "english" ? "field(s) to fill" : "Formato de Saida"}</h3>
              <div className="format-options">
                <label className="format-option">
                  <input
                    type="radio"
                    value="docx"
                    checked={outputFormat === 'docx'}
                    onChange={(e) => setOutputFormat(e.target.value)}
                  />
                  <span className="format-label">
                    <span className="format-icon">📄</span>
                    <span>DOCX</span>
                  </span>
                </label>
                <label className="format-option">
                  <input
                    type="radio"
                    value="pdf"
                    checked={outputFormat === 'pdf'}
                    onChange={(e) => setOutputFormat(e.target.value)}
                  />
                  <span className="format-label">
                    <span className="format-icon">📋</span>
                    <span>PDF</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-fields">
              {placeholdersArray.map((placeholder) => (
                <div key={placeholder} className="field-group">
                  <label htmlFor={placeholder} className="field-label">
                    {formatPlaceholderLabel(placeholder)} *
                  </label>
                  <div className="field-container">
                    {placeholder.toLowerCase().includes('observa') || 
                     placeholder.toLowerCase().includes('descri') ||
                     placeholder.toLowerCase().includes('texto') ? (
                      <textarea
                        id={placeholder}
                        value={formData[placeholder] || ''}
                        onChange={(e) => handleInputChange(placeholder, e.target.value)}
                        rows={3}
                        className="field-textarea"
                        placeholder={`Digite ${formatPlaceholderLabel(placeholder).toLowerCase()}`}
                        required
                      />
                    ) : (
                      <input
                        type={getFieldType(placeholder)}
                        id={placeholder}
                        value={formData[placeholder] || ''}
                        onChange={(e) => handleInputChange(placeholder, e.target.value)}
                        className="field-input"
                        placeholder={`Digite ${formatPlaceholderLabel(placeholder).toLowerCase()}`}
                        required
                      />
                    )}
                  </div>
                  <p className="field-hint">
                    Placeholder: <code>{`{{${placeholder}}}`}</code>
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
              >
                ❌ {language === "english" ? "Cancel" : "Cancelar"}
              </button>
              
              {/* Botão Salvar (apenas para admins) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleSavePartial}
                  disabled={saving || !Object.values(formData).some(value => value && value.trim())}
                  className="btn btn-warning"
                >
                  {saving ? (
                    <>
                      <span className="loading-spinner"></span>
                      {language === "english" ? "Saving..." : "Salvando..."}
                    </>
                  ) : (
                    <>
                      💾 {language === "english" ? "Save" : "Salvar"}
                    </>
                  )}
                </button>
              )}
              
              <button
                type="submit"
                disabled={generating || !placeholdersArray.some(p => formData[p])}
                className="btn btn-primary"
              >
                {generating ? (
                  <>
                    <span className="loading-spinner"></span>
                    {language === "english" ? "Generating" : "Gerando"} {outputFormat.toUpperCase()}...
                  </>
                ) : (
                  <>
                    📥 {language === "english" ? "Generate" : "Gerar"} {outputFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="preview-section">
          <div className="preview-header">
            <h3 className="preview-title">📄 {language === "english" ? "Document Preview" : "Pré-visualização do Documento"}</h3>
            {loadingPreview && (
              <div className="preview-loading">
                <span className="loading-spinner-small"></span>
                <span>{language === "english" ? "Updating..." : "Atualizando..."}</span>
              </div>
            )}
          </div>
          <div className="preview-container">
            {previewHtml ? (
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="preview-placeholder">
                <div className="placeholder-icon">📄</div>
                <p>{language === "english" ? "Loading document preview..." : "Carregando preview do documento..."}</p>
              </div>
            )}
          </div>
        </div>
      </div>

          </div>
  );
}