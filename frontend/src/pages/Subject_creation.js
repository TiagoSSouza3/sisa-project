import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

import '../styles/global.css';
import '../styles/subject-creation.css';

export default function SubjectCreation() {
    const navigate = useNavigate();

    const [newSubject, setNewSubject] = useState({
        name: "",
        description: ""
    });

    const handleCreate = async () => {
        try {
            await API.post("/subjects", newSubject);
            setNewSubject({
                name: "",
                description: ""
            });
            navigate("/subjects");
        } catch (err) {
            console.error("Erro ao criar disciplina:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        }
    };

    return (
        <div className="subject-creation-container">
            <h2>Criar Nova Disciplina</h2>
            <form 
                className="subject-form"
                onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleCreate(); 
                }}
            >
                <div className="form-group">
                    <label htmlFor="name">Nome da Disciplina</label>
                    <input 
                        id="name"
                        type="text"
                        placeholder="Digite o nome da disciplina" 
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea 
                        id="description"
                        placeholder="Digite a descrição da disciplina" 
                        value={newSubject.description}
                        onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })} 
                        required
                        maxLength={300}
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => navigate("/subjects")}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="submit-button">
                        Criar Disciplina
                    </button>
                </div>
            </form>
        </div>
    );
};