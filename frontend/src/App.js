import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import SubjectCreation from "./pages/Subject_creation";
import StudentsCreation from "./pages/Students_creation";
import UsersCreation from "./pages/Users_creation";

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
        <Route path="/subject_create" element={<ProtectedRoute><SubjectCreation /></ProtectedRoute>} />
        <Route path="/student_create" element={<ProtectedRoute><StudentsCreation /></ProtectedRoute>} />
        <Route path="/users_create" element={<ProtectedRoute><UsersCreation /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

