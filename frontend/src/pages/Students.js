import React, { useEffect, useState } from "react";
import API from "../api";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";

import '../styles/global.css';
import '../styles/students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    name: '',
    registration: '',
    isActive: 'all',
    isOnSchool: 'all',
    schoolYear: '',
    schoolPeriod: '',
    gender: 'all',
    ageRange: 'all',
    neighborhood: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  // Function to calculate age from birth_date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Function to check if age is within range
  const isInAgeRange = (birthDate, range) => {
    if (range === 'all') return true;
    const age = calculateAge(birthDate);
    const [min, max] = range.split('-');
    if (max === '+') return age >= parseInt(min);
    return age >= parseInt(min) && age <= parseInt(max);
  };

  useEffect(() => {
    let filtered = [...students];

    if (searchTerm.trim() !== "") {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTermLower) ||
        String(student.registration).toLowerCase().includes(searchTermLower) ||
        (student.email && student.email.toLowerCase().includes(searchTermLower))
      );
    }

    filtered = filtered.filter(student => {
      if (filters.name && !student.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      if (filters.registration && !String(student.registration).includes(filters.registration)) {
        return false;
      }

      if (filters.isActive !== 'all' && student.active !== (filters.isActive === 'true')) {
        return false;
      }

      if (filters.isOnSchool !== 'all' && student.is_on_school !== (filters.isOnSchool === 'true')) {
        return false;
      }

      if (filters.schoolYear && student.school_year !== filters.schoolYear) {
        return false;
      }

      if (filters.schoolPeriod && student.school_period !== filters.schoolPeriod) {
        return false;
      }

      if (filters.gender !== 'all' && student.gender !== filters.gender) {
        return false;
      }

      if (!isInAgeRange(student.birth_date, filters.ageRange)) {
        return false;
      }

      if (filters.neighborhood && !student.neighborhood?.toLowerCase().includes(filters.neighborhood.toLowerCase())) {
        return false;
      }

      return true;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, students, filters]);

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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      name: '',
      registration: '',
      isActive: 'all',
      isOnSchool: 'all',
      schoolYear: '',
      schoolPeriod: '',
      gender: 'all',
      ageRange: 'all',
      neighborhood: ''
    };
    setFilters(clearedFilters);
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  return (
    <div className="students-container">
      <div className="students-header">
        <h2>Alunos</h2>
        <div className="header-actions">
          <div className="filter-actions-group">
            <button className="filter-button" onClick={handleOpenFilterModal}>
              Filtros Avançados
            </button>
            <button className="clear-button" onClick={handleClearFilters}>
              Limpar Filtros
            </button>
          </div>
          <button className="add-student-button" onClick={() => navigate('/student_create')}>
            Adicionar Novo Aluno
          </button>
        </div>
      </div>

      <div className="students-filters">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Pesquisar por nome ou matrícula"
          count={filteredStudents.length}
        />
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        title="Filtros Avançados"
      >
        <Filter 
          onFilterChange={handleFilterChange} 
          onFilter={handleCloseFilterModal}
        />
      </Modal>

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
              <span className="student-status">
                {student.active ? "Ativo" : "Inativo"}
                {student.is_on_school && " • Estudando"}
              </span>
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
