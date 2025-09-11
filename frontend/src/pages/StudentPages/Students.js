import React, { useEffect, useState } from "react";
import API from "../../api";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum"
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/students.css';
import '../../styles/document-permissions.css';

export default function Students() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language } = useLanguage();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
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
    const url = '/student_form/' + studentId
    navigate(url);
  }

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const changeStudentStatus = (student_id) => {

  }

  const handleViewStudentDetails = async (studentId) => {
    try {
      const res = await API.get(`/students/${studentId}`);
      setSelectedStudent(res.data);
      setIsStudentDetailModalOpen(true);
    } catch (err) {
      setError(language === "english" ? "Error loading student details" : "Erro ao carregar detalhes do aluno");
    }
  };

  const handleCloseStudentDetailModal = () => {
    setIsStudentDetailModalOpen(false);
    setSelectedStudent(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderStudentDetailModal = () => {
    if (!selectedStudent) return null;

    const userRole = localStorage.getItem("occupation_id");
    const isProfessor = userRole === occupationEnum.professor;

    return (
      <Modal
        isOpen={isStudentDetailModalOpen}
        onClose={handleCloseStudentDetailModal}
        title={language === "english" ? "Student Details" : "Detalhes do Aluno"}
      >
        <div className="student-detail-content">
          <div className="student-detail-header">
            <h3>{selectedStudent.name}</h3>
            <p><strong>{language === "english" ? "Registration" : "Matrícula"}:</strong> {selectedStudent.id}</p>
          </div>

          <div className="student-detail-sections">
            {/* Informações Básicas - Sempre visíveis */}
            <div className="detail-section">
              <h4>{language === "english" ? "Basic Information" : "Informações Básicas"}</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>{language === "english" ? "Name" : "Nome"}:</label>
                  <span>{selectedStudent.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedStudent.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>{language === "english" ? "Phone" : "Telefone"}:</label>
                  <span>{selectedStudent.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>{language === "english" ? "Age" : "Idade"}:</label>
                  <span>{selectedStudent.birth_date ? calculateAge(selectedStudent.birth_date) : 'N/A'}</span>
                </div>
                {selectedStudent.second_phone && (
                  <div className="detail-item">
                    <label>{language === "english" ? "Second Phone" : "Segundo Telefone"}:</label>
                    <span>{selectedStudent.second_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações Adicionais - Sempre visíveis */}
            {selectedStudent.notes && (
              <div className="detail-section">
                <h4>{language === "english" ? "Additional Information" : "Informações Adicionais"}</h4>
                <div className="detail-item">
                  <span>{selectedStudent.notes}</span>
                </div>
              </div>
            )}

            {/* Informações Escolares - Sempre visíveis */}
            <div className="detail-section">
              <h4>{language === "english" ? "School Information" : "Informações Escolares"}</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>{language === "english" ? "School Year" : "Ano Escolar"}:</label>
                  <span>{selectedStudent.school_year || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>{language === "english" ? "School Period" : "Período Escolar"}:</label>
                  <span>{selectedStudent.school_period || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>{language === "english" ? "School Name" : "Nome da Escola"}:</label>
                  <span>{selectedStudent.school_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>{language === "english" ? "Is in School" : "Está na Escola"}:</label>
                  <span>{selectedStudent.is_on_school ? 
                    (language === "english" ? "Yes" : "Sim") : 
                    (language === "english" ? "No" : "Não")
                  }</span>
                </div>
              </div>
            </div>

            {/* Informações Sensíveis - Apenas para Admins e Colaboradores */}
            {!isProfessor && (
              <>
                <div className="detail-section">
                  <h4>{language === "english" ? "Personal Documents" : "Documentos Pessoais"}</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>CPF:</label>
                      <span>{selectedStudent.CPF || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>RG:</label>
                      <span>{selectedStudent.RG || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>{language === "english" ? "Birth Date" : "Data de Nascimento"}:</label>
                      <span>{formatDate(selectedStudent.birth_date)}</span>
                    </div>
                    <div className="detail-item">
                      <label>{language === "english" ? "Gender" : "Gênero"}:</label>
                      <span>{selectedStudent.gender || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>{language === "english" ? "Skin Color" : "Cor da Pele"}:</label>
                      <span>{selectedStudent.skin_color || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>{language === "english" ? "Address" : "Endereço"}</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>{language === "english" ? "Address" : "Endereço"}:</label>
                      <span>{selectedStudent.address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>{language === "english" ? "Neighborhood" : "Bairro"}:</label>
                      <span>{selectedStudent.neighborhood || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>CEP:</label>
                      <span>{selectedStudent.cep || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>{language === "english" ? "Responsible Information" : "Informações do Responsável"}</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>{language === "english" ? "Responsible" : "Responsável"}:</label>
                      <span>{selectedStudent.responsable || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>{language === "english" ? "Degree of Kinship" : "Grau de Parentesco"}:</label>
                      <span>{selectedStudent.degree_of_kinship || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>UBS:</label>
                      <span>{selectedStudent.UBS || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Aviso para professores */}
            {isProfessor && (
              <div className="info-message" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px', border: '1px solid #2196f3' }}>
                <p style={{ margin: 0, color: '#1976d2' }}>
                  <strong>{language === "english" ? "Note:" : "Nota:"}</strong> {language === "english" 
                    ? "As a teacher, you can only view basic information about students. Contact an administrator for access to sensitive data."
                    : "Como professor, você pode visualizar apenas informações básicas dos alunos. Entre em contato com um administrador para acesso a dados sensíveis."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

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
        {filteredStudents.map(student => (
          <div key={student.id} className="student-item">
            <div className="student-info">
              <div className="student-name">{student.name}</div>
              <div className="student-details">
                <p>{language === "english" ? "Registration" : "Matrícula"}: {student.id}</p>
                {student.email && <p>Email: {student.email}</p>}
              </div>
              <div className="student-status">
                <input
                  type="button"
                  value={student.active 
                          ? language === "english" ? "Active" : "Ativo" 
                          : language === "english" ? "Inactive" : "Inativo"
                        }
                  className={`status-badge ${student.active ? 'active' : 'inactive'}`}
                  onClick={changeStudentStatus(student.id)}
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

      {/* Modal de detalhes do aluno */}
      {renderStudentDetailModal()}
    </div>
  );
}
