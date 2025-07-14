import React from "react";
import { useLanguage } from '../components/LanguageContext';

export default function Dashboard() {
  const { language } = useLanguage();
  const firstName = localStorage.getItem("name").split(" ")[0];

  return (
    <h1>
      {language === "english" ? "Welcome to system " : "Bem-vindo ao sistema "}
      SISA, {firstName}
    </h1>
  );
}
