import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

import '../styles/global.css';
import '../styles/summary_data.css';

export default function Summary_data() {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const getSummaryData = async () => {
        const res = await API.get("/summary_data");
        setData(res.data);
    }

    const updateSummaryData = async () => {
        const res = await API.put("/summary_data");
        setData(res.data);
    }

    const getSummaryInfosFromStudents = async () => {
        const res = await API.get("/students");
        const students = res.data;

        const students_active = students.filter(student => student.active).length;
        const students_total = students.length;
        const students_male = students.filter(student => student.gender === "Masculino").length;
        const students_female = students.filter(student => student.gender === "Feminino").length;
        const students_family_income = students.reduce((acc, student) => acc + student.family_income, 0);
        const students_with_NIS = 0;

        const summaryData = {
            students_active,
            students_total,
            students_male,
            students_female,
            students_family_income,
            students_with_NIS
        }

        updateSummaryData(summaryData);
    }

    useEffect(() => {
        getSummaryData();
    }, []);

    return (
        <div className="summary-data-container">
            <h1>Summary Data</h1>
        </div>
    );
}