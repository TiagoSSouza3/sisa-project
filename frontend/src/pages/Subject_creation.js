import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles.css";
import { useNavigate } from "react-router-dom";

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
        } catch (err) {
            console.error("Erro ao criar disciplina:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); navigate("/subjects");}}>
            <input 
            placeholder="Nome da Disciplina" 
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} 
            required 
            />
            <textarea 
            placeholder="Descrição" 
            value={newSubject.description}
            onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })} 
            required
            maxLength={300}
            style={{resize: "none"}}
            />
            <button type="submit">Criar Disciplina</button>
        </form>
    );
};