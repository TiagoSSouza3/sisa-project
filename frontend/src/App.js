import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Participants from "./pages/Participants";
import Activities from "./pages/Activities";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router future={{ v7_startTransition: true }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/participantes" element={<ProtectedRoute><Participants /></ProtectedRoute>} />
        <Route path="/atividades" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
