import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';
import Modal from "../../components/Modal";

import '../../styles/global.css';
import '../../styles/subject-infos.css';
import '../../styles/document-permissions.css';

export default function SubjectInfos() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language } = useLanguage();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [subject, setSubject] = useState({
        name: "",
        description: ""
    });
    const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
    const [students, setStudents] = useState([])
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isStudentInfoModalOpen, setIsStudentInfoModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        if (id) {
            loadSubject();
        } else {
            navigate("/subjects")
        }
    }, [id]);

    const loadSubject = async () => {
        try {
            const response = await API.get(`/subjects/all/${id}`);
            const subjectData = response.data;
            setSubject(subjectData);
        
            if (subjectData.students) {
                setStudents(subjectData.students);
            } else if (subjectData.students) {
                const studentData = await Promise.all(
                    subjectData.students.map(async (studentId) => {
                        const res = await API.get(`/students/${studentId}`);
                        return res.data;
                    })
                );
                setStudents(studentData);
            } else setStudents([])

        } catch (err) {
            console.error("Erro ao carregar disciplina ou alunos:", err);
            navigate("/subjects");
        }
    };
      
    const handleRemoveToSubject = async (student_id) => {
        const student = subject.students?.filter(s => s.id === student_id)
        console.log(student)
        showConfirmation({
            type: 'delete',
            title: language === "english" ? "Unsubscribe User" : "Desinscrever Usuário",
            message: language === "english" 
                ? `Are you sure you want to unsubscribe the student "${student[0]?.name}"?`
                : `Tem certeza que deseja desinscrever o aluno "${student[0]?.name}"?`,
            onConfirm: async () => {
                try {
                    const currentStudentIds = subject.students?.map(s => s.id) || [];
                
                    const updatedStudentIds = currentStudentIds.filter(i => i !== student_id);
                
                    const updated = await API.put(`/subjects/${id}`, {
                        name: subject.name,
                        description: subject.description,
                        students: updatedStudentIds
                    });

                    const updateStudent = await API.delete(`/subjects/students/${student_id}`);
                    console.log(updateStudent)
        
                    setSubject({
                        ...updated.data,
                        students: subject.students.filter(s => s.id !== student_id)
                    });
        
                    if (subject.students) {
                        setStudents(subject.students.filter(s => s.id !== student_id));
                    } else if(subject.students) {
                        const studentData = await Promise.all(
                            subject.students.map(async (studentId) => {
                                const res = await API.get(`/students/${studentId}`);
                                return res.data;
                            })
                        );
                        setStudents(studentData.data.filter(s => s.id !== student_id));
                    } else setStudents([])
        
                } catch (error) {
                    console.error("Não foi possível desinscrever o aluno", error);
                }
            }
        });
    }

    const handleViewStudentInfo = async (studentId) => {
        try {
            const res = await API.get(`/students/${studentId}`);
            console.log(res.data)
            setSelectedStudent(res.data);
            setIsStudentInfoModalOpen(true);
        } catch (err) {
            console.error("Erro ao carregar informações do aluno:", err);
        }
    };

    const handleCloseStudentInfoModal = () => {
        setIsStudentInfoModalOpen(false);
        setSelectedStudent(null);
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const renderStudentInfoModal = () => {
        if (!selectedStudent) return null;

        const userRole = localStorage.getItem("occupation_id");
        const isProfessor = userRole === occupationEnum.professor || userRole === "3" || userRole === 3;

        return (
            <Modal
                isOpen={isStudentInfoModalOpen}
                onClose={handleCloseStudentInfoModal}
                title={language === "english" ? "Student Information" : "Informações do Aluno"}
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
                                    <span>{calculateAge(selectedStudent.birth_date)}</span>
                                </div>
                                {selectedStudent.second_phone && (
                                    <div className="detail-item">
                                        <label>{language === "english" ? "Second Phone" : "Segundo Telefone"}:</label>
                                        <span>{selectedStudent.second_phone}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <label>{language === "english" ? "Gender" : "Gênero"}:</label>
                                    <span>{selectedStudent.gender || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>{language === "english" ? "Skin Color" : "Cor da Pele"}:</label>
                                    <span>{selectedStudent.skin_color || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>{language === "english" ? "Birth Date" : "Data de Nascimento"}:</label>
                                    <span>{formatDate(selectedStudent.birth_date)}</span>
                                </div>
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

                        {/* Endereço - Sempre visível */}
                        {!isProfessor && (
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
                        )}

                        {/* Informações do Responsável - Sempre visível */}
                        <div className="detail-section">
                            <h4>{language === "english" ? "Responsible Information" : "Informações do Responsável"}</h4>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>{language === "english" ? "Responsible" : "Responsável"}:</label>
                                    <span>{selectedStudent.responsible_parent.name || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>{language === "english" ? "Degree of Kinship" : "Grau de Parentesco"}:</label>
                                    <span>{selectedStudent.responsible_parent.degree_of_kinship || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Telefone:</label>
                                    <span>{selectedStudent.responsible_parent.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Documentos Pessoais - Apenas para Admins e Colaboradores */}
                        {!isProfessor && (
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
                                </div>
                            </div>
                        )}

                        {/* Aviso para professores sobre CPF e RG */}
                        {isProfessor && (
                            <div className="info-message" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
                                <p style={{ margin: 0, color: '#856404' }}>
                                    <strong>{language === "english" ? "Note:" : "Nota:"}</strong> {language === "english" 
                                        ? "As a teacher, you cannot view sensitive documents like CPF and RG. Contact an administrator if you need access to this information."
                                        : "Como professor, você não pode visualizar documentos sensíveis como CPF e RG. Entre em contato com um administrador se precisar acessar essas informações."
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
        <div className="subject-infos-container">
            <div className="back-button-container">
                <button onClick={() => navigate("/subjects")} className="transparent-button">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="25"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                    </svg>
                </button>
            </div>
            <div className="subject-header">
                <h2>{subject.name ? subject.name : 'Title'}</h2>

                {isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador && 
                    <div className="header-actions">
                        <button
                            className="add-student-button"
                            onClick={() => navigate(`/subject_inscription/${id}`)}
                        >
                            {language === "english" ? "Enroll Student in the Subject" : "Inscrever Aluno na Disciplina"}
                        </button>
                    
                        <button
                            className="summary-data-button"
                            onClick={() => navigate(`/subject_form/${id}`)}
                        >
                            {language === "english" ? "Edit Subject" : "Editar Disciplina"}
                        </button>
                    </div>
                }
            </div>

            <div className="subject_professor">
                
            </div>

            <div className="students-list">
                {students && students.map(student => (
                    <div key={student.id} className="student-item">
                        <div className="student-info">
                            <div className="student-name">{student.name}</div>
                            <div className="student-details">
                                <p>{language === "english" ? "Registration" : "Matrícula"}: {student.id}</p>
                                {student.gender && <p>Sexo: {student.gender}</p>}
                            </div>
                        </div>
                        <div className="user-actions">
                            {/* Botão "Ver Informações" para todos os usuários logados */}
                            {isLoggedIn && (
                                <button 
                                    className="view-details-button" 
                                    onClick={() => handleViewStudentInfo(student.id)}
                                    style={{ marginRight: '10px' }}
                                >
                                    <i className="fas fa-info-circle"></i>
                                    {language === "english" ? "View Information" : "Ver Informações"}
                                </button>
                            )}
                            
                            {/* Botão "Excluir" apenas para administradores */}
                            {isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador && (
                                <button className="delete-button" onClick={() => handleRemoveToSubject(student.id)}>
                                    {language === "english" ? "Delete" : "Excluir"}
                                </button>
                            )}
                        </div>
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
            {/* Modal de informações do aluno */}
            {renderStudentInfoModal()}
        </div>
    );
}