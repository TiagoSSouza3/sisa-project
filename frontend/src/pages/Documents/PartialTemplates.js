import React, { useState, useEffect } from 'react';
import API from '../../api';
import '../../styles/PartialTemplates.css';
import { useLanguage } from '../../components/LanguageContext';
import { useDocumentPermissions } from '../../hooks/useDocumentPermissions_simple';

export default function PartialTemplates({ onCompleteTemplate }) {
  const { language } = useLanguage();
  const { isAdmin, userRole } = useDocumentPermissions();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [completing, setCompleting] = useState(false);
  const [outputFormat, setOutputFormat] = useState('docx');

  // Carregar templates parciais
  const loadPartialTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/document-layouts/partial-templates');
      setTemplates(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar templates parciais:', err);
      setError('Erro ao carregar templates parciais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartialTemplates();
  }, []);

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

  // Abrir modal para completar template
  const handleCompleteTemplate = (template) => {
    setSelectedTemplate(template);
    setShowCompleteModal(true);
    
    // Inicializar formData com campos vazios para placeholders não preenchidos
    const placeholders = getPlaceholdersArray(template.placeholders);
    const adminData = template.content || {};
    const initialData = {};
    
    placeholders.forEach(placeholder => {
      // Se o admin já preencheu, manter vazio para o usuário completar
      // Se não foi preenchido pelo admin, também deixar vazio
      initialData[placeholder] = '';
    });
    
    setFormData(initialData);
  };

  // Completar template parcial
  const handleSubmitComplete = async (e) => {
    e.preventDefault();
    
    if (!selectedTemplate) return;
    
    // Verificar se há campos para preencher
    const placeholders = getPlaceholdersArray(selectedTemplate.placeholders);
    const adminData = selectedTemplate.content || {};
    const emptyFields = placeholders.filter(placeholder => 
      !adminData[placeholder] && !formData[placeholder]?.trim()
    );
    
    if (emptyFields.length > 0) {
      setError(`Por favor, preencha os campos restantes: ${emptyFields.join(', ')}`);
      return;
    }

    setCompleting(true);
    setError('');

    try {
      console.log('Completando template parcial:', selectedTemplate.id);
      
      const response = await API.post(`/document-layouts/partial-templates/${selectedTemplate.id}/complete`, {
        data: formData,
        format: outputFormat
      }, {
        responseType: 'blob',
        timeout: 120000,
        headers: {
          'Accept': outputFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      });

      // Verificar se a resposta é válida
      if (!response.data || response.data.size === 0) {
        throw new Error('Arquivo vazio recebido do servidor');
      }

      // Criar blob e fazer download
      const mimeType = outputFormat === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const cleanName = selectedTemplate.title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const fileName = `${cleanName}_completed_${timestamp}.${outputFormat}`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      // Fechar modal e limpar dados
      setShowCompleteModal(false);
      setSelectedTemplate(null);
      setFormData({});

    } catch (err) {
      console.error('Erro ao completar template:', err);
      setError(err.response?.data?.message || 'Erro ao completar template');
    } finally {
      setCompleting(false);
    }
  };

  const formatPlaceholderLabel = (placeholder) => {
    return placeholder
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
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

  if (loading) {
    return (
      <div className="partial-templates">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>{language === "english" ? "Loading partial templates..." : "Carregando templates parciais..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="partial-templates">
      <div className="templates-header">
        <h2 className="templates-title">
          📋 {language === "english" ? "Partial Templates" : "Templates Parciais"}
        </h2>
        <p className="templates-subtitle">
          {language === "english" 
            ? "Complete templates that were partially filled by administrators"
            : "Complete templates que foram parcialmente preenchidos por administradores"
          }
        </p>
      </div>

      {error && (
        <div className="templates-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="templates-empty">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">
            {language === "english" ? "No partial templates found" : "Nenhum template parcial encontrado"}
          </h3>
          <p className="empty-subtitle">
            {language === "english" 
              ? "Administrators haven't created any partial templates yet."
              : "Os administradores ainda não criaram templates parciais."
            }
          </p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => {
            const placeholders = getPlaceholdersArray(template.placeholders);
            const adminData = template.content || {};
            const filledByAdmin = Object.keys(adminData).filter(key => adminData[key] && adminData[key].trim()).length;
            const remainingFields = placeholders.length - filledByAdmin;
            
            return (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h3 className="template-title">{template.title}</h3>
                  <div className="template-status">
                    <span className="status-badge partial">
                      {language === "english" ? "Partial" : "Parcial"}
                    </span>
                  </div>
                </div>
                
                <div className="template-info">
                  <div className="info-row">
                    <span className="info-label">
                      {language === "english" ? "Based on:" : "Baseado em:"}
                    </span>
                    <span className="info-value">{template.layout_name}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">
                      {language === "english" ? "Progress:" : "Progresso:"}
                    </span>
                    <span className="info-value">
                      {filledByAdmin} / {placeholders.length} {language === "english" ? "fields filled" : "campos preenchidos"}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">
                      {language === "english" ? "Remaining:" : "Restantes:"}
                    </span>
                    <span className="info-value">
                      {remainingFields} {language === "english" ? "fields to complete" : "campos para completar"}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">
                      {language === "english" ? "Created:" : "Criado:"}
                    </span>
                    <span className="info-value">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {template.description && (
                  <div className="template-description">
                    <p>{template.description}</p>
                  </div>
                )}
                
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
                
                <div className="template-actions">
                  <button
                    onClick={() => handleCompleteTemplate(template)}
                    className="btn btn-primary"
                    disabled={remainingFields === 0}
                  >
                    ✏️ {language === "english" ? "Complete" : "Completar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para completar template */}
      {showCompleteModal && selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>✏️ {language === "english" ? "Complete Template" : "Completar Template"}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCompleteModal(false)}
                disabled={completing}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="template-info-header">
                <h4>{selectedTemplate.title}</h4>
                <p>{language === "english" ? "Based on layout:" : "Baseado no layout:"} {selectedTemplate.layout_name}</p>
              </div>
              
              <form onSubmit={handleSubmitComplete}>
                {/* Format Selection */}
                <div className="format-selection">
                  <h4>{language === "english" ? "Output Format" : "Formato de Saída"}</h4>
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

                {/* Fields to complete */}
                <div className="complete-fields">
                  <h4>{language === "english" ? "Complete the remaining fields:" : "Complete os campos restantes:"}</h4>
                  
                  {(() => {
                    const placeholders = getPlaceholdersArray(selectedTemplate.placeholders);
                    const adminData = selectedTemplate.content || {};
                    const fieldsToComplete = placeholders.filter(placeholder => 
                      !adminData[placeholder] || !adminData[placeholder].trim()
                    );
                    
                    if (fieldsToComplete.length === 0) {
                      return (
                        <p className="no-fields">
                          {language === "english" 
                            ? "All fields have been filled by the administrator."
                            : "Todos os campos foram preenchidos pelo administrador."
                          }
                        </p>
                      );
                    }
                    
                    return fieldsToComplete.map((placeholder) => (
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
                              onChange={(e) => setFormData({
                                ...formData,
                                [placeholder]: e.target.value
                              })}
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
                              onChange={(e) => setFormData({
                                ...formData,
                                [placeholder]: e.target.value
                              })}
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
                    ));
                  })()}
                </div>
                
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    className="btn btn-secondary"
                    disabled={completing}
                  >
                    {language === "english" ? "Cancel" : "Cancelar"}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={completing}
                  >
                    {completing ? (
                      <>
                        <span className="loading-spinner"></span>
                        {language === "english" ? "Generating..." : "Gerando..."}
                      </>
                    ) : (
                      <>
                        📥 {language === "english" ? "Generate Document" : "Gerar Documento"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}