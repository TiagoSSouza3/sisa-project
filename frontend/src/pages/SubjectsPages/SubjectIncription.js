import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";

import '../../styles/global.css';
import '../../styles/subject-inscription.css';

export default function SubjectInscription() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [subject, setSubject] = useState({
        name: "",
        description: ""
    });
    const [students, setStudents] = useState([])

    useEffect(() => {
        if (id) {
            loadSubject();
        }
    }, [id]);

    const loadSubject = async () => {
        try {
            const response = await API.get(`/subjects/${id}`);
            setSubject(response.data);

            try {
                setStudents(
                    (await API.get("/students")).data
                );
            } catch (err) {
                console.error("Erro ao carregar alunos:", err);
            }
        } catch (err) {
            console.error("Erro ao carregar disciplina:", err);
            navigate("/subjects")
        }
    };

    return (
        <div className="subject-inscription-container">
            
        </div>
    );
}