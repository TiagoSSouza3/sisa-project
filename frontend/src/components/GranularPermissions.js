import React, { useState, useEffect } from 'react';
import API from '../api';
import { useLanguage } from './LanguageContext';
import '../styles/document-permissions-unified.css';

const GranularPermissions = ({ userId, userRole, onPermissionsChange }) => {
  const { language } = useLanguage();
  const [layouts, setLayouts] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [partialTemplates, setPartialTemplates] = useState([]);
  const [restrictedLayouts, setRestrictedLayouts] = useState(new Set());
  const [restrictedDocuments, setRestrictedDocuments] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('layouts');

  useEffect(() => {
    loadData();
      // eslint-disable-next-line
  }, [userId, userRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Layouts
      const layoutsResponse = await API.get('/document-layouts');
      setLayouts(layoutsResponse.data || []);

      // Documentos
      try {
        const docsResponse = await API.get('/all-documents');
        setAllDocuments(docsResponse.data || []);
      } catch (_) {
        setAllDocuments([]);
      }

      // Templates Parciais
      try {
        const templatesResponse = await API.get('/document-layouts/partial-templates');
        setPartialTemplates(templatesResponse.data || []);
      } catch (_) {
        setPartialTemplates([]);
      }

      // Restrições (DB -> localStorage fallback)
      const storageKey = `restrictions_${userId}_${userRole}`;
      let restrictions = null;
      try {
        const response = await API.get(`/granular-permissions/${userId}/${userRole}`);
        restrictions = response.data;
        localStorage.setItem(storageKey, JSON.stringify(restrictions));
      } catch (_) {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try { restrictions = JSON.parse(saved); } catch { /* ignore */ }
        }
      }

      if (restrictions) {
        const restrictedLayoutIds = (restrictions.layouts || []).map(String);
        const restrictedDocumentIds = (restrictions.documents || []).map(String);
        setRestrictedLayouts(new Set(restrictedLayoutIds));
        setRestrictedDocuments(new Set(restrictedDocumentIds));
      } else {
        setRestrictedLayouts(new Set());
        setRestrictedDocuments(new Set());
        localStorage.setItem(storageKey, JSON.stringify({ layouts: [], documents: [] }));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveRestrictions = async (layoutRestrictions, documentRestrictions) => {
    const restrictions = {
      layouts: Array.from(layoutRestrictions, String),
      documents: Array.from(documentRestrictions, String)
    };

    try {
      await API.post('/granular-permissions', {
        user_id: userId,
        user_role: userRole,
        restrictions
      });
    } catch (_) {
      // fallback: persistir localmente mesmo em caso de erro de rede
    } finally {
      const storageKey = `restrictions_${userId}_${userRole}`;
      localStorage.setItem(storageKey, JSON.stringify(restrictions));
      if (onPermissionsChange) onPermissionsChange(restrictions);
    }
  };

  const toggleLayout = async (layoutId) => {
    const key = String(layoutId);
    const newRestricted = new Set(restrictedLayouts);
    if (newRestricted.has(key)) {
      newRestricted.delete(key);
    } else {
      newRestricted.add(key);
    }
    setRestrictedLayouts(newRestricted);
    await saveRestrictions(newRestricted, restrictedDocuments);
  };

  const toggleDocument = async (docId) => {
    const key = String(docId);
    const newRestricted = new Set(restrictedDocuments);
    if (newRestricted.has(key)) newRestricted.delete(key); else newRestricted.add(key);
    setRestrictedDocuments(newRestricted);
    await saveRestrictions(restrictedLayouts, newRestricted);
  };

  if (loading) {
    return (
      <div className="granular-permissions-loading">
        <div className="loading-spinner"></div>
        <p>{language === 'english' ? 'Loading documents and permissions...' : 'Carregando documentos e permissões...'}</p>
      </div>
    );
  }

  const renderToggle = (hasAccess, onClick, title) => (
    <div className="toggle-switch-container">
      <button
        type="button"
        className={`toggle-switch ${hasAccess ? 'enabled' : 'disabled'}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
        title={title}
        style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '12px' }}
      >
        <div className="toggle-slider"><div className="toggle-knob"></div></div>
        <span className="toggle-text">{hasAccess ? (language === 'english' ? 'Allowed' : 'Permitido') : (language === 'english' ? 'Denied' : 'Negado')}</span>
      </button>
    </div>
  );

  return (
    <div className="granular-permissions">
      <div className="granular-permissions-header">
        <h3>📄 {language === 'english' ? 'Specific Access by Document' : 'Permissões Específicas por Documento'}</h3>
        <p>{language === 'english' ? 'Configure which layouts and documents this user can access' : 'Configure quais layouts e documentos este usuário pode acessar'}</p>
      </div>

      <div className="granular-tabs">
        <button className={`granular-tab ${activeTab === 'layouts' ? 'active' : ''}`} onClick={() => setActiveTab('layouts')}>📄 {language === 'english' ? 'Layouts' : 'Layouts'} ({layouts.length})</button>
        <button className={`granular-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>📁 {language === 'english' ? 'Documents' : 'Documentos'} ({(allDocuments.length + partialTemplates.length)})</button>
      </div>

      {activeTab === 'layouts' && (
        <div className="granular-content">
          {layouts.length === 0 ? (
            <div className="granular-empty">
              <p>📄 {language === 'english' ? 'No layouts found' : 'Nenhum layout encontrado'}</p>
            </div>
          ) : (
            <div className="granular-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {layouts.map(layout => {
                const isRestricted = restrictedLayouts.has(String(layout.id));
                const hasAccess = !isRestricted;
                return (
                  <div key={layout.id} className={`granular-item ${hasAccess ? 'has-access' : 'restricted'}`}>
                    <div className="granular-item-info">
                      <h4>{layout.name}</h4>
                      {layout.description && <p>{layout.description}</p>}
                      {layout.created_at && <small>{language === 'english' ? 'Created at: ' : 'Criado em: '}{new Date(layout.created_at).toLocaleDateString('pt-BR')}</small>}
                    </div>
                    <div className="granular-item-permissions">
                      {renderToggle(hasAccess, () => toggleLayout(layout.id), hasAccess ? (language === 'english' ? 'Click to restrict' : 'Clique para restringir') : (language === 'english' ? 'Click to allow' : 'Clique para permitir'))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="granular-content">
          {(allDocuments.length + partialTemplates.length) === 0 ? (
            <div className="granular-empty">
              <p>📁 {language === 'english' ? 'No documents found' : 'Nenhum documento encontrado'}</p>
            </div>
          ) : (
            <>
              {allDocuments.length > 0 && (
                <div className="granular-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {allDocuments.map(document => {
                    const key = String(document.id);
                    const isRestricted = restrictedDocuments.has(key);
                    const hasAccess = !isRestricted;
                    return (
                      <div key={`doc-${document.id}`} className={`granular-item ${hasAccess ? 'has-access' : 'restricted'}`}>
                        <div className="granular-item-info">
                          <h4>{document.name} (ID: {document.id})</h4>
                          {document.description && <p>{document.description}</p>}
                          <small>
                            {document.original_filename ? `${language === 'english' ? 'File' : 'Arquivo'}: ${document.original_filename} | ` : ''}
                            {document.created_at ? `${language === 'english' ? 'Created at' : 'Criado em'}: ${new Date(document.created_at).toLocaleDateString('pt-BR')}` : ''}
                          </small>
                        </div>
                        <div className="granular-item-permissions">
                          {renderToggle(hasAccess, () => toggleDocument(document.id), hasAccess ? (language === 'english' ? 'Click to restrict' : 'Clique para restringir') : (language === 'english' ? 'Click to allow' : 'Clique para permitir'))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {partialTemplates.length > 0 && (
                <div style={{ marginTop: allDocuments.length > 0 ? '24px' : '0' }}>
                  <h4 style={{ margin: '10px 0' }}>{language === 'english' ? 'Documents available for editing' : 'Documentos disponíveis para editar'}</h4>
                  <div className="granular-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {partialTemplates.map(template => {
                      const key = String(template.id);
                      const isRestricted = restrictedDocuments.has(key);
                      const hasAccess = !isRestricted;
                      return (
                        <div key={`tpl-${key}`} className={`granular-item ${hasAccess ? 'has-access' : 'restricted'}`}>
                          <div className="granular-item-info">
                            <h4>{template.title} (Template ID: {key})</h4>
                            {template.description && <p>{template.description}</p>}
                            <small>
                              {template.layout_name ? `${language === 'english' ? 'Layout' : 'Layout'}: ${template.layout_name} | ` : ''}
                              {(template.createdAt || template.created_at) ? `${language === 'english' ? 'Created at' : 'Criado em'}: ${new Date(template.createdAt || template.created_at).toLocaleDateString('pt-BR')}` : ''}
                            </small>
                          </div>
                          <div className="granular-item-permissions">
                            {renderToggle(hasAccess, () => toggleDocument(key), hasAccess ? (language === 'english' ? 'Click to restrict' : 'Clique para restringir') : (language === 'english' ? 'Click to allow' : 'Clique para permitir'))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="granular-summary">
        <small className="auto-save-info">💾 {language === 'english' ? 'Changes are saved automatically' : 'As alterações são salvas automaticamente'}</small>
      </div>
    </div>
  );
};

export default GranularPermissions;
