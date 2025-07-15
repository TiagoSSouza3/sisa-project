import React, { useState, useEffect } from 'react';
import API from '../../api';
import DocumentUploader from './DocumentUploader';
import LayoutsList from './LayoutsList';
import DocumentForm from './DocumentForm';
import AllDocuments from './AllDocuments';
import '../../styles/Documents.css';
import { useLanguage } from '../../components/LanguageContext';

export default function Documents() {
  const { language } = useLanguage();
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [activeTab, setActiveTab] = useState('layouts'); // layouts, upload, form, all-documents
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
            <button
              onClick={() => setActiveTab('layouts')}
              className={`nav-tab ${activeTab === 'layouts' ? 'active' : ''}`}
            >
              <span className="nav-tab-icon">📄</span>
              <span>Layouts ({layouts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
            >
              <span className="nav-tab-icon">📤</span>
              <span>Upload Layout</span>
            </button>
            <button
              onClick={() => setActiveTab('all-documents')}
              className={`nav-tab ${activeTab === 'all-documents' ? 'active' : ''}`}
            >
              <span className="nav-tab-icon">📁</span>
              <span>{language === "english" ? "All Documents" : "Todos os Documentos"}</span>
            </button>
            {selectedLayout && (
              <button
                onClick={() => setActiveTab('form')}
                className={`nav-tab ${activeTab === 'form' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">✏️</span>
                <span>{language === "english" ? "Fill out form" : "Preencher Fomulario"}</span>
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="content-area">
            {activeTab === 'layouts' && (
              <LayoutsList
                layouts={layouts}
                loading={loading}
                hasLoaded={hasLoaded}
                onSelectLayout={setSelectedLayout}
                onDeleteLayout={handleLayoutDeleted}
                onUseLayout={(layout) => {
                  setSelectedLayout(layout);
                  setActiveTab('form');
                }}
              />
            )}

            {activeTab === 'upload' && (
              <DocumentUploader
                onLayoutCreated={handleLayoutCreated}
                onCancel={() => setActiveTab('layouts')}
              />
            )}

            {activeTab === 'all-documents' && (
              <AllDocuments />
            )}

            {activeTab === 'form' && selectedLayout && (
              <DocumentForm
                layout={selectedLayout}
                onCancel={() => setActiveTab('layouts')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}