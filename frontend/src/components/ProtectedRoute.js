import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  
  console.log('🛡️ ProtectedRoute: Verificando autenticação', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0
  });
  
  if (!token) {
    console.log('❌ ProtectedRoute: Sem token, redirecionando para login');
    return <Navigate to="/" replace />;
  }
  
  console.log('✅ ProtectedRoute: Token válido, permitindo acesso');
  return children;
}
