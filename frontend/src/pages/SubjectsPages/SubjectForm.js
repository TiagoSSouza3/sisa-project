import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";

import '../../styles/global.css';
import '../../styles/subject-creation.css';

export default function SubjectForm() {
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
            navigate("/subjects");
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
            <button onClick={() => navigate("/subjects")} className="transparent-button">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    >
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                </svg>
            </button>
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