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
import { validadeAge } from "../../utils/validation";
import { StringToDate } from "../../utils/utils";
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
        String(student.id).toLowerCase().includes(searchTermLower) ||
        (student.email && student.email.toLowerCase().includes(searchTermLower))
      );
    }

    filtered = filtered.filter(student => {
      if (filters.name && !student.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      if (filters.registration && !String(student.id).includes(filters.registration)) {
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
    const url = '/student_form/' + studentId;
    navigate(url);
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
                  <h4>{language === "english" ? "Parents/Guardians Information" : "Informações dos Pais/Responsáveis"}</h4>
                  
                  {/* Responsável */}
                  {selectedStudent.responsible_parent && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                      <h5 style={{ marginTop: 0, color: '#d32f2f' }}>{language === "english" ? "Responsible Parent" : "Responsável"}</h5>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>{language === "english" ? "Name" : "Nome"}:</label>
                          <span>{selectedStudent.responsible_parent.name || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>CPF:</label>
                          <span>{selectedStudent.responsible_parent.CPF || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>RG:</label>
                          <span>{selectedStudent.responsible_parent.RG || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Birth Date" : "Data de Nascimento"}:</label>
                          <span>{selectedStudent.responsible_parent.birth_date ? new Date(selectedStudent.responsible_parent.birth_date).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Degree of Kinship" : "Grau de Parentesco"}:</label>
                          <span>{selectedStudent.responsible_parent.degree_of_kinship || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Occupation" : "Ocupação"}:</label>
                          <span>{selectedStudent.responsible_parent.occupation || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Phone" : "Telefone"}:</label>
                          <span>{selectedStudent.responsible_parent.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Primeiro Pai */}
                  {selectedStudent.parent && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                      <h5 style={{ marginTop: 0 }}>{language === "english" ? "Parent 1" : "Pai/Mãe 1"}</h5>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>{language === "english" ? "Name" : "Nome"}:</label>
                          <span>{selectedStudent.parent.name || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>CPF:</label>
                          <span>{selectedStudent.parent.CPF || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>RG:</label>
                          <span>{selectedStudent.parent.RG || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Birth Date" : "Data de Nascimento"}:</label>
                          <span>{selectedStudent.parent.birth_date ? new Date(selectedStudent.parent.birth_date).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Degree of Kinship" : "Grau de Parentesco"}:</label>
                          <span>{selectedStudent.parent.degree_of_kinship || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Occupation" : "Ocupação"}:</label>
                          <span>{selectedStudent.parent.occupation || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Phone" : "Telefone"}:</label>
                          <span>{selectedStudent.parent.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Segundo Pai */}
                  {selectedStudent.second_parent && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                      <h5 style={{ marginTop: 0 }}>{language === "english" ? "Parent 2" : "Pai/Mãe 2"}</h5>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>{language === "english" ? "Name" : "Nome"}:</label>
                          <span>{selectedStudent.second_parent.name || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>CPF:</label>
                          <span>{selectedStudent.second_parent.CPF || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>RG:</label>
                          <span>{selectedStudent.second_parent.RG || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Birth Date" : "Data de Nascimento"}:</label>
                          <span>{selectedStudent.second_parent.birth_date ? new Date(selectedStudent.second_parent.birth_date).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Degree of Kinship" : "Grau de Parentesco"}:</label>
                          <span>{selectedStudent.second_parent.degree_of_kinship || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Occupation" : "Ocupação"}:</label>
                          <span>{selectedStudent.second_parent.occupation || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>{language === "english" ? "Phone" : "Telefone"}:</label>
                          <span>{selectedStudent.second_parent.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!selectedStudent.responsible_parent && !selectedStudent.parent && !selectedStudent.second_parent && (
                    <p>{language === "english" ? "No parent information available" : "Nenhuma informação de parente disponível"}</p>
                  )}
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
                  //onClick={() => changeStudentStatus(index)}
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
