import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";

import '../../styles/global.css';
import '../../styles/subject-infos.css';

export default function SubjectInfos() {
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
                    (subject.students).map(async (item) => {
                        await API.get(`/students/${item}`)
                    })
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
        <div className="subject-infos-container">
            <div className="back-button-container">
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
            </div>
            <div className="subject-header">
                <h2>{subject.name ? subject.name : 'Title'}</h2>

                <div className="header-actions">
                    <button
                        className="add-student-button"
                    >
                        Inscrever Aluno na Disciplina
                    </button>

                    <button
                        className="summary-data-button"
                        onClick={() => navigate(`/subject_form/${id}`)}
                    >
                        Editar Disciplina
                    </button>
                </div>
            </div>

            <div className="students-list">
                {students && students.map(student => (
                    <div key={student.id} className="student-item">
                        <div className="student-info">
                            <div className="student-name">{student.name}</div>
                            <div className="student-details">
                                <p>Matrícula: {student.id}</p>
                                {student.gender && <p>Sexo: {student.gender}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}