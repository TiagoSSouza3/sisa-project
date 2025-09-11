import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api";

export default function PermissionProtectedRoute({ children, requiredPermission }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkPermission();
  }, [requiredPermission]);

  const checkPermission = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");
      const occupationId = localStorage.getItem("occupation_id");
      
      if (!token || !userId) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      // Administradores têm acesso a tudo
      if (occupationId === "1" || occupationId === 1 || occupationId === "ADMINISTRADOR") {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      if (!occupationId) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      // Usar permissões efetivas (individuais + globais)
      const response = await API.get(`/permissions/${userId}/effective?occupation_id=${occupationId}`);
      const permissions = response.data;
      
      const hasAccess = permissions[requiredPermission] === true;
      
      setHasPermission(hasAccess);
      setLoading(false);
    } catch (error) {
      console.error("[PERMISSION_ROUTE] Erro ao verificar permissões efetivas:", error);
      console.error("[PERMISSION_ROUTE] Tipo do erro:", error.name);
      console.error("[PERMISSION_ROUTE] Mensagem:", error.message);
      console.error("[PERMISSION_ROUTE] Status:", error.response?.status);
      
      // Se é Network Error, não tentar fallback - problema de conectividade
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error("[PERMISSION_ROUTE] 🚨 NETWORK ERROR - Backend não está respondendo!");
        console.error("[PERMISSION_ROUTE] Verifique se o servidor backend está rodando na porta 5000");
        setHasPermission(false);
        setLoading(false);
        return;
      }
      
      // Fallback: tentar permissões individuais apenas se não for erro de rede
      try {
        const userId = localStorage.getItem("id");
        if (userId) {
          console.log('[PERMISSION_ROUTE] Fallback: tentando permissões individuais...');
          const response = await API.get(`/permissions/${userId}`);
          const permissions = response.data;
          const hasAccess = permissions[requiredPermission] === true;
          setHasPermission(hasAccess);
        } else {
          setHasPermission(false);
        }
      } catch (fallbackError) {
        console.error("[PERMISSION_ROUTE] Erro no fallback:", fallbackError);
        // Se o fallback também falha, assumir que não tem permissão
        setHasPermission(false);
      }
      
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!hasPermission) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column'
      }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return children;
}