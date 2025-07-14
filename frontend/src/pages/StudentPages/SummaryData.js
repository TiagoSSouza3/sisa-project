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
    const [existingData, setExistingData] = useState(false)
    const navigate = useNavigate();

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

    const createSummaryData = async () => {
        try {
            const summaryData = {
                students_active: parseInt(data.students_active) || 0,
                students_total: parseInt(data.students_total) || 0,
                students_male: parseInt(data.students_male) || 0,
                students_female: parseInt(data.students_female) || 0,
                students_family_income: parseInt(data.students_family_income) || 0,
                students_with_NIS: parseInt(data.students_with_NIS) || 0
            };
            
            const res = await API.post("/summary_data", summaryData);
            setData(res.data);
            setError("");
        } catch (err) {
            console.error("Error creating summary data:", err);
            setError("Erro ao criar dados resumidos");
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

    useEffect(() => {
        getSummaryData();
    }, []);

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
            <h1>{language === "english" ? "Summary Data" : "Dados"}</h1>
            {error && <div className="error">{error}</div>}
            <div className="summary-data">
                <p>{language === "english" ? "All Students" : "Todos os Alunos"}: {data.students_total}</p>
                <p>{language === "english" ? "Active Students" : "Alunos Ativos"}: {data.students_active}</p>
                <p>{language === "english" ? "Male Students" : "Alunos do Sexo Masculino"}: {data.students_male}</p>
                <p>{language === "english" ? "Female Students" : "Alunos do Sexo Feminino"}: {data.students_female}</p>
                <p>{language === "english" ? "Families" : "Familias"}: {data.students_family_income}</p>
                <p>{language === "english" ? "Students with NIS" : "Alunos com NIS"}: {data.students_with_NIS}</p>
            </div>
        </div>
    );
}