import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/subject-inscription.css';

export default function SubjectInscription() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language } = useLanguage();
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
            console.log(response.data.students);
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
            navigate(`/subject_infos/${id}`)
        }
    };

    const handleAddToSubject = async (student_id) => {
        try {
          const currentStudentIds = subject.students?.map(s => s.id) || [];
      
          if (currentStudentIds.includes(student_id)) {
            alert("Aluno já está inscrito na disciplina.");
            return;
          }
      
          const updatedStudentIds = [...currentStudentIds, student_id];
      
          await API.put(`/subjects/${id}`, {
            name: subject.name,
            description: subject.description,
            students: updatedStudentIds
          });
    
          setSubject({
            ...subject,
            students: [...(subject.students || []), students.find(s => s.id === student_id)]
          });

          navigate(`/subject_infos/${id}`);
        } catch (error) {
          console.error("Não foi possível inscrever o aluno", error);
        }
      };
      

    return (
        <div className="subject-inscription-container">
            <button onClick={() => navigate(`/subject_infos/${id}`)} className="transparent-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                </svg>
            </button>
            <div className="students-filters">
                <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={language === "english" ? "Search with Name or Registration" : "Procurar por Nome ou Matrícula"}
                />
            </div>
            <div className="students-list">
                {students.map(student => (
                <div key={student.id} className="student-item">
                    <div className="student-info">
                    <div className="student-name">{student.name}</div>
                    <div className="student-details">
                        <p>{language === "english" ? "Registration" : "Matrícula"}: {student.id}</p>
                    </div>
                    <div className="student-status">
                        <input
                        type="button"
                        value={student.active 
                            ? language === "english" ? "Active" : "Ativo" 
                            : language === "english" ? "Inactive" : "Inativo"
                          }
                        className={`status-badge ${student.active ? 'active' : 'inactive'}`}
                        />
                    </div>
                    </div>
                    <div className="student-actions">
                        <button className="add-button" onClick={() => handleAddToSubject(student.id)}>
                        <i className="fas fa-edit"></i> {language === "english" ? "Add" : "Adicionar"}
                        </button>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}