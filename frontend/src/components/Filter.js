import React, { useState } from 'react';
import '../styles/filter.css';
import { useLanguage } from './LanguageContext';

const Filter = ({ onFilterChange, onFilter }) => {
  const { language } = useLanguage();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    onFilterChange(filters);
    if (onFilter) {
      onFilter();
    }
  };

  return (
    <div className="filter-container">
      <div className="filter-row">
        <div className="filter-group">
          <label>Status</label>
          <select name="isActive" value={filters.isActive} onChange={handleChange}>
            <option value="all">{language === "english" ? "All" : "Todos"}</option>
            <option value="true">{language === "english" ? "Active" : "Ativo"}</option>
            <option value="false">{language === "english" ? "Inactive" : "Inativo"}</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>{language === "english" ? "At School Currently" : "Estuda Atualmente"}</label>
          <select name="isOnSchool" value={filters.isOnSchool} onChange={handleChange}>
          <option value="all">{language === "english" ? "All" : "Todos"}</option>
            <option value="true">{language === "english" ? "Yes" : "Sim"}</option>
            <option value="false">{language === "english" ? "No" : "Não"}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{language === "english" ? "School Year" : "Ano Escolar"}</label>
          <select name="schoolYear" value={filters.schoolYear} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="1º ano">1º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="2º ano">2º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="3º ano">3º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="4º ano">4º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="5º ano">5º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="6º ano">6º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="7º ano">7º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="9º ano">9º {language === "english" ? "Grade" : "Ano"}</option>
            <option value="8º ano">8º {language === "english" ? "Grade" : "Ano"}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{language === "english" ? "School Period" : "Periodo Escolar"}</label>
          <select name="schoolPeriod" value={filters.schoolPeriod} onChange={handleChange}>
            <option value="">{language === "english" ? "All" : "todos"}</option>
            <option value="Manhã">{language === "english" ? "Morning" : "Manhã"}</option>
            <option value="Tarde">{language === "english" ? "Afternoon" : "Tarde"}</option>
            <option value="Noite">{language === "english" ? "Night" : "Noite"}</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>{language === "english" ? "Gender" : "Gênero"}</label>
          <select name="gender" value={filters.gender} onChange={handleChange}>
            <option value="all">{language === "english" ? "All" : "Todos"}</option>
            <option value="Masculino">{language === "english" ? "Male" : "Masculino"}</option>
            <option value="Feminino">{language === "english" ? "Female" : "Feminino"}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{language === "english" ? "Age Range" : "Faixa Etária"}</label>
          <select name="ageRange" value={filters.ageRange} onChange={handleChange}>
            <option value="all">{language === "english" ? "All" : "Todos"}</option>
            <option value="0-5">0-5 anos</option>
            <option value="6-10">6-10 anos</option>
            <option value="11-14">11-14 anos</option>
            <option value="15-17">15-17 anos</option>
            <option value="18+">18+ anos</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{language === "english" ? "neighborhood" : "Bairro"}</label>
          <input
            type="text"
            name="neighborhood"
            value={filters.neighborhood}
            onChange={handleChange}
            placeholder={language === "english" ? "Filter from neighborhood" : "Filtrar por bairro"}
          />
        </div>
      </div>

      <div className="filter-actions">
        <button className="filter-button" onClick={handleFilter}>
          {language === "english" ? "Filter" : "Filtrar"}
        </button>
      </div>
    </div>
  );
};

export default Filter; 