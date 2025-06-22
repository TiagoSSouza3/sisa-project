import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

import '../../styles/global.css';
import '../../styles/users-creation.css';

export default function UsersForm() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        occupation_id: ""
    });

    const handleCreate = async () => {
        try {
            await API.post("/users", newUser);
            setNewUser({
                name: "",
                email: "",
                password: "",
                role: ""
            });
            navigate("/users");
        } catch (err) {
            setError("Erro ao criar usuário");
        }
    };

    const handleCancel = () => {
        navigate("/users");
    };

    const getOccupationId = (role) => {
        if (role === "ADMINISTRADOR") return 1;
        if (role === "COLABORADOR") return 2;
        if (role === "PROFESSOR") return 3;
    };

    return (
        <div className="users-creation-container">
            <div className="users-creation-form">
                <h2>Criar Novo Usuário</h2>
                
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="name">Nome</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Digite o nome"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Digite o email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Digite a senha"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Função</label>
                    <select
                        id="role"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, occupation_id: getOccupationId(e.target.value)})}
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
                    <button className="submit-button" onClick={handleCreate}>
                        Criar Usuário
                    </button>
                </div>
            </div>
        </div>
    );
}