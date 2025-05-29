import React, { useEffect, useState } from "react";
import API from "../api";

import '../styles/global.css';
import '../styles/users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [novo, setNovo] = useState({ name: "", email: "", password: "", occupation_id: 3 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError("Erro ao carregar usuários");
    }
  };

  const handleCreate = async () => {
    try {
      await API.post("/users", novo);
      await loadUsers();
      setNovo({ name: "", email: "", password: "", occupation_id: 3 });
      setSuccess("Usuário criado com sucesso!");
    } catch (err) {
      setError("Erro ao criar usuário");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setSuccess("Usuário removido com sucesso!");
    } catch (err) {
      setError("Erro ao remover usuário");
    }
  };

  const getOccupationId = (id) => {
    console.log(id);
    switch (id) {
      case "Administrador":
        return 1;
      case "Colaborador":
        return 2;
      case "Professor":
        return 3;
      default:
        return -1;
    }
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Usuários</h2>
        <button className="add-user-button" onClick={() => document.getElementById('userForm').scrollIntoView({ behavior: 'smooth' })}>
          Adicionar Novo Usuário
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              <span className="user-role">{user.occupation_id}</span>
            </div>
            <div className="user-actions">
              <button className="delete-button" onClick={() => handleDelete(user.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      <form 
        id="userForm"
        className="user-form" 
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <h3>Adicionar Novo Usuário</h3>
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input 
            id="name"
            type="text"
            placeholder="Digite o nome do usuário"
            value={novo.name}
            onChange={(e) => setNovo({ ...novo, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email"
            placeholder="Digite o email do usuário"
            value={novo.email}
            onChange={(e) => setNovo({ ...novo, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input 
            id="password"
            type="password"
            placeholder="Digite a senha"
            value={novo.password}
            onChange={(e) => setNovo({ ...novo, password: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="occupation">Função</label>
          <select 
            id="occupation"
            value={novo.occupation_id}
            onChange={(e) => setNovo({ ...novo, occupation_id: Number(e.target.value) })}
          >
            <option value="1">Administrador</option>
            <option value="2">Colaborador</option>
            <option value="3">Professor</option>
          </select>
        </div>
        <button type="submit" className="add-user-button">Criar Usuário</button>
      </form>
    </div>
  );
}
