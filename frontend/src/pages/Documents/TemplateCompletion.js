import React, { useState, useEffect } from 'react';
import API from '../../api';
import '../../styles/document-form.css';
import { useLanguage } from '../../components/LanguageContext';
import { useDocumentPermissions } from '../../hooks/useDocumentPermissions_simple';

export default function TemplateCompletion({ template, onCancel, onComplete }) {
  const { language } = useLanguage();
  const { isAdmin } = useDocumentPermissions();
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [outputFormat, setOutputFormat] = useState('docx');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [savingPartial, setSavingPartial] = useState(false);
  
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

  const placeholdersArray = getPlaceholdersArray(template.placeholders);
  const adminData = template.content || {};
  
  // Remover metadata dos dados do admin
  const cleanAdminData = { ...adminData };
  delete cleanAdminData._metadata;

  // Detectar se o item é um layout (template sintético) ou um template parcial salvo
  const isLayout = !!(
    template && (
      template.source === 'layout' ||
      (typeof template.id === 'string' && template.id.startsWith('layout_')) ||
      template.layoutId
    )
  );
  const layoutId = template && (
    template.layoutId ||
    (typeof template.id === 'string' && template.id.startsWith('layout_')
      ? parseInt(template.id.replace('layout_', ''), 10)
      : null)
  );

  useEffect(() => {
    // Inicializar formData apenas com campos que não foram preenchidos pelo admin
    const initialData = {};
    placeholdersArray.forEach(placeholder => {
      if (!cleanAdminData[placeholder] || !cleanAdminData[placeholder].trim()) {
        initialData[placeholder] = '';
      }
    });
    setFormData(initialData);
    
    // Carregar preview inicial
    updatePreview(initialData);
  }, [template]);

  // Atualizar preview quando formData mudar
  useEffect(() => {
    updatePreview(formData);
  }, [formData]);

  const updatePreview = async (currentFormData) => {
    setLoadingPreview(true);
    try {
      // Combinar dados do admin com dados do formulário
      const allData = { ...cleanAdminData, ...currentFormData };

      // Selecionar endpoint conforme a origem
      const previewUrl = isLayout && layoutId
        ? `/document-layouts/${layoutId}/preview`
        : `/document-layouts/partial-templates/${template.id}/preview`;
      
      const response = await API.post(previewUrl, {
        data: allData
      });
      
      setPreviewHtml(response.data.html || '<p>Preview não disponível</p>');
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
      setPreviewHtml('<p>Erro ao carregar preview</p>');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleInputChange = (placeholder, value) => {
    setFormData({
      ...formData,
      [placeholder]: value
    });
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    
    // Verificar se todos os campos restantes estão preenchidos
    const emptyFields = Object.keys(formData).filter(placeholder => !formData[placeholder]?.trim());
    if (emptyFields.length > 0) {
      setError(`Por favor, preencha todos os campos restantes: ${emptyFields.join(', ')}`);
      return;
    }

    setGenerating(true);
    setError('');

    try {
      console.log('Completando template:', template.id);
      console.log('Dados do usuário:', formData);

      // Combinar dados do admin com os dados do formulário
      const allData = { ...cleanAdminData, ...formData };
      
      let response;
      if (isLayout && layoutId) {
        // Gerar documento diretamente do layout
        response = await API.post(`/document-layouts/${layoutId}/generate`, {
          data: allData,
          format: outputFormat
        }, {
          responseType: 'blob',
          timeout: 120000,
          headers: {
            'Accept': outputFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
        });
      } else {
        // Completar template parcial salvo
        response = await API.post(`/document-layouts/partial-templates/${template.id}/complete`, {
          data: formData,
          format: outputFormat
        }, {
          responseType: 'blob',
          timeout: 120000,
          headers: {
            'Accept': outputFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
        });
      }

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

      // Para PDF, verificar se o conteúdo é válido
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
      const cleanName = template.title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const fileName = `${cleanName}_${timestamp}.${outputFormat}`;
      link.download = fileName;
      
      console.log('Iniciando download:', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      // Limpar formulário após completar
      const clearedData = {};
      Object.keys(formData).forEach(placeholder => {
        clearedData[placeholder] = '';
      });
      setFormData(clearedData);

      setSuccess('Template completado e documento gerado com sucesso!');
      
      // Chamar callback se fornecido
      if (onComplete) {
        onComplete();
      }

      console.log('Download concluído com sucesso');

    } catch (err) {
      console.error('Erro detalhado na completação:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Timeout na geração do documento. Tente novamente.');
      } else if (err.response?.data) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              setError(errorData.message || 'Erro ao completar template');
            } catch {
              setError('Erro ao completar template');
            }
          };
          reader.readAsText(err.response.data);
        } catch {
          setError(err.response?.data?.message || 'Erro ao completar template');
        }
      } else {
        setError(err.message || 'Erro ao completar template');
      }
    } finally {
      setGenerating(false);
    }
  };

  // Salvar como template parcial a partir de um layout, exigindo apenas a seleção de público
  const handleSavePartial = async () => {
    try {
      setError('');
      setSuccess('');

      if (!isLayout || !layoutId) {
        setError('Esta ação está disponível apenas ao usar um layout.');
        return;
      }
      if (!selectedAudience) {
        setError('Selecione quem poderá acessar este template (Professores, Colaboradores ou Todos).');
        return;
      }

      setSavingPartial(true);

      // Dados do admin + usuário (não é obrigatório ter preenchimento)
      const allData = { ...cleanAdminData, ...formData };
      const body = {
        data: allData,
        title: template.title || 'Template do Layout',
        description: template.description || '',
        audience: selectedAudience
      };

      const resp = await API.post(`/document-layouts/${layoutId}/save-partial`, body);

      setSuccess('Template salvo com sucesso!');
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Erro ao salvar template parcial:', err);
      setError(err.response?.data?.message || 'Erro ao salvar template parcial');
    } finally {
      setSavingPartial(false);
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

  // Campos que precisam ser preenchidos (não preenchidos pelo admin)
  const fieldsToComplete = placeholdersArray.filter(placeholder => 
    !cleanAdminData[placeholder] || !cleanAdminData[placeholder].trim()
  );

  // Campos já preenchidos pelo admin
  const filledFields = placeholdersArray.filter(placeholder => 
    cleanAdminData[placeholder] && cleanAdminData[placeholder].trim()
  );

  if (fieldsToComplete.length === 0) {
    return (
      <div className="document-form">
        <div className="form-empty">
          <div className="empty-icon">✅</div>
          <h3 className="empty-title">Template Já Completo</h3>
          <p className="empty-subtitle">
            Este template já foi totalmente preenchido pelo administrador.
          </p>
          <button onClick={onCancel} className="btn btn-primary">
            📄 Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-form">
      <div className="form-header">
        <h2 className="form-title">
          {language === "english" ? "Complete Template" : "Completar Template"}
        </h2>
        <div className="form-subtitle">
          <span className="layout-name">{template.title}</span>
          <span className="layout-description">{template.layout_name}</span>
          <span className="fields-count">
            {fieldsToComplete.length} {language === "english" ? "field(s) to complete" : "campo(s) para completar"}
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
          <form onSubmit={handleComplete} className="form-content">
            {/* Format Selection */}
            <div className="format-selection">
              <h3 className="format-title">
                {language === "english" ? "Output Format" : "Formato de Saída"}
              </h3>
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
              
              {/* Seleção de visibilidade (somente admin) */}
              {isLayout && isAdmin && (
              <div className="format-selection">
              <h3 className="format-title">
              {language === 'english' ? 'Visibility' : 'Visibilidade'}
              </h3>
              <div className="format-options">
              <label className={`format-option ${selectedAudience === 'professor' ? 'active' : ''}`}>
              <input
              type="radio"
              value="professor"
              checked={selectedAudience === 'professor'}
              onChange={() => setSelectedAudience('professor')}
              />
              <span className="format-label">
              <span className="format-icon">🎓</span>
              <span>{language === 'english' ? 'Professors' : 'Professores'}</span>
              </span>
              </label>
              <label className={`format-option ${selectedAudience === 'colaborador' ? 'active' : ''}`}>
              <input
              type="radio"
              value="colaborador"
              checked={selectedAudience === 'colaborador'}
              onChange={() => setSelectedAudience('colaborador')}
              />
              <span className="format-label">
              <span className="format-icon">👨‍💼</span>
              <span>{language === 'english' ? 'Collaborators' : 'Colaboradores'}</span>
              </span>
              </label>
              <label className={`format-option ${selectedAudience === 'all' ? 'active' : ''}`}>
              <input
              type="radio"
              value="all"
              checked={selectedAudience === 'all'}
              onChange={() => setSelectedAudience('all')}
              />
              <span className="format-label">
              <span className="format-icon">🌐</span>
              <span>{language === 'english' ? 'Everyone' : 'Todos'}</span>
              </span>
              </label>
              </div>
              <p className="field-hint">
              {language === 'english'
              ? 'Select who can access and edit this template.'
              : 'Selecione quem poderá acessar e editar este template.'}
              </p>
              </div>
              )}
              
              {/* Campos já preenchidos pelo admin */}
            {filledFields.length > 0 && (
              <div className="filled-fields-section">
                <h3 className="section-title">
                  ✅ {language === "english" ? "Already Filled by Administrator" : "Já Preenchido pelo Administrador"}
                </h3>
                <div className="filled-fields">
                  {filledFields.map((placeholder) => (
                    <div key={placeholder} className="filled-field">
                      <label className="field-label">
                        {formatPlaceholderLabel(placeholder)}
                      </label>
                      <div className="field-value">
                        {cleanAdminData[placeholder]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campos para completar */}
            <div className="form-fields">
              <h3 className="section-title">
                ✏️ {language === "english" ? "Complete the Remaining Fields" : "Complete os Campos Restantes"}
              </h3>
              {fieldsToComplete.map((placeholder) => (
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

              {isLayout && isAdmin && (
                <button
                  type="button"
                  disabled={savingPartial || !selectedAudience}
                  onClick={handleSavePartial}
                  className="btn btn-primary"
                  title={language === 'english' ? 'Save as Template (requires visibility selection)' : 'Salvar como Template (requer seleção de visibilidade)'}
                >
                  {savingPartial ? (
                    <>
                      <span className="loading-spinner"></span>
                      {language === 'english' ? 'Saving...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      💾 {language === 'english' ? 'Save Template' : 'Salvar Template'}
                    </>
                  )}
                </button>
              )}
              
              <button
                type="submit"
                disabled={generating || !Object.values(formData).some(value => value && value.trim())}
                className="btn btn-primary"
              >
                {generating ? (
                  <>
                    <span className="loading-spinner"></span>
                    {language === "english" ? "Generating" : "Gerando"} {outputFormat.toUpperCase()}...
                  </>
                ) : (
                  <>
                    📥 {language === "english" ? "Complete & Generate" : "Completar & Gerar"} {outputFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview em Tempo Real */}
        <div className="preview-section">
          <div className="preview-header">
            <h3 className="preview-title">
              👁️ {language === "english" ? "Live Preview" : "Pré-visualização em Tempo Real"}
            </h3>
            <div className="preview-info">
              <span className="preview-subtitle">{template.title}</span>
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(filledFields.length / placeholdersArray.length) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round((filledFields.length / placeholdersArray.length) * 100)}% {language === "english" ? "complete" : "completo"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="preview-container">
            {loadingPreview ? (
              <div className="preview-loading">
                <div className="loading-spinner"></div>
                <p>{language === "english" ? "Updating preview..." : "Atualizando pré-visualização..."}</p>
              </div>
            ) : (
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>
          
                  </div>
      </div>
    </div>
  );
}