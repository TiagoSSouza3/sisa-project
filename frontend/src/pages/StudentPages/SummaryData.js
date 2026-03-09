import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/summary_data.css';

export default function Summary_data() {
    const { language } = useLanguage();
    const [data, setData] = useState({
        students_active: 0,
        students_total: 0,
        students_male: 0,
        students_female: 0,
        students_family_income: 0,
        students_with_NIS: 0
    });
    const [error, setError] = useState("");
    const [existingData, setExistingData] = useState(false);
    const navigate = useNavigate();
    
    // Novos estados para as funcionalidades adicionais
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [birthdayStudents, setBirthdayStudents] = useState([]);
    const [studentsBySubject, setStudentsBySubject] = useState([]);
    const [monthlyEnrollments, setMonthlyEnrollments] = useState([]);
    const [additionalStats, setAdditionalStats] = useState({});
    const [loading, setLoading] = useState(false);

    const getSummaryData = async () => {
        try {
            let res

            try{
                res = await API.get("/summary_data");
                setExistingData(true)
            } catch {
                setExistingData(false)
            }

            if (!existingData || res.data?.length === 0) {
                await getSummaryInfosFromStudents();
            } else {
                await updateSummaryData()
                setData(res.data[0]);
            }

            
        } catch (err) {
            console.error("Error fetching summary data:", err);
            setError("Erro ao buscar dados resumidos");
        }
    }

    const updateSummaryData = async () => {
        try {
            const res = await API.get("/students");
            const students = res.data;

            const students_active = students.filter(student => student.active).length;
            const students_total = students.length;
            const students_male = students.filter(student => student.gender === "Masculino").length;
            const students_female = students.filter(student => student.gender === "Feminino").length;
            const students_family_income = 0;
            const students_with_NIS = 0;

            const summaryData = {
                students_active: students_active,
                students_total: students_total,
                students_male: students_male,
                students_female: students_female,
                students_family_income: students_family_income,
                students_with_NIS: students_with_NIS
            };

            try{
                await API.get("/summary_data");
                setExistingData(true)
            } catch {
                setExistingData(false)
            }
            
            if (existingData && existingData.data.length > 0) {
                const resp = await API.put("/summary_data", summaryData);
                setData(resp.data);
            } else {
                const resp = await API.post("/summary_data", summaryData);
                setData(resp.data);
            }
            
            setError("");
        } catch (err) {
            console.error("Error updating summary data:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
            }
            setError("Erro ao atualizar dados resumidos");
        }
    }

    const getSummaryInfosFromStudents = async () => {
        const res = await API.get("/students");
        const students = res.data;

        const students_active = students.filter(student => student.active).length;
        const students_total = students.length;
        const students_male = students.filter(student => student.gender === "Masculino").length;
        const students_female = students.filter(student => student.gender === "Feminino").length;
        const students_family_income = 0;
        const students_with_NIS = 0;

        setData({
            students_active: students_active,
            students_total: students_total,
            students_male: students_male,
            students_female: students_female,
            students_family_income: students_family_income,
            students_with_NIS: students_with_NIS
        });

        //createSummaryData();
    }

    // Funções para buscar os novos dados
    const getBirthdayStudents = async (month) => {
        try {
            const res = await API.get(`/summary_data/birthday-students/${month}`);
            setBirthdayStudents(res.data);
        } catch (err) {
            console.error("Error fetching birthday students:", err);
        }
    };

    const getStudentsBySubject = async () => {
        try {
            const res = await API.get("/summary_data/students-by-subject");
            setStudentsBySubject(res.data);
        } catch (err) {
            console.error("Error fetching students by subject:", err);
        }
    };

    const getMonthlyEnrollments = async (month, year) => {
        try {
            const res = await API.get(`/summary_data/monthly-enrollments/${month}/${year}`);
            setMonthlyEnrollments(res.data);
        } catch (err) {
            console.error("Error fetching monthly enrollments:", err);
        }
    };

    const getAdditionalStats = async () => {
        try {
            const res = await API.get("/summary_data/additional-stats");
            setAdditionalStats(res.data);
        } catch (err) {
            console.error("Error fetching additional stats:", err);
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                getBirthdayStudents(selectedMonth),
                getStudentsBySubject(),
                getMonthlyEnrollments(selectedMonth, selectedYear),
                getAdditionalStats()
            ]);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    useEffect(() => {
        getSummaryData();
        loadAllData();
    }, []);

    useEffect(() => {
        if (selectedMonth && selectedYear) {
            getBirthdayStudents(selectedMonth);
            getMonthlyEnrollments(selectedMonth, selectedYear);
        }
    }, [selectedMonth, selectedYear]);

    return (
        <div className="summary-data-container">
            <button onClick={() => navigate("/students")} className="transparent-button">
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
            <h1>{language === "english" ? "Summary Data" : "Dados Resumidos"}</h1>
            {error && <div className="error">{error}</div>}
            
            {/* Dados básicos */}
            <div className="summary-data">
                <h2>{language === "english" ? "Basic Statistics" : "Estatísticas Básicas"}</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-number">{data.students_total}</span>
                        <span className="stat-label">{language === "english" ? "All Students" : "Todos os Alunos"}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{data.students_active}</span>
                        <span className="stat-label">{language === "english" ? "Active Students" : "Alunos Ativos"}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{data.students_male}</span>
                        <span className="stat-label">{language === "english" ? "Male Students" : "Alunos do Sexo Masculino"}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{data.students_female}</span>
                        <span className="stat-label">{language === "english" ? "Female Students" : "Alunos do Sexo Feminino"}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{data.students_family_income}</span>
                        <span className="stat-label">{language === "english" ? "Families" : "Famílias"}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{data.students_with_NIS}</span>
                        <span className="stat-label">{language === "english" ? "Students with NIS" : "Alunos com NIS"}</span>
                    </div>
                </div>
            </div>

            {/* Aniversariantes do mês */}
            <div className="birthday-section">
                <h2>{language === "english" ? "Birthday Students" : "Aniversariantes do Mês"}</h2>
                <div className="month-selector">
                    <div className="input-group">
                        <label htmlFor="month-select">
                            {language === "english" ? "Month" : "Mês"}
                        </label>
                        <select 
                            id="month-select"
                            value={selectedMonth} 
                            onChange={handleMonthChange}
                        >
                            <option value="01">{language === "english" ? "January" : "Janeiro"}</option>
                            <option value="02">{language === "english" ? "February" : "Fevereiro"}</option>
                            <option value="03">{language === "english" ? "March" : "Março"}</option>
                            <option value="04">{language === "english" ? "April" : "Abril"}</option>
                            <option value="05">{language === "english" ? "May" : "Maio"}</option>
                            <option value="06">{language === "english" ? "June" : "Junho"}</option>
                            <option value="07">{language === "english" ? "July" : "Julho"}</option>
                            <option value="08">{language === "english" ? "August" : "Agosto"}</option>
                            <option value="09">{language === "english" ? "September" : "Setembro"}</option>
                            <option value="10">{language === "english" ? "October" : "Outubro"}</option>
                            <option value="11">{language === "english" ? "November" : "Novembro"}</option>
                            <option value="12">{language === "english" ? "December" : "Dezembro"}</option>
                        </select>
                    </div>
                </div>
                
                {loading ? (
                    <div className="loading">{language === "english" ? "Loading..." : "Carregando..."}</div>
                ) : (
                    <div className="birthday-table">
                        {birthdayStudents.length === 0 ? (
                            <p className="no-data">{language === "english" ? "No birthday students this month" : "Nenhum aniversariante neste mês"}</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{language === "english" ? "Name" : "Nome"}</th>
                                        <th>{language === "english" ? "Registration" : "Matrícula"}</th>
                                        <th>{language === "english" ? "Birth Date" : "Data de Nascimento"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {birthdayStudents.map((student, index) => (
                                        <tr key={index}>
                                            <td>{student.name}</td>
                                            <td>{student.id || '-'}</td>
                                            <td>{formatDate(student.birth_date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Alunos por disciplina */}
            <div className="subjects-section">
                <h2>{language === "english" ? "Students by Subject" : "Alunos por Disciplina"}</h2>
                {loading ? (
                    <div className="loading">{language === "english" ? "Loading..." : "Carregando..."}</div>
                ) : (
                    <div className="subjects-table">
                        {studentsBySubject.length === 0 ? (
                            <p className="no-data">{language === "english" ? "No data available" : "Nenhum dado disponível"}</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{language === "english" ? "Subject" : "Disciplina"}</th>
                                        <th>{language === "english" ? "Students Count" : "Número de Alunos"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsBySubject.map((subject, index) => (
                                        <tr key={index}>
                                            <td>{subject.subject_name}</td>
                                            <td>{subject.student_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Inscrições mensais */}
            <div className="enrollments-section">
                <h2>{language === "english" ? "Monthly Enrollments" : "Inscrições Mensais"}</h2>
                <div className="month-year-selector">
                    <div className="input-group">
                        <label htmlFor="enrollment-month-select">
                            {language === "english" ? "Month" : "Mês"}
                        </label>
                        <select 
                            id="enrollment-month-select"
                            value={selectedMonth} 
                            onChange={handleMonthChange}
                        >
                            <option value="01">{language === "english" ? "January" : "Janeiro"}</option>
                            <option value="02">{language === "english" ? "February" : "Fevereiro"}</option>
                            <option value="03">{language === "english" ? "March" : "Março"}</option>
                            <option value="04">{language === "english" ? "April" : "Abril"}</option>
                            <option value="05">{language === "english" ? "May" : "Maio"}</option>
                            <option value="06">{language === "english" ? "June" : "Junho"}</option>
                            <option value="07">{language === "english" ? "July" : "Julho"}</option>
                            <option value="08">{language === "english" ? "August" : "Agosto"}</option>
                            <option value="09">{language === "english" ? "September" : "Setembro"}</option>
                            <option value="10">{language === "english" ? "October" : "Outubro"}</option>
                            <option value="11">{language === "english" ? "November" : "Novembro"}</option>
                            <option value="12">{language === "english" ? "December" : "Dezembro"}</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="enrollment-year-select">
                            {language === "english" ? "Year" : "Ano"}
                        </label>
                        <select 
                            id="enrollment-year-select"
                            value={selectedYear} 
                            onChange={handleYearChange}
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                            <option value="2028">2029</option>
                            <option value="2028">2030</option>
                        </select>
                    </div>
                </div>
                
                {loading ? (
                    <div className="loading">{language === "english" ? "Loading..." : "Carregando..."}</div>
                ) : (
                    <div className="enrollments-table">
                        {monthlyEnrollments.length === 0 ? (
                            <p className="no-data">{language === "english" ? "No enrollments this month" : "Nenhuma inscrição neste mês"}</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{language === "english" ? "Date" : "Data"}</th>
                                        <th>{language === "english" ? "Enrollments" : "Inscrições"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyEnrollments.map((enrollment, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(enrollment.enrollment_date)}</td>
                                            <td>{enrollment.enrollment_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Estatísticas adicionais */}
            <div className="additional-stats-section">
                <h2>{language === "english" ? "Additional Statistics" : "Estatísticas Adicionais"}</h2>
                {loading ? (
                    <div className="loading">{language === "english" ? "Loading..." : "Carregando..."}</div>
                ) : (
                    <div className="additional-stats-grid">
                        <div className="stat-card">
                            <span className="stat-number">{additionalStats.averageAge || 0}</span>
                            <span className="stat-label">{language === "english" ? "Average Age" : "Idade Média"}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{additionalStats.newStudentsLastMonth || 0}</span>
                            <span className="stat-label">{language === "english" ? "New Students Last Month" : "Novos Alunos no Último Mês"}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
