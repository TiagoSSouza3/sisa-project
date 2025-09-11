import { useState, useEffect, useMemo } from 'react';
import API from '../api';

export const useDocumentPermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [granularPermissions, setGranularPermissions] = useState({
    layouts: {},
    documents: {}
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
      
      console.log('=== CARREGANDO PERMISSÕES GRANULARES ===');
      console.log('User ID:', userId);
      console.log('Occupation ID:', occupationId);
      
      // Determinar role do usuário
      let role = null;
      if (occupationId === "3" || occupationId === 3) {
        role = "professor";
      } else if (occupationId === "2" || occupationId === 2) {
        role = "colaborador";
      } else if (occupationId === "1" || occupationId === 1) {
        role = "administrador";
      }
      
      setUserRole(role);
      const isAdminUser = role === "administrador";
      setIsAdmin(isAdminUser);

      console.log('User Role:', role);
      console.log('Is Admin:', isAdminUser);
      
      if (isAdminUser) {
        console.log('USUÁRIO É ADMIN - ACESSO TOTAL');
        setPermissions({
          can_access_documents: true,
          layout_view_roles: ['professor', 'colaborador'],
          document_view_roles: ['professor', 'colaborador'],
          layout_edit_roles: ['professor', 'colaborador'],
          document_edit_roles: ['professor', 'colaborador'],
          layout_upload_roles: ['professor', 'colaborador'],
          document_upload_roles: ['professor', 'colaborador'],
        });
        setLoading(false);
        return;
      }

      if (userId) {
        // Carregar permissões efetivas (individuais + globais)
        console.log('BUSCANDO PERMISSÕES EFETIVAS DA API...');
        
        try {
          const response = await API.get(`/permissions/${userId}/effective?occupation_id=${occupationId}`);
          console.log('RESPOSTA DA API (EFETIVAS):', response.data);
          setPermissions(response.data);
        } catch (effectiveError) {
          console.error('ERRO ao buscar permissões efetivas:', effectiveError);
          
          // Fallback: permissões individuais
          console.log('FALLBACK: BUSCANDO PERMISSÕES INDIVIDUAIS...');
          const response = await API.get(`/permissions/${userId}`);
          console.log('RESPOSTA DA API (INDIVIDUAIS):', response.data);
          setPermissions(response.data);
        }

        // Carregar permissões granulares para layouts
        console.log('BUSCANDO PERMISSÕES GRANULARES DE LAYOUTS...');
        try {
          const layoutPermsResponse = await API.get(`/layout-permissions/user/${userId}`);
          const layoutPermsMap = {};
          (layoutPermsResponse.data || []).forEach(perm => {
            layoutPermsMap[perm.layout_id] = perm;
          });
          console.log('Permissões granulares de layouts:', layoutPermsMap);
          
          setGranularPermissions(prev => ({
            ...prev,
            layouts: layoutPermsMap
          }));
        } catch (error) {
          console.log('Nenhuma permissão granular de layout encontrada:', error.message);
        }

        // Carregar permissões granulares para documentos
        console.log('BUSCANDO PERMISSÕES GRANULARES DE DOCUMENTOS...');
        try {
          const docPermsResponse = await API.get(`/document-permissions/user/${userId}`);
          const docPermsMap = {};
          (docPermsResponse.data || []).forEach(perm => {
            docPermsMap[perm.document_id] = perm;
          });
          console.log('Permissões granulares de documentos:', docPermsMap);
          
          setGranularPermissions(prev => ({
            ...prev,
            documents: docPermsMap
          }));
        } catch (error) {
          console.log('Nenhuma permissão granular de documento encontrada:', error.message);
        }
      }
    } catch (error) {
      console.error("ERRO ao carregar permissões:", error);
      setPermissions({
        can_access_documents: false,
        layout_view_roles: [],
        document_view_roles: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Usar useMemo para criar versões estáveis das funções
  const permissionFunctions = useMemo(() => {
    console.log('🔄 RECALCULANDO FUNÇÕES DE PERMISSÃO GRANULARES');
    console.log('- isAdmin:', isAdmin);
    console.log('- userRole:', userRole);
    console.log('- permissions:', permissions);
    console.log('- granularPermissions:', granularPermissions);

    const canAccessDocuments = () => {
      if (isAdmin) {
        console.log('✅ ADMIN - ACESSO TOTAL A DOCUMENTOS');
        return true;
      }
      const result = permissions.can_access_documents === true;
      console.log('🔍 canAccessDocuments result:', result);
      return result;
    };

    // Função para verificar se pode ver layouts (geral)
    const canViewLayouts = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.layout_view_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    // Função para verificar se pode ver um layout específico
    const canViewLayout = (layoutId) => {
      if (isAdmin) return true;
      if (!canViewLayouts()) return false;
      
      // Se não há permissões granulares, usar permissões gerais
      if (Object.keys(granularPermissions.layouts).length === 0) {
        return canViewLayouts();
      }
      
      // Verificar permissão granular específica
      const layoutPerm = granularPermissions.layouts[layoutId];
      return layoutPerm && layoutPerm.can_view;
    };

    // Função para verificar se pode usar um layout específico
    const canUseLayout = (layoutId) => {
      if (isAdmin) return true;
      if (!canViewLayouts()) return false;
      
      // Se não há permissões granulares, usar permissões gerais de edição
      if (Object.keys(granularPermissions.layouts).length === 0) {
        const rolePermissions = permissions.layout_edit_roles || [];
        return userRole && rolePermissions.includes(userRole);
      }
      
      // Verificar permissão granular específica
      const layoutPerm = granularPermissions.layouts[layoutId];
      return layoutPerm && layoutPerm.can_use;
    };

    // Função para verificar se pode editar um layout específico
    const canEditLayout = (layoutId) => {
      if (isAdmin) return true;
      if (!canViewLayouts()) return false;
      
      // Se não há permissões granulares, usar permissões gerais de edição
      if (Object.keys(granularPermissions.layouts).length === 0) {
        const rolePermissions = permissions.layout_edit_roles || [];
        return userRole && rolePermissions.includes(userRole);
      }
      
      // Verificar permissão granular específica
      const layoutPerm = granularPermissions.layouts[layoutId];
      return layoutPerm && layoutPerm.can_edit;
    };

    // Funções similares para documentos
    const canViewDocuments = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.document_view_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    const canViewDocument = (documentId) => {
      if (isAdmin) return true;
      if (!canViewDocuments()) return false;
      
      // Se não há permissões granulares, usar permissões gerais
      if (Object.keys(granularPermissions.documents).length === 0) {
        return canViewDocuments();
      }
      
      // Verificar permissão granular específica
      const docPerm = granularPermissions.documents[documentId];
      return docPerm && docPerm.can_view;
    };

    const canEditDocument = (documentId) => {
      if (isAdmin) return true;
      if (!canViewDocuments()) return false;
      
      // Se não há permissões granulares, usar permissões gerais de edição
      if (Object.keys(granularPermissions.documents).length === 0) {
        const rolePermissions = permissions.document_edit_roles || [];
        return userRole && rolePermissions.includes(userRole);
      }
      
      // Verificar permissão granular específica
      const docPerm = granularPermissions.documents[documentId];
      return docPerm && docPerm.can_edit;
    };

    const canDownloadDocument = (documentId) => {
      if (isAdmin) return true;
      if (!canViewDocuments()) return false;
      
      // Se não há permissões granulares, permitir download se pode ver
      if (Object.keys(granularPermissions.documents).length === 0) {
        return canViewDocuments();
      }
      
      // Verificar permissão granular específica
      const docPerm = granularPermissions.documents[documentId];
      return docPerm && docPerm.can_download;
    };

    // Funções gerais (mantidas para compatibilidade)
    const canEditLayouts = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.layout_edit_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    const canUploadLayouts = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.layout_upload_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    const canEditDocuments = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.document_edit_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    const canUploadDocuments = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.document_upload_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    // Função para filtrar layouts baseado nas permissões granulares
    const filterAllowedLayouts = (layouts) => {
      if (isAdmin) return layouts;
      if (!canViewLayouts()) return [];
      
      // Se não há permissões granulares, retornar todos os layouts
      if (Object.keys(granularPermissions.layouts).length === 0) {
        return layouts;
      }
      
      // Filtrar apenas layouts com permissão específica
      return layouts.filter(layout => canViewLayout(layout.id));
    };

    // Função para filtrar documentos baseado nas permissões granulares
    const filterAllowedDocuments = (documents) => {
      if (isAdmin) return documents;
      if (!canViewDocuments()) return [];
      
      // Se não há permissões granulares, retornar todos os documentos
      if (Object.keys(granularPermissions.documents).length === 0) {
        return documents;
      }
      
      // Filtrar apenas documentos com permissão específica
      return documents.filter(document => canViewDocument(document.id));
    };

    return {
      canAccessDocuments,
      canViewLayouts,
      canViewDocuments,
      canUploadLayouts,
      canEditLayouts,
      canEditDocuments,
      canUploadDocuments,
      // Novas funções granulares
      canViewLayout,
      canUseLayout,
      canEditLayout,
      canViewDocument,
      canEditDocument,
      canDownloadDocument,
      filterAllowedLayouts,
      filterAllowedDocuments,
    };
  }, [permissions, granularPermissions, userRole, isAdmin]);

  return {
    permissions,
    granularPermissions,
    loading,
    userRole,
    isAdmin,
    ...permissionFunctions,
  };
};