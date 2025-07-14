import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/subjects.css';

export default function Subjects() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language } = useLanguage();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  const loadSubjects = async () => {
    try {

      const subject = 
      localStorage.getItem("occupation_id") === occupationEnum.professor 
        ? await API.get(`subjects/professor/${localStorage.getItem("id")}`)
        : await API.get(`/subjects`)
      setSubjects(subject.data);

    } catch (err) {
      console.log("Erro ao carregar disciplinas");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
    loadSubjects();
  }, []);

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h2>{language === "english" ? "Subjects" : "Disciplinas"}</h2>
        { isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador && 
          <button 
            className="add-subject-button"
            onClick={() => navigate("/subject_form")}
          >
            {language === "english" ? "Add New Subject" : "Adicionar nova Disciplina"}
          </button>
        }
      </div>

      <div className="subjects-list">
        {subjects.length === 0 ? (
          <div className="empty-state">{language === "english" ? "No Registered Discipline" : "Nenhuma Disciplina Registrada"}</div>
        ) : (
          subjects.map(subject => (
            <div key={subject.id} className="subject-card">
              <h3 className="subject-title">{subject.name}</h3>
              <p className="subject-info">{subject.description}</p>
              <div className="subject-actions">
                <button 
                  className="edit-button"
                  onClick={() => navigate(`/subject_infos/${subject.id}`)}
                >
                  {language === "english" ? "Edit" : "Editar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 