import React, { useState } from 'react';
import '../styles/filter.css';

const Filter = ({ onFilterChange, onFilter }) => {
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
            <option value="all">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Estuda atualmente</label>
          <select name="isOnSchool" value={filters.isOnSchool} onChange={handleChange}>
            <option value="all">Todos</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ano Escolar</label>
          <select name="schoolYear" value={filters.schoolYear} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="1º ano">1º ano</option>
            <option value="2º ano">2º ano</option>
            <option value="3º ano">3º ano</option>
            <option value="4º ano">4º ano</option>
            <option value="5º ano">5º ano</option>
            <option value="6º ano">6º ano</option>
            <option value="7º ano">7º ano</option>
            <option value="8º ano">8º ano</option>
            <option value="9º ano">9º ano</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Período Escolar</label>
          <select name="schoolPeriod" value={filters.schoolPeriod} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Gênero</label>
          <select name="gender" value={filters.gender} onChange={handleChange}>
            <option value="all">Todos</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Faixa Etária</label>
          <select name="ageRange" value={filters.ageRange} onChange={handleChange}>
            <option value="all">Todas</option>
            <option value="0-5">0-5 anos</option>
            <option value="6-10">6-10 anos</option>
            <option value="11-14">11-14 anos</option>
            <option value="15-17">15-17 anos</option>
            <option value="18+">18+ anos</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Bairro</label>
          <input
            type="text"
            name="neighborhood"
            value={filters.neighborhood}
            onChange={handleChange}
            placeholder="Filtrar por bairro"
          />
        </div>
      </div>

      <div className="filter-actions">
        <button className="filter-button" onClick={handleFilter}>Filtrar</button>
      </div>
    </div>
  );
};

export default Filter; 