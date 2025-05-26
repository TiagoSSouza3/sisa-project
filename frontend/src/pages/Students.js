import React, { useEffect, useState } from "react";
import API from "../api";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";

import '../styles/global.css';
import '../styles/students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTermLower) ||
        String(student.registration).toLowerCase().includes(searchTermLower) ||
        (student.email && student.email.toLowerCase().includes(searchTermLower))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const loadStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
      
      setFilteredStudents(res.data);
    } catch (err) {
      setError("Erro ao carregar alunos");
    }
  };


  const handleDelete = async (id) => {
    try {
      await API.delete(`/students/${id}`);
      setStudents(students.filter(s => s.id !== id));
      setSuccess("Aluno removido com sucesso!");
    } catch (err) {
      setError("Erro ao remover aluno");
    }
  };

  return (
    <div className="students-container">
      <div className="students-header">
        <h2>Alunos</h2>
        <button className="add-student-button" onClick={() => navigate('/student_create')}>
          Adicionar Novo Aluno
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Pesquisar por nome ou matrícula"
      />

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="students-list">
        {filteredStudents.map(student => (
          <div key={student.id} className="student-item">
            <div className="student-info">
              <div className="student-name">{student.name}</div>
              <div className="student-details">
                <p>Matrícula: {student.registration}</p>
                {student.email && <p>Email: {student.email}</p>}
              </div>
              <span className="student-status">{student.active ? "Ativo" : "Inativo"}</span>
            </div>
            <div className="student-actions">
              <button className="delete-button" onClick={() => handleDelete(student.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
