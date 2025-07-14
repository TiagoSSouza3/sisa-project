import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from './components/LanguageContext';


import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
);   
