import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/UserPages/Users";
import Students from "./pages/StudentPages/Students";
import StudentsForm from "./pages/StudentPages/StudentsForm";
import Subjects from "./pages/SubjectsPages/Subjects";
import SubjectForm from "./pages/SubjectsPages/SubjectForm";
import SubjectInfos from "./pages/SubjectsPages/SubjectInfos";
import SubjectInscription from "./pages/SubjectsPages/SubjectInscription";
import UsersForm from "./pages/UserPages/UsersForm";
import Summary_data from "./pages/StudentPages/SummaryData";
import Documents from "./pages/Documents/Documents";
import ResetPassword from "./pages/ResetPassword";
import FirstAccess from "./pages/FirstAccess";
import Storage from "./pages/Storage/Storage";
import StorageLog from "./pages/Storage/StorageLog";
import CashFlow from "./pages/Storage/CashFlow";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionProtectedRoute from "./components/PermissionProtectedRoute";

import './styles/global.css';

function App() {
  useEffect(() => {
    const url = `https://sisa.up.railway.app/api/health/frontend?frontendHost=${window.location.host}`;
    fetch(url, { method: 'GET', credentials: 'include' }).catch(() => {});
  }, []);
  return (
    <Router future={{ v7_startTransition: true }}>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path='*' exact={true} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/first-access/:token" element={<FirstAccess />} />
        <Route path="/first-access" element={<FirstAccess />} />
        <Route path="/dashboard" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_dashboard"><Dashboard /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_users"><Users /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/users_form" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_users"><UsersForm /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/users_form/:id" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_users"><UsersForm /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_students"><Students /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/student_form" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_students"><StudentsForm /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/student_form/:id" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_students"><StudentsForm /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_subjects"><Subjects /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/subject_form" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_subjects"><SubjectForm /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/subject_form/:id" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_subjects"><SubjectForm /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/subject_infos/:id" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_subjects"><SubjectInfos /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/subject_inscription/:id" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_subjects"><SubjectInscription /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/summary_data" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_summary_data"><Summary_data /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_documents"><Documents /></PermissionProtectedRoute></ProtectedRoute>} />
        {/* <Route path="/storage" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_storage"><Storage /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/storage_log/:id" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_storage"><StorageLog /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/storage_log/" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_storage"><StorageLog /></PermissionProtectedRoute></ProtectedRoute>} />
        <Route path="/cash_flow" element={<ProtectedRoute><PermissionProtectedRoute requiredPermission="can_access_storage"><CashFlow /></PermissionProtectedRoute></ProtectedRoute>} /> */}
      </Routes>
    </>
  );
}

export default App;

