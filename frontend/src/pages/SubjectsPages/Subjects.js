import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

import '../../styles/global.css';
import '../../styles/subjects.css';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  const loadSubjects = async () => {
    try {
      await API.get("/subjects").then((res) => {
        setSubjects(res.data);
      });
    } catch (err) {
      console.log("Erro ao carregar disciplinas");
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/subjects/${id}`);
      loadSubjects();
    } catch (err) {
      console.log("Erro ao remover disciplina");
    }
  };

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h2>Disciplinas</h2>
        <button 
          className="add-subject-button"
          onClick={() => navigate("/subject_form")}
        >
          Adicionar Nova Disciplina
        </button>
      </div>

      <div className="subjects-list">
        {subjects.length === 0 ? (
          <div className="empty-state">Nenhuma disciplina cadastrada</div>
        ) : (
          subjects.map(subject => (
            <div key={subject.id} className="subject-card">
              <h3 className="subject-title">{subject.name}</h3>
              <p className="subject-info">{subject.description}</p>
              <div className="subject-actions">
                <button 
                  className="edit-button"
                  onClick={() => navigate(`/subject_form/${subject.id}`)}
                >
                  Editar
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(subject.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 