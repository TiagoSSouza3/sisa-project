import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const token = getAuthToken();
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
