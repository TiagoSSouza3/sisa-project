import React from 'react';
import '../styles/searchbar.css';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Pesquisar...",
  className = ""
}) => {
  return (
    <div className={`search-container ${className}`.trim()}>
      <svg 
        className="search-icon" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar; 