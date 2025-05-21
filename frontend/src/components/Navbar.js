import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#eee", display: "flex", justifyContent: "space-between" }}>
      <div><strong>SISA</strong></div>
      <div>
        <Link to="/dashboard">Início</Link> |{" "}
        <Link to="/usuarios">Usuários</Link> |{" "}
        <Link to="/participantes">Participantes</Link> |{" "}
        <Link to="/atividades">Atividades</Link>
      </div>
    </nav>
  );
}
