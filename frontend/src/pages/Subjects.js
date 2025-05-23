import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles.css";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: ""
  });

  const loadSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.log("Erro ao carregar disciplinas");
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await API.post("/subjects", newSubject);
      setNewSubject({
        name: "",
        description: ""
      });
      loadSubjects();
    } catch (err) {
      console.log("Erro ao criar disciplina");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/subjects/${id}`);
      loadSubjects();
    } catch (err) {
      console.log("Erro ao remover disciplina");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container">
      <h2>Disciplinas</h2>

      <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
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
        />
        <button type="submit">Criar Disciplina</button>
      </form>

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