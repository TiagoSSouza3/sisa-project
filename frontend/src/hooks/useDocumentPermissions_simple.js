import { useState, useEffect, useMemo } from 'react';
import API from '../api';
import { filterAllowedLayouts, filterAllowedDocuments, canAccessLayout, canAccessDocument } from '../utils/granularPermissions';

export const useDocumentPermissions = () => {
  const [permissions, setPermissions] = useState({});
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
      
      console.log('=== CARREGANDO PERMISSÕES ===');
      console.log('User ID:', userId);
      console.log('Occupation ID:', occupationId);
      console.log('Occupation ID Type:', typeof occupationId);
      
      // Determinar role do usuário - verificar tanto string quanto number E nomes diretos
      let role = null;
      const occupationIdUpper = occupationId ? occupationId.toString().toUpperCase() : '';
      
      if (occupationId === "3" || occupationId === 3 || 
          occupationIdUpper === "PROFESSOR" || occupationIdUpper === "PROF") {
        role = "professor";
      } else if (occupationId === "2" || occupationId === 2 || 
                 occupationIdUpper === "COLABORADOR" || occupationIdUpper === "COLAB") {
        role = "colaborador";
      } else if (occupationId === "1" || occupationId === 1 || 
                 occupationIdUpper === "ADMINISTRADOR" || occupationIdUpper === "ADMIN") {
        role = "administrador";
      }
      
      console.log('🔍 Mapeamento de occupation_id:');
      console.log('  Original:', occupationId);
      console.log('  Uppercase:', occupationIdUpper);
      console.log('  Role determinado:', role);
      
      setUserRole(role);
      const isAdminUser = occupationId === "1" || occupationId === 1 || 
                          occupationIdUpper === "ADMINISTRADOR" || occupationIdUpper === "ADMIN";
      setIsAdmin(isAdminUser);

      console.log('User Role Determinado:', role);
      console.log('Is Admin:', isAdminUser);
      
      // ALERTA se a função não foi determinada corretamente
      if (!role) {
        console.error('🚨 ERRO: Função do usuário não foi determinada!');
        console.error('Occupation ID recebido:', occupationId);
        console.error('Verifique se o occupation_id está correto no banco de dados');
      }

      // Administradores têm acesso total
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
        console.log('BUSCANDO PERMISSÕES EFETIVAS DA API...');
        
        try {
          // Buscar somente a fonte de verdade (linha da tabela permissions)
          const response = await API.get(`/permissions/${userId}`);
          if (process.env.NODE_ENV !== 'production') {
            console.log('RESPOSTA DA API (permissions):', response.data);
          }
          setPermissions(response.data);
        } catch (effectiveError) {
          console.error('ERRO ao buscar permissões efetivas:', effectiveError);
          
          // Fallback: permissões individuais
          console.log('FALLBACK: BUSCANDO PERMISSÕES INDIVIDUAIS...');
          const response = await API.get(`/permissions/${userId}`);
          console.log('RESPOSTA DA API (INDIVIDUAIS):', response.data);
          setPermissions(response.data);
        }
        
        // TAMBÉM carregar restrições granulares do banco de dados
        try {
          if (process.env.NODE_ENV !== 'production') {
            console.log('🔧 CARREGANDO RESTRIÇÕES GRANULARES DO BANCO...');
          }
          const restrictionsResponse = await API.get(`/granular-permissions/${userId}/${role}`);
          const restrictions = restrictionsResponse.data;
          if (process.env.NODE_ENV !== 'production') {
            console.log('🔧 Restrições granulares carregadas:', restrictions);
          }
          
          // Salvar no localStorage para uso pelas funções de filtro
          const storageKey = `restrictions_${userId}_${role}`;
          localStorage.setItem(storageKey, JSON.stringify(restrictions));
          if (process.env.NODE_ENV !== 'production') {
            console.log(`🔧 Restrições salvas no localStorage: ${storageKey}`);
          }
          
        } catch (restrictionsError) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('⚠️ Erro ao carregar restrições granulares:', restrictionsError.response?.status);
          }
          // Se não conseguir carregar do banco, manter o que está no localStorage
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 RECALCULANDO FUNÇÕES DE PERMISSÃO');
      console.log('- isAdmin:', isAdmin);
      console.log('- userRole:', userRole);
      console.log('- permissions:', permissions);
    }

    const canAccessDocuments = () => {
      if (isAdmin) {
        if (process.env.NODE_ENV !== 'production') console.log('✅ ADMIN - ACESSO TOTAL A DOCUMENTOS');
        return true;
      }
      const result = permissions.can_access_documents === true;
      if (process.env.NODE_ENV !== 'production') console.log('🔍 canAccessDocuments result:', result);
      return result;
    };

    const canViewLayouts = () => {
      if (isAdmin) {
        if (process.env.NODE_ENV !== 'production') console.log('✅ ADMIN - PODE VER LAYOUTS');
        return true;
      }
      if (!permissions.can_access_documents) {
        if (process.env.NODE_ENV !== 'production') console.log('❌ SEM ACESSO GERAL A DOCUMENTOS');
        return false;
      }
      const rolePermissions = permissions.layout_view_roles || [];
      const result = userRole && rolePermissions.includes(userRole);
      if (process.env.NODE_ENV !== 'production') console.log('🔍 canViewLayouts - userRole:', userRole, 'roles:', rolePermissions, 'result:', result);
      return result;
    };

    const canViewDocuments = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.document_view_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    const canUploadLayouts = () => {
      if (isAdmin) return true;
      if (!permissions.can_access_documents) return false;
      const rolePermissions = permissions.layout_upload_roles || [];
      return userRole && rolePermissions.includes(userRole);
    };

    const canEditLayouts = () => {
      if (isAdmin) {
        if (process.env.NODE_ENV !== 'production') console.log('✅ ADMIN - PODE EDITAR LAYOUTS');
        return true;
      }
      if (!permissions.can_access_documents) {
        if (process.env.NODE_ENV !== 'production') console.log('❌ SEM ACESSO GERAL A DOCUMENTOS - NÃO PODE EDITAR LAYOUTS');
        return false;
      }
      const rolePermissions = permissions.layout_edit_roles || [];
      const result = userRole && rolePermissions.includes(userRole);
      if (process.env.NODE_ENV !== 'production') console.log('🔍 canEditLayouts - userRole:', userRole, 'roles:', rolePermissions, 'result:', result);
      return result;
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

    // Funções para permissões granulares
    const filterLayoutsWithGranularPermissions = (layouts) => {
      const userId = localStorage.getItem("id");
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 === INICIANDO FILTRO GRANULAR DE LAYOUTS ===');
        console.log('User ID do localStorage:', userId);
        console.log('User Role determinado:', userRole);
        console.log('Layouts originais:', layouts.length);
      }
      
      if (!userId || !userRole) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('❌ FALTAM DADOS - userId ou userRole não definidos');
          console.log('Retornando layouts sem filtro');
        }
        return layouts;
      }
      
      const filtered = filterAllowedLayouts(layouts, parseInt(userId), userRole);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Layouts após filtro granular:', filtered.length);
        console.log('🔍 === FIM FILTRO GRANULAR DE LAYOUTS ===');
      }
      
      return filtered;
    };

    const filterDocumentsWithGranularPermissions = (documents) => {
      const userId = localStorage.getItem("id");
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 === INICIANDO FILTRO GRANULAR DE DOCUMENTOS ===');
        console.log('User ID do localStorage:', userId);
        console.log('User Role determinado:', userRole);
        console.log('Documentos originais:', documents.length);
        documents.forEach((doc, index) => {
          console.log(`📄 Documento ${index + 1}:`, {
            id: doc.id,
            title: doc.title || doc.name,
            type: doc.status || 'normal',
            created_by: doc.created_by,
            template_id: doc.template_id
          });
        });
      }
      
      if (!userId || !userRole) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('❌ FALTAM DADOS - userId ou userRole não definidos');
          console.log('Retornando documentos sem filtro');
        }
        return documents;
      }
      
      const filtered = filterAllowedDocuments(documents, parseInt(userId), userRole);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Documentos após filtro granular:', filtered.length);
        filtered.forEach((doc, index) => {
          console.log(`✅ Documento filtrado ${index + 1}:`, {
            id: doc.id,
            title: doc.title || doc.name,
            type: doc.status || 'normal'
          });
        });
        console.log('🔍 === FIM FILTRO GRANULAR DE DOCUMENTOS ===');
      }
      
      return filtered;
    };

    const canAccessSpecificLayout = (layoutId) => {
      const userId = localStorage.getItem("id");
      if (!userId || !userRole) return false;
      
      return canAccessLayout(parseInt(userId), userRole, layoutId);
    };

    const canAccessSpecificDocument = (documentId) => {
      const userId = localStorage.getItem("id");
      if (!userId || !userRole) return false;
      
      return canAccessDocument(parseInt(userId), userRole, documentId);
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
      filterLayoutsWithGranularPermissions,
      filterDocumentsWithGranularPermissions,
      canAccessSpecificLayout,
      canAccessSpecificDocument,
    };
  }, [permissions, userRole, isAdmin]);

  // Log final das permissões
  useEffect(() => {
    if (!loading) {
      console.log('=== PERMISSÕES FINAIS ===');
      console.log('Can Access Documents:', permissionFunctions.canAccessDocuments());
      console.log('Can View Layouts:', permissionFunctions.canViewLayouts());
      console.log('Can View Documents:', permissionFunctions.canViewDocuments());
      console.log('Can Upload Layouts:', permissionFunctions.canUploadLayouts());
      console.log('========================');
    }
  }, [loading, permissionFunctions]);

  return {
    permissions,
    loading,
    userRole,
    isAdmin,
    ...permissionFunctions,
  };
};