import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, useParams } from "react-router-dom";

import '../styles/global.css';
import '../styles/subject-creation.css';

export default function SubjectCreation() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [subject, setSubject] = useState({
        name: "",
        description: ""
    });

    useEffect(() => {
        if (id) {
            loadSubject();
        }
    }, [id]);

    const loadSubject = async () => {
        try {
            const response = await API.get(`/subjects/${id}`);
            setSubject(response.data);
        } catch (err) {
            console.error("Erro ao carregar disciplina:", err);
        }
    };

    const handleSubmit = async () => {
        try {
            if (id) {
                await API.put(`/subjects/${id}`, subject);
            } else {
                await API.post("/subjects", subject);
            }
            navigate("/subjects");
        } catch (err) {
            console.error("Erro ao salvar disciplina:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        }
    };

    return (
        <div className="subject-creation-container">
            <h2>{id ? 'Editar Disciplina' : 'Criar Nova Disciplina'}</h2>
            <form 
                className="subject-form"
                onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSubmit(); 
                }}
            >
                <div className="form-group">
                    <label htmlFor="name">Nome da Disciplina</label>
                    <input 
                        id="name"
                        type="text"
                        placeholder="Digite o nome da disciplina" 
                        value={subject.name}
                        onChange={(e) => setSubject({ ...subject, name: e.target.value })} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea 
                        id="description"
                        placeholder="Digite a descrição da disciplina" 
                        value={subject.description}
                        onChange={(e) => setSubject({ ...subject, description: e.target.value })} 
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
                        {id ? 'Salvar Alterações' : 'Criar Disciplina'}
                    </button>
                </div>
            </form>
        </div>
    );
}