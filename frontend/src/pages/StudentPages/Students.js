import React, { useEffect, useState } from "react";
import API from "../../api";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum"
import { useLanguage } from '../../components/LanguageContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';

import '../../styles/global.css';
import '../../styles/students.css';
import { validadeAge } from "../../utils/validation";
import { StringToDate } from "../../utils/utils";

export default function Students() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language } = useLanguage();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();
  const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
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
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
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

  const handleEdit = (studentId) => {
    const student = students.find(s => s.id === studentId);
    
    showConfirmation({
      type: 'edit',
      title: language === "english" ? "Edit Student" : "Editar Aluno",
      message: language === "english" 
        ? `Do you want to edit student "${student?.name}"?`
        : `Deseja editar o aluno "${student?.name}"?`,
      confirmText: language === "english" ? "Edit" : "Editar",
      onConfirm: () => {
        const url = '/student_form/' + studentId;
        navigate(url);
      }
    });
  }

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const getAge = (birth_date) => {
    const date = StringToDate(birth_date);
    const res = validadeAge(date);
    return res;
  }

  const changeStudentStatus = async (index) => {
    const student = filteredStudents[index];
    const newStudent = {...student, active: !student.active};

    let newStudentsList = filteredStudents
    newStudentsList[index] = newStudent;

    setFilteredStudents(newStudentsList)
    await API.put(`/students/${student.id}`, newStudent);

    loadStudents()
  }

  return (
    <div className="students-container">
      <div className="students-header">
        <h2>{language === "english" ? "Students" : "Alunos"}</h2>
        {isLoggedIn && localStorage.getItem("occupation_id") !== occupationEnum.professor &&
          <div className="header-actions">
            <button className="add-student-button" onClick={() => navigate('/student_form')}>
              {language === "english" ? "Add New Student" : "Adicionar Novo Aluno"}
            </button>
            <button className="summary-data-button" onClick={() => navigate('/summary_data')}>
              {language === "english" ? "Sumary Data" : "Dados Resumidos"}
            </button>
          </div>
        }
      </div>

      <div className="students-filters">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={language === "english" ? "Search with Name or Registration" : "Procurar por Nome ou Matrícula"}
          count={filteredStudents.length}
        />
        <div className="filter-actions-group">
          <button className="filter-button" onClick={handleOpenFilterModal}>
            {language === "english" ? "Filters" : "Filtros"}
          </button>
          <button className="clear-button" onClick={handleClearFilters}>
            {language === "english" ? "Clean Filters" : "Limpar Filtros"}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        title="Filtros"
      >
        <Filter
          onFilterChange={handleFilterChange}
          onFilter={handleCloseFilterModal}
        />
      </Modal>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="students-list">
        {filteredStudents.map((student, index) => (
          <div key={student.id} className="student-item">
            <div className="student-info">
              <div className="student-name">{student.name}</div>
              <div className="student-details">
                <p>{language === "english" ? "Registration" : "Matrícula"}: {student.id}</p>
                {student.email && <p>Idade: {getAge(student.birth_date)}</p>}
              </div>
              <div className="student-status">
                <input
                  type="button"
                  value={student.active 
                          ? language === "english" ? "Active" : "Ativo" 
                          : language === "english" ? "Inactive" : "Inativo"
                        }
                  className={`status-badge ${student.active ? 'active' : 'inactive'}`}
                  onClick={() => changeStudentStatus(index)}
                />
              </div>
            </div>
            {isLoggedIn && localStorage.getItem("occupation_id") !== occupationEnum.professor &&
              <div className="student-actions">
                <button className="edit-button" onClick={() => handleEdit(student.id)}>
                  <i className="fas fa-edit"></i>{language === "english" ? "Edit" : "Editar"}
                </button>
              </div>
            }
          </div>
        ))}
      </div>
      
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        type={confirmationState.type}
        isLoading={confirmationState.isLoading}
      />
    </div>
  );
}
