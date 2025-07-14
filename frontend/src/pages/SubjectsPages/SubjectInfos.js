import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/subject-infos.css';

export default function SubjectInfos() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language } = useLanguage();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [subject, setSubject] = useState({
        name: "",
        description: ""
    });
    const [students, setStudents] = useState([])
    const [professor, setProfessor] = useState([])

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        if (id) {
            loadSubject();
        } else {
            navigate("/subjects")
        }
    }, [id]);

    const loadSubject = async () => {
        try {
            const response = await API.get(`/subjects/all/${id}`);
            const subjectData = response.data;
            setSubject(subjectData);
        
            if (subjectData.students) {
                setStudents(subjectData.students);
            } else if (subjectData.students) {
                const studentData = await Promise.all(
                subjectData.students.map(async (studentId) => {
                    const res = await API.get(`/students/${studentId}`);
                    return res.data;
                })
                );
                setStudents(studentData);
            }
        
            const users = await API.get("/users");
            setProfessor(users.data);
      
        } catch (err) {
            console.error("Erro ao carregar disciplina ou alunos:", err);
            navigate("/subjects");
        }
    };
      
    const handleRemoveToSubject = async (student_id) => {
        try {
            const currentStudentIds = subject.students?.map(s => s.id) || [];
        
            const updatedStudentIds = currentStudentIds.filter(i => i.id !== student_id);
        
            await API.put(`/subjects/${id}`, {
                name: subject.name,
                description: subject.description,
                students: updatedStudentIds
            });
        
            setSubject({
                ...subject,
                students: subject.students.filter(s => s.id !== student_id)
            });

            console.log(subject.students)
        } catch (error) {
            console.error("Não foi possível desinscrever o aluno", error);
        }
    }

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

                {isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador && 
                    <div className="header-actions">
                        <button
                            className="add-student-button"
                            onClick={() => navigate(`/subject_inscription/${id}`)}
                        >
                            {language === "english" ? "Enroll Student in the Subject" : "Inscrever Aluno na Disciplina"}
                        </button>
                    
                        <button
                            className="summary-data-button"
                            onClick={() => navigate(`/subject_form/${id}`)}
                        >
                            {language === "english" ? "Edit Subject" : "Editar Disciplina"}
                        </button>
                    </div>
                }
            </div>

            <div className="subject_professor">
                
            </div>

            <div className="students-list">
                {students && students.map(student => (
                    <div key={student.id} className="student-item">
                        <div className="student-info">
                            <div className="student-name">{student.name}</div>
                            <div className="student-details">
                                <p>{language === "english" ? "Registration" : "Matrícula"}: {student.id}</p>
                                {student.gender && <p>Sexo: {student.gender}</p>}
                            </div>
                        </div>
                        <div className="user-actions">
                            <button className="delete-button" onClick={() => handleRemoveToSubject(student.id)}>
                            {language === "english" ? "Delete" : "Excluir"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}