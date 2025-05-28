import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.js";
import Dashboard from "./pages/Dashboard.js";
import Users from "./pages/Users.js";
import Students from "./pages/Students.js";
import Subjects from "./pages/Subjects.js";
import SubjectCreation from "./pages/Subject_creation.js";
import StudentsCreation from "./pages/Students_creation.js";

import Navbar from "./components/Navbar.js";
import ProtectedRoute from "./components/ProtectedRoute.js";

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
      </Routes>
    </Router>
  );
}

export default App;

