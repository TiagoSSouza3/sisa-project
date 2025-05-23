import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles.css";
import { Link } from "react-router-dom";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      await API.get("/subjects").then((res) => {
        setSubjects(res.data);
      });
    } catch (err) {
      console.log("Erro ao carregar disciplinas");
    } finally {
      setIsLoading(false);
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

  if (!isLoading) {
    (async () => {
      await loadSubjects();
    })();
  }

  return (
    <div className="container">
      <h2>Disciplinas</h2>

      <div className="create-subject">
        <Link to="/subject_create" className="create-subject-btn">
          Criar Disciplina
        </Link>
      </div>

      <div className="list">
        {subjects.length === 0 ? (
          <div className="empty-state">Nenhuma disciplina cadastrada</div>
        ) : (
          subjects.map(subject => (
            <div key={subject.id} className="list-item">
              <div>
                <strong>{subject.name}</strong>
                <p>{subject.description}</p>
              </div>
              <button onClick={() => handleDelete(subject.id)} className="delete-btn">
                Excluir
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 