import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";

import '../../styles/global.css';
import '../../styles/users-creation.css';

export default function UsersForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        occupation_id: ""
    });

    useEffect(() => {
        if (id) {
            getUserById();
        }
    }, [id]);

    const getUserById = async () => {
        try {
            const response = await API.get(`/users/${id}`);
            setUser(response.data);
        } catch (err) {
            console.error("Erro ao buscar aluno:", err);
        }
    }

    const handleSave = async () => {
        try {
            if (id) await API.put(`/users/${id}`, user);
            else await API.post("/users", user);
            setUser({
                name: "",
                email: "",
                password: "",
                occupation_id: ""
            });
            navigate("/users");
        } catch (err) {
            setError("Erro ao criar/editar usuário");
        }
    };

    const handleCancel = () => {
        navigate("/users");
    };

    const getOccupationId = (role) => {
        console.log(role)
        switch (role) {
            case "ADMINISTRADOR":
                return 1;
            case "COLABORADOR":
                return 2;
            case "PROFESSOR":
                return 3;
            case 1:
                return "ADMINISTRADOR";
            case 2:
                return "COLABORADOR";
            case 3:
                return "PROFESSOR";
            default:
                break;
        }
    };

    if(isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.professor){
        return (
            <div className="users-container">
            access denied
            </div>
        );
    }

    return (
        <div className="users-creation-container">
            <div className="users-creation-form">
                { id != null
                    ? <h2>Editar Usuário</h2>
                    : <h2>Criar Novo Usuário</h2> 
                }
                
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="name">Nome</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Digite o nome"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Digite o email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Digite a senha"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Função</label>
                    <select
                        id="role"
                        value={user.occupation_id}
                        onChange={(e) => setUser({ ...user, occupation_id: e.target.value})}
                    >
                        <option value="">Selecione uma função</option>
                        <option value="ADMINISTRADOR">Administrador</option>
                        <option value="PROFESSOR">Professor</option>
                        <option value="COLABORADOR">Colaborador</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button className="cancel-button" onClick={handleCancel}>
                        Cancelar
                    </button>
                    <button className="submit-button" onClick={handleSave}>
                        { id ? 'Editar Usuario' : 'Criar Usuário'}
                    </button>
                </div>
            </div>
        </div>
    );
}