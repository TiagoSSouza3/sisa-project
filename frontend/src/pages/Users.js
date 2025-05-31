import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import '../styles/global.css';
import '../styles/users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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

  const handleDelete = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setSuccess("Usuário removido com sucesso!");
    } catch (err) {
      setError("Erro ao remover usuário");
    }
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Usuários</h2>
        <button className="add-user-button" onClick={() => navigate('/users_create')}>
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
    </div>
  );
}
