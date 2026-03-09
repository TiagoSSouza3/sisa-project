import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';
import { validateEmail } from '../../utils/validation';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';
import GranularPermissions from '../../components/GranularPermissions';
import ToggleSwitch from '../../components/ToggleSwitch';

import '../../styles/global.css';
import '../../styles/users-creation.css';
import '../../styles/document-permissions-unified.css';

export default function UsersForm() {
    const { id } = useParams();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
    const [activeTab, setActiveTab] = useState("info");
    const [activePermissionTab, setActivePermissionTab] = useState("general");
    const [user, setUser] = useState({
        name: "",
        email: "",
        occupation_id: ""
    });
    const [permissions, setPermissions] = useState({
        can_access_dashboard: true,
        can_access_users: false,
        can_access_students: false,
        can_access_subjects: false,
        can_access_documents: false,
        can_access_storage: false,
        can_access_summary_data: false,
        
        // Permissões específicas para documentos
        can_view_documents: false,
        can_edit_documents: false,
        can_upload_documents: false,
        can_view_layouts: false,
        can_edit_layouts: false,
        can_upload_layouts: false,
        
        // Permissões por role para documentos
        document_view_roles: [],
        document_edit_roles: [],
        document_upload_roles: [],
        layout_view_roles: [],
        layout_edit_roles: [],
        layout_upload_roles: [],
    });
    
    const [effectivePermissions, setEffectivePermissions] = useState({});
    const [individualPermissions, setIndividualPermissions] = useState({});
    const [usingGlobalSeed, setUsingGlobalSeed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savingText, setSavingText] = useState("");
    // Logged-in user and role info
    const loggedUserId = localStorage.getItem("id");
    const loggedOccupation = localStorage.getItem("occupation_id");
    const isSelf = id && loggedUserId && String(id) === String(loggedUserId);
    const isAdminLogged = loggedOccupation === occupationEnum.administrador || loggedOccupation === "1" || loggedOccupation === 1;
    // const [initialOccupationId, setInitialOccupationId] = useState(null); // ATIVAR para bloquear rebaixar admin

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        if (id) {
            getUserById();
        }
    }, [id]);

    // Recarregar permissões quando o usuário for carregado
    useEffect(() => {
        if (id) {
            getUserPermissions();
        }
    }, [id]);

    const getUserById = async () => {
        try {
            const response = await API.get(`/users/${id}`);
            setUser(response.data);
            // setInitialOccupationId(response.data?.occupation_id); // ATIVAR para bloquear rebaixar admin (guarda função original)
        } catch (err) {
            console.error("Erro ao buscar usuário:", err);
            navigate("/users");
        }
    }

    const getUserPermissions = async () => {
        try {
            console.log('🔍 Carregando permissões (fonte de verdade) para usuário:', id);
            // Carrega a linha da tabela permissions (também é o retorno do /effective simplificado)
            const response = await API.get(`/permissions/${id}`);
            const data = response.data;
            setIndividualPermissions(data);
            setEffectivePermissions(data);
            setPermissions(prev => ({ ...prev, ...data }));
            setUsingGlobalSeed(false); // até o usuário resetar manualmente
        } catch (err) {
            console.error("Erro ao buscar permissões:", err);
        }
    }

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setUser({ ...user, email: emailValue });
        
        if (emailValue) {
            const emailValidation = validateEmail(emailValue);
            if (!emailValidation.isValid) {
                setEmailError(emailValidation.message);
            } else {
                setEmailError("");
            }
        } else {
            setEmailError("");
        }
    };

    const handleSave = async () => {
        // Validar campos obrigatórios
        if (!user.name.trim()) {
            setError(language === "english" ? "Name is required" : "Nome é obrigatório");
            return;
        }

        if (!user.email.trim()) {
            setError(language === "english" ? "Email is required" : "Email é obrigatório");
            return;
        }

        if (!user.occupation_id) {
            setError(language === "english" ? "Occupation is required" : "Função é obrigatória");
            return;
        }

        // Validar email
        const emailValidation = validateEmail(user.email);
        if (!emailValidation.isValid) {
            setEmailError(emailValidation.message);
            setError(language === "english" ? "Please fix the email error" : "Por favor, corrija o erro no email");
            return;
        }

        // ATIVAR caso queira PARA IMPEDIR QUE ADMIN REBAIXE OUTRO ADMIN
        // if (isAdminLogged && !isSelf) {
        //     const wasAdmin = String(initialOccupationId) === "1" || initialOccupationId === occupationEnum.administrador;
        //     const changingToNonAdmin = String(user.occupation_id) !== "1" && user.occupation_id !== occupationEnum.administrador;
        //     if (wasAdmin && changingToNonAdmin) {
        //         setError(language === "english" ? "Administrators cannot downgrade other administrators" : "Administradores não podem rebaixar outros administradores");
        //         return;
        //     }
        // }

        try {
            setIsSaving(true);
            setSavingText(id ? (language === "english" ? "Saving..." : "Salvando...") : (language === "english" ? "Creating user..." : "Criando usuário..."));

            if (id) {
                await API.put(`/users/${id}`, user);
                navigate("/users");
            } else {
                // Executa a criação e garante mínimo de 3s de loading
                await Promise.all([
                    API.post("/users", user),
                    new Promise((resolve) => setTimeout(resolve, 3000)),
                ]);

                setSavingText(language === "english" ? "User created successfully!" : "Usuário criado com sucesso!");

                // Aguarda breve tempo para o usuário ver a mensagem de sucesso e então retorna
                await new Promise((resolve) => setTimeout(resolve, 1000));

                navigate("/users");
            }
        } catch (err) {
            console.error("Erro ao salvar usuário:", err);
            setError(err.response?.data?.error || (language === "english" ? "Error creating/editing user" : "Erro ao criar/editar usuário"));
        } finally {
            setIsSaving(false);
            setSavingText("");
        }
    };

    const handlePermissionChange = (permission, value) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: value
        }));
    };

    const handleRolePermissionChange = (permissionType, role, checked) => {
        setPermissions(prev => {
            const currentRoles = prev[permissionType] || [];
            let newRoles;
            
            if (checked) {
                newRoles = [...currentRoles, role];
            } else {
                newRoles = currentRoles.filter(r => r !== role);
            }
            
            return {
                ...prev,
                [permissionType]: newRoles
            };
        });
    };

    const handleSavePermissions = async () => {
        if (isSelf) {
            setError(language === "english" ? "You cannot edit your own permissions" : "Você não pode editar suas próprias permissões");
            return;
        }
        try {
            console.log('=== SALVANDO PERMISSÕES ===');
            console.log('User ID:', id);
            console.log('Permissions to save:', permissions);
            console.log('========================');
            
            const response = await API.post("/permissions", {
                user_id: id,
                permissions: permissions
            });
            
            console.log('✅ Permissões salvas com sucesso:', response.data);
            setError("");
            alert(language === "english" ? "Permissions saved successfully!" : "Permissões salvas com sucesso!");
        } catch (err) {
            console.error("❌ Erro ao salvar permissões:", err);
            console.error("❌ Detalhes do erro:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                statusText: err.response?.statusText
            });
            
            // Verificar se o erro é realmente um erro ou se foi salvo com sucesso
            if (err.response?.status === 200 || err.response?.status === 201) {
                console.log('✅ Permissões foram salvas apesar do erro aparente');
                setError("");
                alert(language === "english" ? "Permissions saved successfully!" : "Permissões salvas com sucesso!");
            } else {
                setError(language === "english" ? "Error saving permissions" : "Erro ao salvar permissões");
            }
        }
    };

    const handleCancel = () => {
        navigate("/users");
    };

    if(isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.professor){
        return (
            <div className="users-container">
                <div className="access-denied">
                    <div className="access-denied-icon">🚫</div>
                    <h2>{language === "english" ? "Access Denied" : "Acesso Negado"}</h2>
                    <p>{language === "english" ? "You don't have permission to access this page." : "Você não tem permissão para acessar esta página."}</p>
                </div>
            </div>
        );
    }

    const renderUserInfoTab = () => (
        <>
            <div className="form-group">
                <label htmlFor="name">{language === "english" ? "Name" : "Nome"} *</label>
                <input
                    id="name"
                    type="text"
                    placeholder={language === "english" ? "Write the Name" : "Digite o Nome"}
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                    id="email"
                    type="text"
                    placeholder={language === "english" ? "Write the Email Address" : "Digite o Email"}
                    value={user.email}
                    onChange={handleEmailChange}
                    required
                />
                {emailError && <span className="error-message">{emailError}</span>}
            </div>

            {!id && (
                <div className="info-message">
                    <p>{language === "english" 
                        ? "The user will receive an email to set their password." 
                        : "O usuário receberá um email para definir sua senha."
                    }</p>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="role">{language === "english" ? "Occupation" : "Função"} *</label>
                <select
                    id="role"
                    value={user.occupation_id}
                    onChange={(e) => setUser({ ...user, occupation_id: e.target.value})}
                    required
                    disabled={isSelf && isAdminLogged /* || (isAdminLogged && !isSelf && (String(user.occupation_id) === "1" || user.occupation_id === occupationEnum.administrador)) */}
                >
                    <option value="">{language === "english" ? "Select the occupation" : "Selecione a função"}</option>
                    <option value="1">Administrador</option>
                    <option value="3">Professor</option>
                    <option value="2">Colaborador</option>
                </select>
                {isSelf && isAdminLogged && (
                    <div className="info-message" style={{ marginTop: '8px' }}>
                        <p>{language === "english" 
                            ? "Administrators cannot change their own role."
                            : "Administradores não podem alterar a própria função."
                        }</p>
                    </div>
                )}
            </div>
        </>
    );

    const renderGeneralPermissionsTab = () => (
        <div className="permissions-section">
            <h4>{language === "english" ? "General Access Permissions" : "Permissões Gerais de Acesso"}</h4>
            <p>{language === "english" ? "Select which areas this user can access:" : "Selecione quais áreas este usuário pode acessar:"}</p>
            
            <div className="permissions-grid">
                <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Dashboard" : "Painel Principal"}</span>
                    <ToggleSwitch
                        checked={permissions.can_access_dashboard}
                        onChange={(val) => handlePermissionChange('can_access_dashboard', val)}
                        label={language === "english" ? "Dashboard access" : "Acesso ao Painel Principal"}
                    />
                </div>

                <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Users" : "Usuários"}</span>
                    <ToggleSwitch
                        checked={permissions.can_access_users}
                        onChange={(val) => handlePermissionChange('can_access_users', val)}
                        label={language === "english" ? "Users access" : "Acesso a Usuários"}
                    />
                </div>

                <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Students" : "Alunos"}</span>
                    <ToggleSwitch
                        checked={permissions.can_access_students}
                        onChange={(val) => handlePermissionChange('can_access_students', val)}
                        label={language === "english" ? "Students access" : "Acesso a Alunos"}
                    />
                </div>

                <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Subjects" : "Disciplinas"}</span>
                    <ToggleSwitch
                        checked={permissions.can_access_subjects}
                        onChange={(val) => handlePermissionChange('can_access_subjects', val)}
                        label={language === "english" ? "Subjects access" : "Acesso a Disciplinas"}
                    />
                </div>

                <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Documents" : "Documentos"}</span>
                    <ToggleSwitch
                        checked={permissions.can_access_documents}
                        onChange={(val) => handlePermissionChange('can_access_documents', val)}
                        label={language === "english" ? "Documents access" : "Acesso a Documentos"}
                    />
                </div>

                {/* <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Storage" : "Estoque"}</span>
                    <ToggleSwitch
                        checked={permissions.can_access_storage}
                        onChange={(val) => handlePermissionChange('can_access_storage', val)}
                        label={language === "english" ? "Storage access" : "Acesso ao Estoque"}
                    />
                </div> */}

                <div className="permission-item">
                    <span className="permission-label">{language === "english" ? "Summary Data" : "Dados Resumidos"}</span>
                    <ToggleSwitch
                        checked={permissions.can_access_summary_data}
                        onChange={(val) => handlePermissionChange('can_access_summary_data', val)}
                        label={language === "english" ? "Summary Data access" : "Acesso a Dados Resumidos"}
                    />
                </div>
            </div>
        </div>
    );

    const renderDocumentPermissionsTab = () => {
        // Filtrar roles baseado na ocupação do usuário
        const allRoles = [
            { id: 'professor', name: language === "english" ? "Teachers" : "Professores" },
            { id: 'colaborador', name: language === "english" ? "Collaborators" : "Colaboradores" }
        ];

        // Determinar a role atual do usuário
        const currentUserRole = user.occupation_id === "3" || user.occupation_id === 3 ? "professor" : 
                              user.occupation_id === "2" || user.occupation_id === 2 ? "colaborador" : 
                              "administrador";

        // Se for administrador, mostrar todas as roles
        // Se for professor ou colaborador, mostrar apenas sua própria role
        const roles = currentUserRole === "administrador" ? allRoles : 
                     allRoles.filter(role => role.id === currentUserRole);

        const renderPermissionToggle = (permissionKey, role, label) => {
            const isAllowed = permissions[permissionKey]?.includes(role.id) || false;
            const hasAccess = isAllowed;
            return (
                <div key={`${permissionKey}-${role.id}`} className="permission-toggle-item">
                    <span className="permission-label">{label}</span>
                    <div className="toggle-switch-container">
                        <button
                            type="button"
                            className={`toggle-switch ${hasAccess ? 'enabled' : 'disabled'}`}
                            onClick={() => handleRolePermissionChange(permissionKey, role.id, !isAllowed)}
                            title={hasAccess
                                ? (language === "english" ? "Click to deny" : "Clique para negar")
                                : (language === "english" ? "Click to allow" : "Clique para permitir")
                            }
                            style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                        >
                            <div className="toggle-slider">
                                <div className="toggle-knob"></div>
                            </div>
                            <span className="toggle-text">
                                {hasAccess
                                    ? (language === "english" ? "Allowed" : "Permitido")
                                    : (language === "english" ? "Denied" : "Negado")
                                }
                            </span>
                        </button>
                    </div>
                </div>
            );
        };

        const renderRoleSection = (role) => (
            <div key={role.id} className="role-permission-section">
                <h5>{role.name}</h5>
                <div className="permission-toggles-grid">
                    <div className="permission-category">
                        <h6>{language === "english" ? "General Documents" : "Documentos Gerais"}</h6>
                        <div className="permission-toggles">
                            {renderPermissionToggle('document_view_roles', role, language === "english" ? "View" : "Visualizar")}
                            {renderPermissionToggle('document_edit_roles', role, language === "english" ? "Edit" : "Editar")}
                            {renderPermissionToggle('document_upload_roles', role, language === "english" ? "Upload" : "Upload")}
                        </div>
                    </div>
                    
                    <div className="permission-category">
                        <h6>{language === "english" ? "Document Layouts" : "Layouts de Documentos"}</h6>
                        <div className="permission-toggles">
                            {renderPermissionToggle('layout_view_roles', role, language === "english" ? "View" : "Visualizar")}
                            {renderPermissionToggle('layout_edit_roles', role, language === "english" ? "Edit" : "Editar")}
                            {renderPermissionToggle('layout_upload_roles', role, language === "english" ? "Upload" : "Upload")}
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="permissions-section">
                <h4>{language === "english" ? "Document Permissions" : "Permissões de Documentos"}</h4>
                <p>{language === "english" 
                    ? "Configure specific permissions for document management. Green = Allowed, Red = Denied. Administrators always have full access." 
                    : "Configure permissões específicas para gerenciamento de documentos. Verde = Permitido, Vermelho = Negado. Administradores sempre têm acesso total."
                }</p>
                
                {/* Mostrar mensagem específica quando não for administrador */}
                {currentUserRole !== "administrador" && (
                    <div className="info-message" style={{ marginBottom: '20px', backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '4px', padding: '12px' }}>
                        <p><strong>{language === "english" ? "Role-specific view:" : "Visualização específica da função:"}</strong></p>
                        <p>{language === "english" 
                            ? `Showing permissions only for ${currentUserRole === "professor" ? "Teachers" : "Collaborators"} since this user has that role.` 
                            : `Mostrando permissões apenas para ${currentUserRole === "professor" ? "Professores" : "Colaboradores"} pois este usuário possui essa função.`
                        }</p>
                    </div>
                )}
                
                <div className="document-permissions-container">
                    {roles.map(role => renderRoleSection(role))}
                </div>

                <div className="info-message" style={{ marginTop: '20px' }}>
                    <p><strong>{language === "english" ? "Note:" : "Nota:"}</strong></p>
                    <p>{language === "english" 
                        ? "• These permissions restrict access by user roles (Teachers/Collaborators)" 
                        : "• Essas permissões restringem o acesso por funções de usuário (Professores/Colaboradores)"
                    }</p>
                    <p>{language === "english" 
                        ? "• Administrators always have full access to all documents" 
                        : "• Administradores sempre têm acesso total a todos os documentos"
                    }</p>
                    {currentUserRole !== "administrador" && (
                        <p>{language === "english" 
                            ? "• Only relevant permissions for this user's role are displayed" 
                            : "• Apenas permissões relevantes para a função deste usuário são exibidas"
                        }</p>
                    )}
                </div>
            </div>
        );
    };

    const renderPermissionsTab = () => (
        <div className="permissions-container">
            <h3>{language === "english" ? "Access Permissions" : "Permissões de Acesso"}</h3>
            
            {/* Sub-tabs for permissions */}
            <div className="permission-sub-tabs">
                <button 
                    className={`permission-tab ${activePermissionTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActivePermissionTab('general')}
                >
                    {language === "english" ? "Page Permissions" : "Permissões de Páginas"}
                </button>
                <button 
                    className={`permission-tab ${activePermissionTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActivePermissionTab('documents')}
                >
                    {language === "english" ? "Documents" : "Documentos"}
                </button>
                <button 
                    className={`permission-tab ${activePermissionTab === 'specific' ? 'active' : ''}`}
                    onClick={() => setActivePermissionTab('specific')}
                >
                    {language === "english" ? "Specific Access" : "Acesso Específico"}
                </button>
            </div>

            {/* Sub-tab content */}
            <div className="permission-tab-content">
                {activePermissionTab === 'general' && renderGeneralPermissionsTab()}
                {activePermissionTab === 'documents' && renderDocumentPermissionsTab()}
                {activePermissionTab === 'specific' && (
                    <GranularPermissions 
                        userId={id}
                        userRole={
                            user.occupation_id === "3" || user.occupation_id === 3 ? "professor" : 
                            user.occupation_id === "2" || user.occupation_id === 2 ? "colaborador" : 
                            "administrador"
                        }
                        onPermissionsChange={(restrictions) => {
                            console.log('Permissões específicas alteradas:', restrictions);
                        }}
                    />
                )}
            </div>

            {id && (
                <div className="permissions-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="submit-button" onClick={handleSavePermissions}>
                        {language === "english" ? "Save" : "Salvar"}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="users-creation-container">
            <div className="users-creation-form">
                {isSaving && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '16px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 600 }}>
                            ⏳ {savingText || (language === "english" ? (id ? "Saving..." : "Creating user...") : (id ? "Salvando..." : "Criando usuário..."))}
                        </div>
                    </div>
                )}
                { id != null
                    ? <h2>{language === "english" ? "Edit User" : "Editar Usuario"}</h2>
                    : <h2>{language === "english" ? "Create New user" : "Criar Novo Usuário"}</h2> 
                }
                
                {error && <div className="error-message">{error}</div>}

                {/* Tabs - only show for editing existing users */}
                {id && (
                    <div className="tabs-container">
                        <div className="tabs">
                            <button 
                                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}
                            >
                                {language === "english" ? "User Info" : "Informações"}
                            </button>
                            {!isSelf && (
                                <button 
                                    className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('permissions')}
                                >
                                    {language === "english" ? "Permissions" : "Permissões"}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                <div className="tab-content">
                    {(!id || activeTab === 'info') && renderUserInfoTab()}
                    {id && !isSelf && activeTab === 'permissions' && renderPermissionsTab()}
                </div>

                {/* Form Actions - only show for user info tab */}
                {(!id || activeTab === 'info') && (
                    <div className="form-actions">
                        <button className="cancel-button" onClick={handleCancel} disabled={isSaving} aria-disabled={isSaving}>
                            {language === "english" ? "Cancel" : "Cancelar"}
                        </button>
                        <button className="submit-button" onClick={handleSave} disabled={isSaving} aria-busy={isSaving}>
                            { isSaving
                                ? (id 
                                    ? (language === "english" ? "Saving..." : "Salvando...")
                                    : (language === "english" ? "Creating..." : "Criando..."))
                                : (id 
                                    ? (language === "english" ? "Edit User" : "Editar usuário") 
                                    : (language === "english" ? "Create User" : "Criar usuário"))
                            }
                        </button>
                    </div>
                )}
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