import React, { useState, useEffect } from "react";
import { useLanguage } from '../components/LanguageContext';
import FirstAccessModal from '../components/FirstAccessModal';
import LinkShortCut from '../components/LinkShortCut';
import API from '../api';

export default function Dashboard() {
  const { language } = useLanguage();
  const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [permissions, setPermissions] = useState({});
  const name = localStorage.getItem("name");
  const userId = localStorage.getItem("id");
  const firstName = name ? name.split(" ")[0] : "Usuário";

  useEffect(() => {
    checkFirstAccess();
    loadUserPermissions();
  }, []);

  const checkFirstAccess = async () => {
    try {
      if (!userId) return;
      
      const response = await API.get(`/users/check-first-access/${userId}`);
      
      if (response.data.first_login) {
        setShowFirstAccessModal(true);
        setUserEmail(response.data.email);
      }
    } catch (error) {
      console.error('Erro ao verificar primeiro acesso:', error);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const userId = localStorage.getItem("id");
      const occupationIdRaw = localStorage.getItem("occupation_id");
      
      // Normalizar occupation_id
      let occupationId = occupationIdRaw;
      if (occupationIdRaw === "PROFESSOR" || occupationIdRaw === "professor") {
        occupationId = "3";
      } else if (occupationIdRaw === "COLABORADOR" || occupationIdRaw === "colaborador") {
        occupationId = "2";
      } else if (occupationIdRaw === "ADMINISTRADOR" || occupationIdRaw === "administrador") {
        occupationId = "1";
      }
      
      // Administrador vê tudo
      if (occupationId === "1" || occupationId === 1 || occupationId === "ADMINISTRADOR") {
        const adminPermissions = {
          can_access_dashboard: true,
          can_access_users: true,
          can_access_students: true,
          can_access_subjects: true,
          can_access_documents: true,
          can_access_storage: true,
          can_access_summary_data: true,
        };
        setPermissions(adminPermissions);
        return;
      }

      if (userId && occupationId) {
        // Efetivas (individuais + globais)
        const response = await API.get(`/permissions/${userId}/effective?occupation_id=${occupationId}`);
        setPermissions(response.data);
      }
    } catch (error) {
      // Fallback: individuais
      try {
        const userId = localStorage.getItem("id");
        if (userId) {
          const response = await API.get(`/permissions/${userId}`);
          setPermissions(response.data);
        }
      } catch (fallbackError) {
        // Permissões padrão restritivas
        const defaultPermissions = {
          can_access_dashboard: true,
          can_access_users: false,
          can_access_students: false,
          can_access_subjects: false,
          can_access_documents: false,
          can_access_storage: false,
          can_access_summary_data: false,
        };
        setPermissions(defaultPermissions);
      }
    }
  };

  const hasPermission = (permission) => {
    const occupationIdRaw = localStorage.getItem("occupation_id");
    let occupationId = occupationIdRaw;
    if (occupationIdRaw === "PROFESSOR" || occupationIdRaw === "professor") {
      occupationId = "3";
    } else if (occupationIdRaw === "COLABORADOR" || occupationIdRaw === "colaborador") {
      occupationId = "2";
    } else if (occupationIdRaw === "ADMINISTRADOR" || occupationIdRaw === "administrador") {
      occupationId = "1";
    }
    if (occupationId === "1" || occupationId === 1) {
      return true;
    }
    return permissions[permission] === true;
  };

  const handleCloseModal = () => {
    setShowFirstAccessModal(false);
  };

  return (
    <div className="container">
      <div className="title-div">
        {showFirstAccessModal && (
          <FirstAccessModal 
            userEmail={userEmail} 
            onClose={handleCloseModal}
          />
        )}
        
        <h1>
          {language === "english" ? "Welcome to system " : "Bem-vindo ao sistema "}
          SISA, {firstName}!
        </h1>
      </div>
      <div className="links-div">
        {hasPermission('can_access_users') && (
          <LinkShortCut 
            name={language === "english" ? "Users" : "Usuários"}
            linkToPage="/users"
          />
        )}
        {hasPermission('can_access_students') && (
          <LinkShortCut 
            name={language === "english" ? "Students" : "Alunos"}
            linkToPage="/students"
          />
        )}
        {hasPermission('can_access_subjects') && (
          <LinkShortCut 
            name={language === "english" ? "Subjects" : "Atividades"}
            linkToPage="/subjects"
          />
        )}
        {hasPermission('can_access_documents') && (
          <LinkShortCut 
            name={language === "english" ? "Documents" : "Documentos"}
            linkToPage="/documents"
          />
        )}
        {/* {hasPermission('can_access_storage') && (
          <LinkShortCut 
            name={language === "english" ? "Storage" : "Estoque"}
            linkToPage="/storage"
          />
        )} */}
        {hasPermission('can_access_summary_data') && (
          <LinkShortCut 
            name={language === "english" ? "Summary Data" : "Dados Resumidos"}
            linkToPage="/summary_data"
          />
        )}
      </div>
    </div>
  );
}
