import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import '../../styles/global.css';
import '../../styles/users.css';
import '../../styles/document-permissions-unified.css';
import ToggleSwitch from '../../components/ToggleSwitch';
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';

export default function Users() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [activeRoleTab, setActiveRoleTab] = useState("professor");
  const [globalPermissions, setGlobalPermissions] = useState({
    professor: {
      can_access_dashboard: true,
      can_access_users: false,      // Professores NÃO podem acessar usuários
      can_access_students: false,   // Professores NÃO podem acessar alunos
      can_access_subjects: true,    // Professores PODEM acessar disciplinas
      can_access_documents: true,   // Professores PODEM acessar documentos
      can_access_storage: false,    // Professores NÃO podem acessar estoque
      can_access_summary_data: true, // Professores PODEM acessar dados resumidos
    },
    colaborador: {
      can_access_dashboard: true,
      can_access_users: false,      // Colaboradores NÃO podem acessar usuários
      can_access_students: true,    // Colaboradores PODEM acessar alunos
      can_access_subjects: false,   // Colaboradores NÃO podem acessar disciplinas
      can_access_documents: true,   // Colaboradores PODEM acessar documentos (sem layouts)
      can_access_storage: true,     // Colaboradores PODEM acessar estoque
      can_access_summary_data: false, // Colaboradores NÃO podem acessar dados resumidos
    }
  });
            const navigate = useNavigate();
  const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
    loadUsers();
    loadGlobalPermissions();
      }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError("Erro ao carregar usuários");
    }
  };

  const loadGlobalPermissions = async () => {
    try {
      const res = await API.get("/global-permissions");
      if (res.data) {
        setGlobalPermissions(res.data);
      }
    } catch (err) {
      console.log("Permissões globais não encontradas, usando padrões");
    }

      };

  
  const handleGlobalPermissionChange = (role, permission, value) => {
    setGlobalPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: value
      }
    }));
  };

  
  
  
  const handleSaveGlobalPermissions = async () => {
    try {
      await API.post("/global-permissions", globalPermissions);
      setSuccess(language === "english" ? "Global permissions saved successfully!" : "Permissões globais salvas com sucesso!");
      setError("");
    } catch (err) {
      console.error("Erro ao salvar permissões globais:", err);
      setError(language === "english" ? "Error saving global permissions" : "Erro ao salvar permissões globais");
    }
  };

  
  
  
  const handleResetIndividualPermissions = async (role) => {
    try {
      setError("");
      setSuccess("");
      
      const confirmMessage = language === "english" 
        ? `Are you sure you want to reset individual permissions for all ${role === 'professor' ? 'teachers' : 'collaborators'}?\n\nThis will:\n• Clear all individual permission overrides\n• Allow global permissions to take effect\n• Affect all users with this role`
        : `Tem certeza que deseja resetar as permissões individuais de todos os ${role === 'professor' ? 'professores' : 'colaboradores'}?\n\nIsso irá:\n• Limpar todas as permissões individuais específicas\n• Permitir que as permissões globais tenham efeito\n• Afetar todos os usuários com essa função`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
      
      console.log(`🔄 Resetando permissões individuais para role: ${role}`);
      
      const response = await API.post("/permissions/reset-individual", { role });
      
      setSuccess(language === "english" 
        ? `Individual permissions reset successfully for all ${role === 'professor' ? 'teachers' : 'collaborators'}! Global permissions will now take effect.`
        : `Permissões individuais resetadas com sucesso para todos os ${role === 'professor' ? 'professores' : 'colaboradores'}! As permissões globais agora terão efeito.`
      );
      
      console.log('✅ Permissões resetadas:', response.data);
      
    } catch (err) {
      console.error("Erro ao resetar permissões individuais:", err);
      setError(language === "english" 
        ? "Error resetting individual permissions" 
        : "Erro ao resetar permissões individuais"
      );
    }
  };

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id);
    
    showConfirmation({
      type: 'delete',
      title: language === "english" ? "Delete User" : "Excluir Usuário",
      message: language === "english" 
        ? `Are you sure you want to delete user "${user?.name}"? This action cannot be undone.`
        : `Tem certeza que deseja excluir o usuário "${user?.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          await API.delete(`/users/${id}`);
          setUsers(users.filter(u => u.id !== id));
          setSuccess(language === "english" ? "User removed successfully!" : "Usuário removido com sucesso!");
        } catch (err) {
          setError(language === "english" ? "Error removing user" : "Erro ao remover usuário");
        }
      }
    });
  };

  const handleEdit = async (id) => {
    navigate(`/users_form/${id}`)
  };

  if(isLoggedIn && (localStorage.getItem("occupation_id") === occupationEnum.professor || localStorage.getItem("occupation_id") === "3" || localStorage.getItem("occupation_id") === 3)){
    return (
      <div className="users-container">
        access denied
      </div>
    );
  }

  const renderUsersTab = () => (
    <div className="users-list">
      {users.map(user => (
        <div key={user.id} className="user-item">
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
            <span className="user-role">{user.occupation_id}</span>
          </div>
          { isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador
            ? <div className="user-actions">
              <button className="delete-button" onClick={() => handleDelete(user.id)}>
                {language === "english" ? "Delete" : "Excluir"}
              </button>
              <button className="edit-button" onClick={() => handleEdit(user.id)}>
                {language === "english" ? "Edit" : "Editar"}
              </button>
            </div>
            : ""
          }
        </div>
      ))}
    </div>
  );

  const renderRolePermissions = (role) => {
    const rolePermissions = globalPermissions[role];
    const roleName = role === 'professor' 
      ? (language === "english" ? "Teachers" : "Professores")
      : (language === "english" ? "Collaborators" : "Colaboradores");

    return (
      <div className="role-permissions-section">
        <h4>{language === "english" ? `General Access Permissions for ${roleName}` : `Permissões Gerais de Acesso para ${roleName}`}</h4>
        <p>{language === "english" 
          ? `Select which areas ALL ${roleName.toLowerCase()} can access by default:` 
          : `Selecione quais áreas TODOS os ${roleName.toLowerCase()} podem acessar por padrão:`
        }</p>
        
        <div className="permissions-grid">
          <div className="permission-item">
            <span className="permission-label">{language === "english" ? "Dashboard" : "Painel Principal"}</span>
            <ToggleSwitch
              checked={rolePermissions.can_access_dashboard}
              onChange={(val) => handleGlobalPermissionChange(role, 'can_access_dashboard', val)}
              label={language === "english" ? "Dashboard access (global)" : "Acesso ao Painel (global)"}
            />
          </div>

          <div className="permission-item">
            <span className="permission-label">{language === "english" ? "Users" : "Usuários"}</span>
            <ToggleSwitch
              checked={rolePermissions.can_access_users}
              onChange={(val) => handleGlobalPermissionChange(role, 'can_access_users', val)}
              label={language === "english" ? "Users access (global)" : "Acesso a Usuários (global)"}
            />
          </div>

          <div className="permission-item">
            <span className="permission-label">{language === "english" ? "Students" : "Alunos"}</span>
            <ToggleSwitch
              checked={rolePermissions.can_access_students}
              onChange={(val) => handleGlobalPermissionChange(role, 'can_access_students', val)}
              label={language === "english" ? "Students access (global)" : "Acesso a Alunos (global)"}
            />
          </div>

          <div className="permission-item">
            <span className="permission-label">{language === "english" ? "Subjects" : "Disciplinas"}</span>
            <ToggleSwitch
              checked={rolePermissions.can_access_subjects}
              onChange={(val) => handleGlobalPermissionChange(role, 'can_access_subjects', val)}
              label={language === "english" ? "Subjects access (global)" : "Acesso a Disciplinas (global)"}
            />
          </div>

          <div className="permission-item">
            <span className="permission-label">{language === "english" ? "Documents" : "Documentos"}</span>
            <ToggleSwitch
              checked={rolePermissions.can_access_documents}
              onChange={(val) => handleGlobalPermissionChange(role, 'can_access_documents', val)}
              label={language === "english" ? "Documents access (global)" : "Acesso a Documentos (global)"}
            />
          </div>

          <div className="permission-item">
            <span className="permission-label">{language === "english" ? "Storage" : "Estoque"}</span>
            <ToggleSwitch
              checked={rolePermissions.can_access_storage}
              onChange={(val) => handleGlobalPermissionChange(role, 'can_access_storage', val)}
              label={language === "english" ? "Storage access (global)" : "Acesso ao Estoque (global)"}
            />
          </div>

          <div className="permission-item">
            <span className="permission-label">{language === "english" ? "Summary Data" : "Dados Resumidos"}</span>
            <ToggleSwitch
              checked={rolePermissions.can_access_summary_data}
              onChange={(val) => handleGlobalPermissionChange(role, 'can_access_summary_data', val)}
              label={language === "english" ? "Summary Data access (global)" : "Acesso a Dados Resumidos (global)"}
            />
          </div>
        </div>

        <div className="info-message" style={{ marginTop: '20px' }}>
          <p><strong>{language === "english" ? "Important:" : "Importante:"}</strong></p>
          <p>{language === "english" 
            ? `• These settings affect ALL ${roleName.toLowerCase()} in the system` 
            : `• Essas configurações afetam TODOS os ${roleName.toLowerCase()} do sistema`
          }</p>
          <p>{language === "english" 
            ? "• Individual user permissions can override these global settings" 
            : "• Permissões individuais de usuários podem sobrescrever essas configurações globais"
          }</p>
          <p>{language === "english" 
            ? "• If a user has individual access to a page, they will have access even if their role is blocked" 
            : "• Se um usuário tem acesso individual a uma página, ele terá acesso mesmo que sua função esteja bloqueada"
          }</p>
        </div>

        <div className="reset-permissions-section" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>
            {language === "english" ? "Reset Individual Permissions" : "Resetar Permissões Individuais"}
          </h5>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#6c757d' }}>
            {language === "english" 
              ? `If some ${roleName.toLowerCase()} are not seeing the tabs even with global permissions enabled, use this button to clear all individual permission overrides and allow global permissions to take effect.`
              : `Se alguns ${roleName.toLowerCase()} não estão vendo as abas mesmo com as permissões globais habilitadas, use este botão para limpar todas as permissões individuais específicas e permitir que as globais tenham efeito.`
            }
          </p>
          <button 
            className="reset-button"
            onClick={() => handleResetIndividualPermissions(role)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            🔄 {language === "english" 
              ? `Reset Individual Permissions for ${roleName}` 
              : `Resetar Permissões Individuais dos ${roleName}`
            }
          </button>
        </div>
      </div>
    );
  };

  const renderDocumentPermissions = () => {
    const roles = [
      { id: 'professor', name: language === "english" ? "Teachers" : "Professores", icon: '👨‍🏫' },
      { id: 'colaborador', name: language === "english" ? "Collaborators" : "Colaboradores", icon: '👥' }
    ];

    const renderToggleSwitch = (isAllowed, onClick, label) => (
      <ToggleSwitch
        checked={isAllowed}
        onChange={() => onClick()}
        label={label}
        onLabel={language === 'english' ? 'Allowed' : 'Permitido'}
        offLabel={language === 'english' ? 'Denied' : 'Negado'}
      />
    );

    const renderGlobalToggle = (role, permissionType) => {
      const permissionKey = `${role.id}s_can_${permissionType}`;
      const isAllowed = globalDocumentPermissions[permissionKey] || false;
      const label = `${role.name} - ${permissionType === 'view' ? 'Visualizar' : permissionType}`;
      
      return renderToggleSwitch(
        isAllowed,
        () => handleDocumentPermissionChange(permissionKey, !isAllowed),
        label
      );
    };

    return (
      <div className="document-permissions-section">
        <h4>{language === "english" ? "Document Access Permissions" : "Permissões de Acesso a Documentos"}</h4>
        <p>{language === "english" 
          ? "Configure document access permissions. Focus on VIEW access only for now." 
          : "Configure permissões de acesso a documentos. Foco apenas no acesso de VISUALIZAÇÃO por enquanto."
        }</p>

        <div className="global-controls-section">
          <div className="section-header">
            <h5>
              <span className="section-icon">🌐</span>
              {language === "english" ? "GLOBAL CONTROLS" : "CONTROLES GLOBAIS"}
            </h5>
            <p className="section-description">
              {language === "english" 
                ? "These controls affect ALL documents for each user type. Changes here apply globally." 
                : "Estes controles afetam TODOS os documentos para cada tipo de usuário. Mudanças aqui se aplicam globalmente."
              }
            </p>
          </div>

          <div className="global-controls-grid">
            {roles.map(role => (
              <div key={role.id} className="global-role-card">
                <div className="role-header">
                  <span className="role-icon">{role.icon}</span>
                  <h6 className="role-title">{role.name}</h6>
                </div>
                
                <div className="global-permission-control">
                  <label className="permission-label">
                    {language === "english" ? "Access to Documents:" : "Acesso a Documentos:"}
                  </label>
                  {renderGlobalToggle(role, 'view')}
                </div>
                <div className="global-permission-control">
                  <label className="permission-label">
                    {language === "english" ? "Edit Documents:" : "Editar Documentos:"}
                  </label>
                  {renderGlobalToggle(role, 'edit')}
                </div>
                <div className="global-permission-control">
                  <label className="permission-label">
                    {language === "english" ? "Upload Documents:" : "Enviar Documentos:"}
                  </label>
                  {renderGlobalToggle(role, 'upload')}
                </div>
              </div>
            ))}
          </div>

          <div className="global-controls-info">
            <div className="info-box">
              <strong>{language === "english" ? "How Global Controls Work:" : "Como Funcionam os Controles Globais:"}</strong>
              <ul>
                <li>{language === "english" 
                  ? "These settings apply to ALL documents and layouts in the system" 
                  : "Essas configurações se aplicam a TODOS os documentos e layouts do sistema"
                }</li>
                <li>{language === "english" 
                  ? "Individual document permissions can override these global settings" 
                  : "Permissões individuais de documentos podem sobrescrever essas configurações globais"
                }</li>
                <li>{language === "english" 
                  ? "Administrators always have full access regardless of these settings" 
                  : "Administradores sempre têm acesso total independentemente dessas configurações"
                }</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="individual-documents-section">
          <div className="section-header">
            <h5>
              <span className="section-icon">📄</span>
              {language === "english" ? "INDIVIDUAL DOCUMENTS" : "DOCUMENTOS INDIVIDUAIS"}
            </h5>
            <p className="section-description">
              {language === "english" 
                ? "Configure permissions for specific documents. These settings override global controls for individual items." 
                : "Configure permissões para documentos específicos. Essas configurações sobrescrevem os controles globais para itens individuais."
              }
            </p>
          </div>

          <div className="documents-list">
            {layouts.length > 0 && (
              <div className="document-category">
                <h6 className="category-title">
                  <span className="category-icon">🎨</span>
                  {language === "english" ? "Document Layouts" : "Layouts de Documentos"} 
                  <span className="category-count">({layouts.length})</span>
                </h6>
                
                <div className="documents-grid">
                  {layouts.map(layout => (
                    <div key={`layout-${layout.id}`} className="document-card">
                      <div className="document-info">
                        <div className="document-name">
                          <span className="document-icon">🎨</span>
                          {layout.name || layout.title}
                        </div>
                        <div className="document-type-badge">
                          {language === "english" ? "Layout" : "Layout"}
                        </div>
                      </div>
                      
                      <div className="document-permissions">
                        {roles.map(role => (
                          <div key={role.id} className="role-permission">
                            <span className="role-label">{role.icon} {role.name}:</span>
                            {renderToggleSwitch(
                              getIndividualDocumentPermission(layout.id, 'layout', role.id, 'view'),
                              () => {
                                const currentValue = getIndividualDocumentPermission(layout.id, 'layout', role.id, 'view');
                                handleIndividualDocumentPermissionChange(layout.id, 'layout', role.id, 'view', !currentValue);
                              },
                              `${role.name} - ${layout.name} - View`
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="document-category">
                <h6 className="category-title">
                  <span className="category-icon">📄</span>
                  {language === "english" ? "Documents" : "Documentos"} 
                  <span className="category-count">({documents.length})</span>
                </h6>
                
                <div className="documents-grid">
                  {documents.map(document => (
                    <div key={`document-${document.id}`} className="document-card">
                      <div className="document-info">
                        <div className="document-name">
                          <span className="document-icon">📄</span>
                          {document.name || document.title}
                        </div>
                        <div className="document-type-badge">
                          {language === "english" ? "Document" : "Documento"}
                        </div>
                      </div>
                      
                      <div className="document-permissions">
                        {roles.map(role => (
                          <div key={role.id} className="role-permission">
                            <span className="role-label">{role.icon} {role.name}:</span>
                            {renderToggleSwitch(
                              getIndividualDocumentPermission(document.id, 'document', role.id, 'view'),
                              () => {
                                const currentValue = getIndividualDocumentPermission(document.id, 'document', role.id, 'view');
                                handleIndividualDocumentPermissionChange(document.id, 'document', role.id, 'view', !currentValue);
                              },
                              `${role.name} - ${document.name || document.title} - View`
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length === 0 && layouts.length === 0 && (
              <div className="no-documents">
                <div className="no-documents-icon">📄</div>
                <h6>{language === "english" ? "No Documents Found" : "Nenhum Documento Encontrado"}</h6>
                <p>{language === "english" 
                  ? "Create some documents first to configure individual permissions." 
                  : "Crie alguns documentos primeiro para configurar permissões individuais."
                }</p>
              </div>
            )}
          </div>

          <div className="individual-documents-info">
            <div className="info-box">
              <strong>{language === "english" ? "How Individual Controls Work:" : "Como Funcionam os Controles Individuais:"}</strong>
              <ul>
                <li>{language === "english" 
                  ? "Each document can have its own specific permissions" 
                  : "Cada documento pode ter suas próprias permissões específicas"
                }</li>
                <li>{language === "english" 
                  ? "Individual permissions override global settings for that specific document" 
                  : "Permissões individuais sobrescrevem configurações globais para aquele documento específico"
                }</li>
                <li>{language === "english" 
                  ? "If no individual permission is set, the global permission applies" 
                  : "Se nenhuma permissão individual for definida, a permissão global se aplica"
                }</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="document-permissions-actions">
          <button 
            className="save-button primary"
            onClick={handleSaveDocumentPermissions}
          >
            <span className="button-icon">💾</span>
            {language === "english" ? "Save Global Document Permissions" : "Salvar Permissões Globais de Documentos"}
          </button>

          <button 
            className="save-button primary"
            onClick={handleSaveIndividualDocumentPermissions}
            style={{ marginLeft: '10px' }}
          >
            <span className="button-icon">📄</span>
            {language === "english" ? "Save Individual Document Permissions" : "Salvar Permissões Individuais de Documentos"}
          </button>

          <button 
            className="reset-button secondary"
            onClick={() => handleResetIndividualPermissions('professor')}
            style={{ marginLeft: '10px' }}
          >
            <span className="button-icon">🔄</span>
            {language === "english" ? "Reset Individuals: Teachers" : "Resetar Individuais: Professores"}
          </button>
          <button 
            className="reset-button secondary"
            onClick={() => handleResetIndividualPermissions('colaborador')}
            style={{ marginLeft: '10px' }}
          >
            <span className="button-icon">🔄</span>
            {language === "english" ? "Reset Individuals: Collaborators" : "Resetar Individuais: Colaboradores"}
          </button>
        </div>
      </div>
    );
  };

  const renderGeneralPermissionsTab = () => (
    <div className="general-permissions-container">
      <h3>{language === "english" ? "General Permissions" : "Permissões Gerais"}</h3>
      <p>{language === "english" 
        ? "Configure global permissions that affect ALL users of each role. Individual permissions can override these settings." 
        : "Configure permissões globais que afetam TODOS os usuários de cada função. Permissões individuais podem sobrescrever essas configurações."
      }</p>
      
      {/* Temporariamente ocultando as abas de permissões globais */}
      {false && (
        <>
          <div className="role-tabs-container">
            <div className="role-tabs">
              <button 
                className={`role-tab ${activeRoleTab === 'professor' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('professor')}
              >
                <span className="role-tab-icon">👨‍🏫</span>
                <span>{language === "english" ? "Teachers" : "Professores"}</span>
              </button>
              <button 
                className={`role-tab ${activeRoleTab === 'colaborador' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('colaborador')}
              >
                <span className="role-tab-icon">👥</span>
                <span>{language === "english" ? "Collaborators" : "Colaboradores"}</span>
              </button>
              <button 
                className={`role-tab ${activeRoleTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('documents')}
              >
                <span className="role-tab-icon">📄</span>
                <span>{language === "english" ? "Global Documents" : "Documentos Globais"}</span>
              </button>
            </div>
          </div>

          <div className="role-tab-content">
            {activeRoleTab === 'documents' ? renderDocumentPermissions() : renderRolePermissions(activeRoleTab)}
          </div>

          <div className="global-permissions-actions">
            <button className="submit-button" onClick={handleSaveGlobalPermissions}>
              {language === "english" ? "Save Global Permissions" : "Salvar Permissões Globais"}
            </button>
          </div>
        </>
      )}

      <div className="global-sections">
        <div className="pages-global-section">
          <h4>{language === "english" ? "Pages (Global)" : "Páginas (Globais)"}</h4>
          <div className="global-controls-grid">
            {['professor', 'colaborador'].map(roleKey => (
              <div key={roleKey} className="global-role-card">
                <div className="role-header">
                  <span className="role-icon">{roleKey === 'professor' ? '👨‍🏫' : '👥'}</span>
                  <h6 className="role-title">
                    {roleKey === 'professor' ? (language === 'english' ? 'Teachers' : 'Professores') : (language === 'english' ? 'Collaborators' : 'Colaboradores')}
                  </h6>
                </div>
                <div className="permissions-grid">
                  <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Dashboard" : "Painel Principal"}</span>
                    <ToggleSwitch
                      checked={globalPermissions[roleKey]?.can_access_dashboard}
                      onChange={(val) => handleGlobalPermissionChange(roleKey, 'can_access_dashboard', val)}
                      label={language === 'english' ? 'Dashboard access (global)' : 'Acesso ao Painel (global)'}
                    />
                  </div>
                  <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Users" : "Usuários"}</span>
                    <ToggleSwitch
                      checked={globalPermissions[roleKey]?.can_access_users}
                      onChange={(val) => handleGlobalPermissionChange(roleKey, 'can_access_users', val)}
                      label={language === 'english' ? 'Users access (global)' : 'Acesso a Usuários (global)'}
                    />
                  </div>
                  <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Students" : "Alunos"}</span>
                    <ToggleSwitch
                      checked={globalPermissions[roleKey]?.can_access_students}
                      onChange={(val) => handleGlobalPermissionChange(roleKey, 'can_access_students', val)}
                      label={language === 'english' ? 'Students access (global)' : 'Acesso a Alunos (global)'}
                    />
                  </div>
                  <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Subjects" : "Disciplinas"}</span>
                    <ToggleSwitch
                      checked={globalPermissions[roleKey]?.can_access_subjects}
                      onChange={(val) => handleGlobalPermissionChange(roleKey, 'can_access_subjects', val)}
                      label={language === 'english' ? 'Subjects access (global)' : 'Acesso a Disciplinas (global)'}
                    />
                  </div>
                  <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Documents" : "Documentos"}</span>
                    <ToggleSwitch
                      checked={globalPermissions[roleKey]?.can_access_documents}
                      onChange={(val) => handleGlobalPermissionChange(roleKey, 'can_access_documents', val)}
                      label={language === 'english' ? 'Documents access (global)' : 'Acesso a Documentos (global)'}
                    />
                  </div>
                  <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Storage" : "Estoque"}</span>
                    <ToggleSwitch
                      checked={globalPermissions[roleKey]?.can_access_storage}
                      onChange={(val) => handleGlobalPermissionChange(roleKey, 'can_access_storage', val)}
                      label={language === 'english' ? 'Storage access (global)' : 'Acesso ao Estoque (global)'}
                    />
                  </div>
                  <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Summary Data" : "Dados Resumidos"}</span>
                    <ToggleSwitch
                      checked={globalPermissions[roleKey]?.can_access_summary_data}
                      onChange={(val) => handleGlobalPermissionChange(roleKey, 'can_access_summary_data', val)}
                      label={language === 'english' ? 'Summary Data access (global)' : 'Acesso a Dados Resumidos (global)'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="document-permissions-actions">
            <button className="save-button primary" onClick={handleSaveGlobalPermissions}>
              <span className="button-icon">💾</span>
              {language === "english" ? "Save Global Page Permissions" : "Salvar Permissões Globais de Páginas"}
            </button>
            <button className="reset-button secondary" onClick={() => handleResetIndividualPermissions('professor')}>
              <span className="button-icon">🔄</span>
              {language === "english" ? "Apply to all Teachers (Reset Individuals)" : "Aplicar a todos os Professores (Reset Individuais)"}
            </button>
            <button className="reset-button secondary" onClick={() => handleResetIndividualPermissions('colaborador')}>
              <span className="button-icon">🔄</span>
              {language === "english" ? "Apply to all Collaborators (Reset Individuals)" : "Aplicar a todos os Colaboradores (Reset Individuais)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>{language === "english" ? "User Management" : "Gerenciamento de Usuários"}</h2>
        {isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador && (
          <button className="add-user-button" onClick={() => navigate('/users_form')}>
            {language === "english" ? "Add New User" : "Adicionar Novo Usuário"}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="tab-content">
        {renderUsersTab()}
      </div>

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