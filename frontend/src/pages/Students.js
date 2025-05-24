import React, { useEffect, useState } from "react";
import API from "../api";
import SearchBar from "../components/SearchBar";

import '../styles/global.css';
import '../styles/students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [novo, setNovo] = useState({
    name: "",
    registration: "",
    CPF: "",
    gender: "",
    skin_color: "",
    RG: "",
    email: "",
    phone: "",
    second_phone: "",
    responsable: "",
    degree_of_kinship: "",
    UBS: "",
    is_on_school: false,
    school_year: "",
    school_name: "",
    school_period: "",
    birth_date: "",
    address: "",
    neighborhood: "",
    cep: "",
    notes: "",
    active: true
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        student.registration.toString().includes(searchTerm) ||
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

  const handleCreate = async () => {
    try {
      await API.post("/students", novo);
      await loadStudents();
      setNovo({
        name: "",
        registration: "",
        CPF: "",
        gender: "",
        skin_color: "",
        RG: "",
        email: "",
        phone: "",
        second_phone: "",
        responsable: "",
        degree_of_kinship: "",
        UBS: "",
        is_on_school: false,
        school_year: "",
        school_name: "",
        school_period: "",
        birth_date: "",
        address: "",
        neighborhood: "",
        cep: "",
        notes: "",
        active: true
      });
      setSuccess("Aluno criado com sucesso!");
    } catch (err) {
      setError("Erro ao criar aluno");
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
        <button className="add-student-button" onClick={() => document.getElementById('studentForm').scrollIntoView({ behavior: 'smooth' })}>
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

      <form
        id="studentForm"
        className="student-form" 
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <h3>Adicionar Novo Aluno</h3>
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input 
            id="name"
            type="text"
            placeholder="Digite o nome do aluno"
            value={novo.name}
            onChange={(e) => setNovo({ ...novo, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="registration">Matrícula</label>
          <input 
            id="registration"
            type="text"
            placeholder="Digite a matrícula"
            value={novo.registration}
            onChange={(e) => setNovo({ ...novo, registration: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email"
            placeholder="Digite o email"
            value={novo.email}
            onChange={(e) => setNovo({ ...novo, email: e.target.value })}
          />
        </div>
        <button type="submit" className="add-student-button">Criar Aluno</button>
      </form>
    </div>
  );
}
