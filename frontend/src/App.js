import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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


import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import './styles/global.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true }}>
      <Navbar />
      <Routes>
        <Route path='*' exact={true} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Login />} />
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
      </Routes>
    </Router>
  );
}

export default App;

