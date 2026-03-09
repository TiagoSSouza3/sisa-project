import React, { useState, useEffect } from 'react';
import API from '../../api';
import DocumentUploader from './DocumentUploader';
import LayoutsList from './LayoutsList';
import DocumentForm from './DocumentForm';
import AllDocuments from './AllDocuments';
import TemplateCompletion from './TemplateCompletion';
import '../../styles/documents.css';
import { useLanguage } from '../../components/LanguageContext';
import { useDocumentPermissions } from '../../hooks/useDocumentPermissions_simple';

export default function Documents() {
  const { language } = useLanguage();
  const {
    loading: permissionsLoading,
    canViewLayouts,
    canEditLayouts,
    canUploadLayouts,
    canViewDocuments,
    canEditDocuments,
    canUploadDocuments,
    canAccessDocuments,
    isAdmin,
    userRole,
    filterLayoutsWithGranularPermissions,
    filterDocumentsWithGranularPermissions
  } = useDocumentPermissions();
  
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('layouts'); // layouts, upload, form, all-documents, template-form
  const [loading, setLoading] = useState(true); // Inicia como true
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false); // Controla se já carregou uma vez

  // Carregar layouts
  const loadLayouts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/document-layouts');
      setLayouts(response.data || []);
      setHasLoaded(true);
    } catch (err) {
      // Se a rota não existir ainda, apenas inicializa com array vazio
      if (err.response?.status === 404) {
        setLayouts([]);
        setHasLoaded(true);
      } else {
        setError('Erro ao carregar layouts. Verifique se o backend está rodando.');
        setHasLoaded(true);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLayouts();
    
    // Listener para mudança de aba via evento customizado
    const handleSwitchToUpload = () => {
      setActiveTab('upload');
    };
    
    window.addEventListener('switchToUpload', handleSwitchToUpload);
    
    return () => {
      window.removeEventListener('switchToUpload', handleSwitchToUpload);
    };
  }, []);

  // Definir aba inicial baseada nas permissões
  useEffect(() => {
    if (!permissionsLoading) {
      if (canViewLayouts()) {
        setActiveTab('layouts');
      } else if (canViewDocuments()) {
        setActiveTab('all-documents');
      } else if (canUploadLayouts()) {
        setActiveTab('upload');
      }
    }
  }, [permissionsLoading, canViewLayouts, canViewDocuments, canUploadLayouts]);

  // Adicionar novo layout
  const handleLayoutCreated = (newLayout) => {
    setLayouts([newLayout, ...layouts]);
    setActiveTab('layouts');
  };

  // Deletar layout
  const handleLayoutDeleted = (layoutId) => {
    setLayouts(layouts.filter(l => l.id !== layoutId));
    if (selectedLayout && selectedLayout.id === layoutId) {
      setSelectedLayout(null);
    }
  };

  // Verificar se está carregando permissões
  if (permissionsLoading) {
    return (
      <div className="documents-container">
        <div className="documents-loading">
          <div className="loading-spinner-large"></div>
          <p>{language === "english" ? "Loading permissions..." : "Carregando permissões..."}</p>
        </div>
      </div>
    );
  }

  // Verificar se tem acesso geral a documentos
  if (!canAccessDocuments) {
    return (
      <div className="documents-container">
        <div className="access-denied">
          <div className="access-denied-icon">🚫</div>
          <h2>{language === "english" ? "Access Denied" : "Acesso Negado"}</h2>
          <p>
            {language === "english" 
              ? "You don't have permission to access the document management system." 
              : "Você não tem permissão para acessar o sistema de gerenciamento de documentos."
            }
          </p>
          <div className="access-info">
            <p><strong>{language === "english" ? "Your role:" : "Sua função:"}</strong> {userRole || "N/A"}</p>
            <p>
              {language === "english" 
                ? "Contact an administrator to request access." 
                : "Entre em contato com um administrador para solicitar acesso."
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-container">
            
      <div className="documents-wrapper">
        {/* Header */}
        <div className="documents-header">
          <h1 className="documents-title">
            {language === "english" 
              ? "Document Management System" 
              : "Sistema de Gerenciamento de Documentos"
            }
          </h1>
          <p className="documents-subtitle">
            {language === "english" 
              ? "Manage layouts with placeholders and general documents" 
              : "Gerencie layouts com placeholders e documentos gerais"
            }
          </p>
          {!isAdmin && (
            <div className="user-role-info">
              <span className="role-badge">
                {language === "english" ? "Role:" : "Função:"} {
                  userRole === "professor" ? "Professor" : 
                  userRole === "colaborador" ? "Colaborador" :
                  userRole === "administrador" ? "Administrador" :
                  `Desconhecido (${userRole})`
                }
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content Container */}
        <div className="main-content-container">
          {/* Navigation Tabs */}
          <div className="nav-tabs">
            {canViewLayouts() && (
              <button
                onClick={() => setActiveTab('layouts')}
                className={`nav-tab ${activeTab === 'layouts' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">📄</span>
                <span>Layouts ({layouts.length})</span>
              </button>
            )}
            
            {canUploadLayouts() && (
              <button
                onClick={() => setActiveTab('upload')}
                className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">📤</span>
                <span>Upload Layout</span>
              </button>
            )}
            
            {canViewDocuments() && (
              <button
                onClick={() => setActiveTab('all-documents')}
                className={`nav-tab ${activeTab === 'all-documents' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">📁</span>
                <span>{language === "english" ? "All Documents" : "Todos os Documentos"}</span>
              </button>
            )}
            
                        
            {selectedLayout && canViewLayouts() && (
              <button
                onClick={() => setActiveTab('form')}
                className={`nav-tab ${activeTab === 'form' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">✏️</span>
                <span>{language === "english" ? "Fill out form" : "Preencher Formulário"}</span>
              </button>
            )}

            {selectedTemplate && canViewDocuments() && (
              <button
                onClick={() => setActiveTab('template-form')}
                className={`nav-tab ${activeTab === 'template-form' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">📋</span>
                <span>{language === "english" ? "Complete Template" : "Completar Template"}</span>
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="content-area">
            
            {activeTab === 'layouts' && canViewLayouts() && (
              <LayoutsList
                layouts={filterLayoutsWithGranularPermissions(layouts)}
                loading={loading}
                hasLoaded={hasLoaded}
                onSelectLayout={setSelectedLayout}
                onDeleteLayout={handleLayoutDeleted}
                onUseLayout={(layout) => {
                  setSelectedLayout(layout);
                  setActiveTab('form');
                }}
                canEdit={canEditLayouts()}
                canDelete={canEditLayouts()}
              />
            )}

            {activeTab === 'upload' && canUploadLayouts() && (
              <DocumentUploader
                onLayoutCreated={handleLayoutCreated}
                onCancel={() => setActiveTab('layouts')}
              />
            )}

            {activeTab === 'all-documents' && canViewDocuments() && (
              <AllDocuments 
                canEdit={canEditDocuments()}
                canUpload={canUploadDocuments()}
                canDelete={canEditDocuments()}
                onUseTemplate={(template) => {
                  setSelectedTemplate(template);
                  setActiveTab('template-form');
                }}
              />
            )}

            
            {activeTab === 'form' && selectedLayout && canViewLayouts() && (
              <DocumentForm
                layout={selectedLayout}
                onCancel={() => setActiveTab('layouts')}
              />
            )}

            {activeTab === 'template-form' && selectedTemplate && canViewDocuments() && (
              <TemplateCompletion
                template={selectedTemplate}
                onCancel={() => {
                  setSelectedTemplate(null);
                  setActiveTab('all-documents');
                }}
                onComplete={() => {
                  setSelectedTemplate(null);
                  setActiveTab('all-documents');
                }}
              />
            )}

            {/* Mensagem quando não há abas disponíveis */}
            {!canViewLayouts() && !canViewDocuments() && (
              <div className="no-permissions">
                <div className="no-permissions-icon">📋</div>
                <h3>{language === "english" ? "No Permissions Available" : "Nenhuma Permissão Disponível"}</h3>
                <p>
                  {language === "english" 
                    ? "You don't have permission to view any document sections." 
                    : "Você não tem permissão para visualizar nenhuma seção de documentos."
                  }
                </p>
                <div className="permissions-info">
                  <p><strong>{language === "english" ? "Available permissions:" : "Permissões disponíveis:"}</strong></p>
                  <ul>
                    <li>✅ {language === "english" ? "Access to Documents" : "Acesso a Documentos"}</li>
                    <li>❌ {language === "english" ? "View Layouts" : "Visualizar Layouts"}</li>
                    <li>❌ {language === "english" ? "View Documents" : "Visualizar Documentos"}</li>
                  </ul>
                  <p>
                    {language === "english" 
                      ? "Contact an administrator to request additional permissions." 
                      : "Entre em contato com um administrador para solicitar permissões adicionais."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}