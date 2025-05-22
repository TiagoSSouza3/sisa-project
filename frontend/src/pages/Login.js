import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  localStorage.clear();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("occupation_id", res.data.user.occupation_id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro detalhado:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Erro ao fazer login");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Entrar no SISA</h2>
      <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Entrar</button>
    </form>
  );
}
