import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/SearchBar";

import '../../styles/global.css';
import '../../styles/subject-inscription.css';

export default function SubjectInscription() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [subject, setSubject] = useState({
        name: "",
        description: "",
        professor_id: 0
    });
    const [students, setStudents] = useState([])

    useEffect(() => {
        if (id) {
            loadData();
        }

        if (searchTerm.trim() !== "") {
            const searchTermLower = searchTerm.toLowerCase();
            filtered = filtered.filter(student =>
              student.name.toLowerCase().includes(searchTermLower) ||
              String(student.registration).toLowerCase().includes(searchTermLower) ||
              (student.email && student.email.toLowerCase().includes(searchTermLower))
            );
          }
    }, [id, searchTerm]);

    const loadData = async () => {
        try {
            const response = await API.get(`/subjects/all/${id}`);
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

    const handleAddToSubject = async (student_id) => {
        try {
            const studentToAdd = students[students.map((item) => item.id).findIndex(student_id)];
    
            setSubject({
                ...subject,
                students: subject.students.push(studentToAdd)
            });
    
            await API.put(`/subjects/${id}`, subject);
        } catch (error) {
            console.log("Nao foi possivel increver o aluno", error);
            navigate("/subjects");
        }
    }

    return (
        <div className="subject-inscription-container">
            <div className="students-filters">
                <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Pesquisar por nome ou matrícula"
                />
            </div>
            <div className="students-list">
                {students.map(student => (
                <div key={student.id} className="student-item">
                    <div className="student-info">
                    <div className="student-name">{student.name}</div>
                    <div className="student-details">
                        <p>Matrícula: {student.id}</p>
                    </div>
                    <div className="student-status">
                        <input
                        type="button"
                        value={student.active ? "Ativo" : "Inativo"}
                        className={`status-badge ${student.active ? 'active' : 'inactive'}`}
                        />
                    </div>
                    </div>
                    <div className="student-actions">
                        <button className="add-button" onClick={() => handleAddToSubject(student.id)}>
                        <i className="fas fa-edit"></i> Adicionar
                        </button>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}