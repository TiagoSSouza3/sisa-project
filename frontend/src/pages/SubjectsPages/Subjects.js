import { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/subjects.css';

export default function Subjects() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language } = useLanguage();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();
  
  const loadSubjects = async () => {
    try {
      let subject;
      
      const userOccupation = localStorage.getItem("occupation_id");
      const userId = localStorage.getItem("id");
      
      console.log("🔍 DEBUG - User occupation:", userOccupation);
      console.log("🔍 DEBUG - User ID:", userId);
      console.log("🔍 DEBUG - occupationEnum.professor:", occupationEnum.professor);
      
      if (userOccupation === occupationEnum.professor || userOccupation === "3" || userOccupation === 3) {
        console.log("✅ Usuário identificado como PROFESSOR");
        console.log("📡 Fazendo requisição para:", `/subjects/professor/${userId}`);
        
        // Para professores, carregar apenas as matérias atribuídas a eles
        subject = await API.get(`/subjects/professor/${userId}`);
        console.log("📦 Resposta da API para professor:", subject.data);
      } else {
        console.log("✅ Usuário identificado como ADMIN/COLABORADOR");
        console.log("📡 Fazendo requisição para:", `/subjects`);
        
        // Para admins e colaboradores, carregar todas as matérias
        subject = await API.get(`/subjects`);
        console.log("📦 Resposta da API para admin:", subject.data);
      }
      
      // Verificar se a resposta é um array ou um objeto
      console.log("🔍 Tipo da resposta:", typeof subject.data);
      console.log("🔍 É array?", Array.isArray(subject.data));
      
      if (Array.isArray(subject.data)) {
        console.log("✅ Definindo subjects como array direto");
        setSubjects(subject.data);
      } else if (subject.data && Array.isArray(subject.data.subjects)) {
        console.log("✅ Definindo subjects do objeto.subjects");
        setSubjects(subject.data.subjects);
      } else if (subject.data && subject.data.length !== undefined) {
        console.log("✅ Tentando tratar como array-like");
        setSubjects([subject.data]);
      } else {
        console.log("❌ Nenhum formato reconhecido, definindo array vazio");
        console.log("🔍 Estrutura completa da resposta:", JSON.stringify(subject.data, null, 2));
        setSubjects([]);
      }

    } catch (err) {
      console.error("❌ Erro ao carregar disciplinas:", err);
      console.error("❌ Detalhes do erro:", err.response?.data);
      setSubjects([]);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(token !== null);
    loadSubjects();
  }, []);

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h2>{language === "english" ? "Subjects" : "Disciplinas"}</h2>
        { isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.administrador && 
          <button 
            className="add-subject-button"
            onClick={() => navigate("/subject_form")}
          >
            {language === "english" ? "Add New Subject" : "Adicionar nova Disciplina"}
          </button>
        }
      </div>

      <div className="subjects-list">
        {subjects.length === 0 ? (
          <div className="empty-state">{language === "english" ? "No Registered Discipline" : "Nenhuma Disciplina Registrada"}</div>
        ) : (
          subjects.map(subject => (
            <div key={subject.id} className="subject-card">
              <h3 className="subject-title">{subject.name}</h3>
              <p className="subject-info">{subject.description}</p>
              <div className="subject-actions">
                <button 
                  className="edit-button"
                  onClick={() => navigate(`/subject_infos/${subject.id}`)}
                >
                  {language === "english" ? "Edit" : "Editar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 