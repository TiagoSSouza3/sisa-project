import { useState, useEffect } from 'react';
import API from '../api';

export const useDocumentPermissions = () => {
  const [permissions, setPermissions] = useState({
    // Permissões gerais
    can_access_documents: false,
    
    // Permissões específicas
    can_view_documents: false,
    can_edit_documents: false,
    can_upload_documents: false,
    can_view_layouts: false,
    can_edit_layouts: false,
    can_upload_layouts: false,
    
    // Permissões por role
    document_view_roles: [],
    document_edit_roles: [],
    document_upload_roles: [],
    layout_view_roles: [],
    layout_edit_roles: [],
    layout_upload_roles: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const userId = localStorage.getItem("id");
      const occupationId = localStorage.getItem("occupation_id");
      
      // Determinar role do usuário
      let role = null;
      if (occupationId === "3") role = "professor";
      else if (occupationId === "2") role = "colaborador";
      
      setUserRole(role);
      setIsAdmin(occupationId === "1" || occupationId === 1);

      // Administradores têm acesso total
      if (occupationId === "1" || occupationId === 1) {
        setPermissions({
          can_access_documents: true,
          can_view_documents: true,
          can_edit_documents: true,
          can_upload_documents: true,
          can_view_layouts: true,
          can_edit_layouts: true,
          can_upload_layouts: true,
          document_view_roles: ['professor', 'colaborador'],
          document_edit_roles: ['professor', 'colaborador'],
          document_upload_roles: ['professor', 'colaborador'],
          layout_view_roles: ['professor', 'colaborador'],
          layout_edit_roles: ['professor', 'colaborador'],
          layout_upload_roles: ['professor', 'colaborador'],
        });
        setLoading(false);
        return;
      }

      if (userId && occupationId) {
        console.log('[DOCUMENT_PERMISSIONS] Buscando permissões efetivas...');
        
        try {
          // Usar permissões efetivas (individuais + globais)
          const response = await API.get(`/permissions/${userId}/effective?occupation_id=${occupationId}`);
          console.log('[DOCUMENT_PERMISSIONS] Permissões efetivas recebidas:', response.data);
          setPermissions(response.data);
        } catch (effectiveError) {
          console.error('[DOCUMENT_PERMISSIONS] Erro ao buscar permissões efetivas:', effectiveError);
          
          // Fallback: permissões individuais
          console.log('[DOCUMENT_PERMISSIONS] Fallback: buscando permissões individuais...');
          const response = await API.get(`/permissions/${userId}`);
          setPermissions(response.data);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar permissões de documentos:", error);
      // Em caso de erro, definir permissões restritivas
      setPermissions({
        can_access_documents: false,
        can_view_documents: false,
        can_edit_documents: false,
        can_upload_documents: false,
        can_view_layouts: false,
        can_edit_layouts: false,
        can_upload_layouts: false,
        document_view_roles: [],
        document_edit_roles: [],
        document_upload_roles: [],
        layout_view_roles: [],
        layout_edit_roles: [],
        layout_upload_roles: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permissionType) => {
    // Administradores sempre têm acesso
    if (isAdmin) return true;
    
    // Verificar se tem acesso geral a documentos
    if (!permissions.can_access_documents) return false;
    
    // Verificar permissão específica baseada no role
    const rolePermissions = permissions[`${permissionType}_roles`] || [];
    return userRole && rolePermissions.includes(userRole);
  };

  // Função para debug - vamos adicionar logs
  const debugPermissions = () => {
    console.log('=== DEBUG PERMISSIONS ===');
    console.log('User Role:', userRole);
    console.log('Is Admin:', isAdmin);
    console.log('Can Access Documents:', permissions.can_access_documents);
    console.log('Layout View Roles:', permissions.layout_view_roles);
    console.log('Document View Roles:', permissions.document_view_roles);
    console.log('All Permissions:', permissions);
    console.log('========================');
  };

  // Debug automático quando as permissões carregam
  useEffect(() => {
    if (!loading) {
      debugPermissions();
    }
  }, [permissions, loading, userRole, isAdmin]);

  // Funções específicas para cada tipo de permissão
  const canViewDocuments = () => hasPermission('document_view');
  const canEditDocuments = () => hasPermission('document_edit');
  const canUploadDocuments = () => hasPermission('document_upload');
  const canViewLayouts = () => hasPermission('layout_view');
  const canEditLayouts = () => hasPermission('layout_edit');
  const canUploadLayouts = () => hasPermission('layout_upload');

  return {
    permissions,
    loading,
    userRole,
    isAdmin,
    hasPermission,
    canViewDocuments,
    canEditDocuments,
    canUploadDocuments,
    canViewLayouts,
    canEditLayouts,
    canUploadLayouts,
    canAccessDocuments: permissions.can_access_documents || isAdmin,
    debugPermissions, // Exportar função de debug para uso manual
  };
};