import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles.css";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      setError("Erro ao carregar disciplinas");
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleCreate = async () => {
    try {
      await API.post("/subjects", newSubject);
      setNewSubject({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "active"
      });
      setSuccess("Disciplina criada com sucesso!");
      loadSubjects();
    } catch (err) {
      setError("Erro ao criar disciplina");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/subjects/${id}`);
      setSuccess("Disciplina removida com sucesso!");
      loadSubjects();
    } catch (err) {
      setError("Erro ao remover disciplina");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container">
      <h2>Disciplinas</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

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
        <div className="date-inputs">
          <input 
            type="date"
            placeholder="Data de Início" 
            value={newSubject.start_date}
            onChange={(e) => setNewSubject({ ...newSubject, start_date: e.target.value })} 
            required
          />
          <input 
            type="date"
            placeholder="Data de Término" 
            value={newSubject.end_date}
            onChange={(e) => setNewSubject({ ...newSubject, end_date: e.target.value })} 
            required
          />
        </div>
        <select
          value={newSubject.status}
          onChange={(e) => setNewSubject({ ...newSubject, status: e.target.value })}
          required
        >
          <option value="active">Ativa</option>
          <option value="completed">Concluída</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <button type="submit">Criar Disciplina</button>
      </form>

      <div className="list">
        {subjects.map(subject => (
          <div key={subject.id} className="list-item">
            <div>
              <strong>{subject.name}</strong>
              <p>{subject.description}</p>
              <div className="activity-dates">
                <span>Início: {formatDate(subject.start_date)}</span>
                <span>Término: {formatDate(subject.end_date)}</span>
              </div>
              <div className={`status ${subject.status}`}>
                {subject.status === 'active' && 'Ativa'}
                {subject.status === 'completed' && 'Concluída'}
                {subject.status === 'cancelled' && 'Cancelada'}
              </div>
            </div>
            <button onClick={() => handleDelete(subject.id)} className="delete-btn">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 