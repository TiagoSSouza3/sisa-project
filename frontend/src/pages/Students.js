import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles.css";

export default function Participants() {
  const [list, setList] = useState([]);
  const [novo, setNovo] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await API.get("/participants");
      setList(res.data);
    } catch (err) {
      setError("Erro ao carregar participantes");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      await API.post("/participants", novo);
      setNovo({ name: "", email: "", phone: "" });
      setSuccess("Participante criado com sucesso!");
      load();
    } catch (err) {
      setError("Erro ao criar participante");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/participants/${id}`);
      setSuccess("Participante removido com sucesso!");
      load();
    } catch (err) {
      setError("Erro ao remover participante");
    }
  };

  return (
    <div className="container">
      <h2>Participantes</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
        <input 
          placeholder="Nome" 
          value={novo.name}
          onChange={(e) => setNovo({ ...novo, name: e.target.value })} 
          required 
        />
        <input 
          type="email"
          placeholder="Email" 
          value={novo.email}
          onChange={(e) => setNovo({ ...novo, email: e.target.value })} 
        />
        <input 
          placeholder="Telefone" 
          value={novo.phone}
          onChange={(e) => setNovo({ ...novo, phone: e.target.value })} 
        />
        <button type="submit">Criar Participante</button>
      </form>

      <div className="list">
        {list.map(p => (
          <div key={p.id} className="list-item">
            <div>
              <strong>{p.name}</strong>
              {p.email && <div>{p.email}</div>}
              {p.phone && <div>{p.phone}</div>}
            </div>
            <button onClick={() => handleDelete(p.id)} className="delete-btn">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
