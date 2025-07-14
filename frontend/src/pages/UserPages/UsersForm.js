import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/users-creation.css';

export default function UsersForm() {
    const { id } = useParams();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [error, setError] = useState("");
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        occupation_id: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
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
            navigate("/users");
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
                    ? <h2>{language === "english" ? "Edit User" : "Editar Usuario"}</h2>
                    : <h2>{language === "english" ? "Create New user" : "Criar Novo Usuário"}</h2> 
                }
                
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="name">{language === "english" ? "Name" : "Nome"}</label>
                    <input
                        id="name"
                        type="text"
                        placeholder={language === "english" ? "Write the Name" : "Digite o Nome"}
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder={language === "english" ? "Write the Email Address" : "Digite o Email"}
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">{language === "english" ? "Password" : "Senha"}</label>
                    <input
                        id="password"
                        type="password"
                        placeholder={language === "english" ? "Write the Password" : "Digite a Senha"}
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">{language === "english" ? "Occupation" : "Função"}</label>
                    <select
                        id="role"
                        value={user.occupation_id}
                        onChange={(e) => setUser({ ...user, occupation_id: e.target.value})}
                    >
                        <option value="">{language === "english" ? "Select the occupation" : "Selecione a função"}</option>
                        <option value="ADMINISTRADOR">Administrador</option>
                        <option value="PROFESSOR">Professor</option>
                        <option value="COLABORADOR">Colaborador</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button className="cancel-button" onClick={handleCancel}>
                        {language === "english" ? "Cancel" : "Cancelar"}
                    </button>
                    <button className="submit-button" onClick={handleSave}>
                        { id 
                            ? language === "english" ? "Edit User" : "Editar usuário" 
                            : language === "english" ? "Create User" : "Criar usuário"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}