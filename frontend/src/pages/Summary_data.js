import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

import '../styles/global.css';
import '../styles/summary_data.css';

export default function Summary_data() {
    const [data, setData] = useState({
        students_active: 0,
        students_total: 0,
        students_male: 0,
        students_female: 0,
        students_family_income: 0,
        students_with_NIS: 0
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const getSummaryData = async () => {
        try {
            let res = await API.get("/summary_data");

            if (res.data.length === 0) {
                await getSummaryInfosFromStudents();
            } else {
                setData(res.data[0]);
            }

            localStorage.setItem("summary_data", JSON.stringify(res.data[0]));
            
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
            const summaryData = {
                students_active: parseInt(data.students_active) || 0,
                students_total: parseInt(data.students_total) || 0,
                students_male: parseInt(data.students_male) || 0,
                students_female: parseInt(data.students_female) || 0,
                students_family_income: parseInt(data.students_family_income) || 0,
                students_with_NIS: parseInt(data.students_with_NIS) || 0
            };
            
            const res = await API.put("/summary_data", summaryData);
            setData(res.data);
            setError("");
        } catch (err) {
            console.error("Error updating summary data:", err);
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

        createSummaryData();
    }

    useEffect(() => {
        getSummaryData();
    }, []);

    return (
        <div className="summary-data-container">
            <h1>Summary Data</h1>
            {error && <div className="error">{error}</div>}
            <div className="summary-data">
                <p>Total de Alunos: {data.students_total}</p>
                <p>Alunos Ativos: {data.students_active}</p>
                <p>Alunos do Sexo Masculino: {data.students_male}</p>
                <p>Alunos do Sexo Feminino: {data.students_female}</p>
                <p>Familias: {data.students_family_income}</p>
                <p>Alunos com NIS: {data.students_with_NIS}</p>
            </div>
        </div>
    );
}