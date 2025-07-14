import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import '../../styles/global.css';
import '../../styles/users.css';
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';


export default function Users() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
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

  const handleEdit = async (id) => {
    navigate(`/users_form/${id}`)
  };

  if(isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.professor){
    return (
      <div className="users-container">
        access denied
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>{language === "english" ? "Users" : "Usuários"}</h2>
        {isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador
          ? <button className="add-user-button" onClick={() => navigate('/users_form')}>
            {language === "english" ? "Add New User" : "Adicionar Novo Usuário"}
          </button>
          : ""
        }
        
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
            { isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador
              ? <div className="user-actions">
                <button className="delete-button" onClick={() => handleDelete(user.id)}>
                  {language === "english" ? "Delete" : "Excluir"}
                </button>
                <button className="edit-button" onClick={() => handleEdit(user.id)}>
                  {language === "english" ? "Edit" : "Editar"}
                </button>
              </div>
              : ""
            }
          </div>
        ))}
      </div>
    </div>
  );
}
