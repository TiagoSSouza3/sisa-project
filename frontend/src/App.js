import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/UserPages/Users";
import Students from "./pages/StudentPages/Students";
import StudentsForm from "./pages/StudentPages/StudentsForm";
import Subjects from "./pages/SubjectsPages/Subjects";
import SubjectForm from "./pages/SubjectsPages/SubjectForm";
import UsersForm from "./pages/UserPages/UsersForm";
import Summary_data from "./pages/StudentPages/SummaryData";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import './styles/global.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/subject_form" element={<ProtectedRoute><SubjectForm /></ProtectedRoute>} />
        <Route path="/subject_form/:id" element={<ProtectedRoute><SubjectForm /></ProtectedRoute>} />
        <Route path="/student_form" element={<ProtectedRoute><StudentsForm /></ProtectedRoute>} />
        <Route path="/student_form/:id" element={<ProtectedRoute><StudentsForm /></ProtectedRoute>} />
        <Route path="/users_form" element={<ProtectedRoute><UsersForm /></ProtectedRoute>} />
        <Route path="/summary_data" element={<ProtectedRoute><Summary_data /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

