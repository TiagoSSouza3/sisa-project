import React from "react";
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

import './styles/global.css';

function App() {
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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/users_form" element={<ProtectedRoute><UsersForm /></ProtectedRoute>} />
        <Route path="/users_form/:id" element={<ProtectedRoute><UsersForm /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/student_form" element={<ProtectedRoute><StudentsForm /></ProtectedRoute>} />
        <Route path="/student_form/:id" element={<ProtectedRoute><StudentsForm /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/subject_form" element={<ProtectedRoute><SubjectForm /></ProtectedRoute>} />
        <Route path="/subject_form/:id" element={<ProtectedRoute><SubjectForm /></ProtectedRoute>} />
        <Route path="/subject_infos/:id" element={<ProtectedRoute><SubjectInfos /></ProtectedRoute>} />
        <Route path="/subject_inscription/:id" element={<ProtectedRoute><SubjectInscription /></ProtectedRoute>} />
        <Route path="/summary_data" element={<ProtectedRoute><Summary_data /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/storage" element={<ProtectedRoute><Storage /></ProtectedRoute>} />
        <Route path="/storage_log/:id" element={<ProtectedRoute><StorageLog /></ProtectedRoute>} />
        <Route path="/cash-flow" element={<ProtectedRoute><CashFlow /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;

