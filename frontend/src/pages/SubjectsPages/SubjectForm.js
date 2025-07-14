import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/subject-creation.css';

export default function SubjectForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language } = useLanguage();

    const [subject, setSubject] = useState({
        name: "",
        description: "",
        professor_id: 0
    });
    const [professor, setProfessor] = useState([]);
    const [selectedProfessor, setSelectedProfessor] = useState([]);

    useEffect(() => {
        loadProfessor();

        if (id) {
            loadSubject();
        }
    }, [id]);

    const loadSubject = async () => {
        try {
            const response = await API.get(`/subjects/professor/${id}`);
            await setSubject(response.data);
            console.log(response.data)

            if (response.data.professores && response.data.professores.length > 0) {
                const ids = response.data.professores.map(p => String(p.id));
                setSelectedProfessor(ids);
                console.log(ids)
            } else {
                setSelectedProfessor(['']);
            }
        } catch (err) {
            console.error("Erro ao carregar disciplina:", err);
            navigate(`/subject_infos/${id}`);
        }
    };

    const loadProfessor = async () => {
        try {
            const response = await API.get(`/users/`);
            setProfessor(response.data);
        } catch (err) {
            console.error("Erro ao carregar professores:", err);
            navigate(`/subject_infos/${id}`);
        }
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...subject,
                professores: selectedProfessor.filter(p => p !== '')
            };

            if (id) {
                await API.put(`/subjects/${id}`, payload);
                navigate(`/subject_infos/${id}`);
            } else {
                await API.post("/subjects", payload);
                navigate("/subjects");
            }

        } catch (err) {
            console.error("Erro ao salvar disciplina:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        }
    };

    const removeProfessor = (index) => {
        const newProfessor = [...selectedProfessor];
        newProfessor.splice(index, 1);
        setSelectedProfessor(newProfessor);
    };

    const addProfessor = () => {
        setSelectedProfessor([...selectedProfessor, '']);
    };

    const changeProfessor = (index, value) => {
        const newProfessor = [...selectedProfessor];
        newProfessor[index] = value;
        setSelectedProfessor(newProfessor);
    };

    return (
        <div className="subject-creation-container">
            <button onClick={() => navigate(id ? `/subject_infos/${id}` : `/subjects/`)} className="transparent-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                </svg>
            </button>
            <h2>{id 
                    ? language === "english" ? "Edit Subject" : "Editar Disciplina"
                    : language === "english" ? "Create New Subject" : "Criar Nova Disciplina"
            }
            </h2>

            <form 
                className="subject-form"
                onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSubmit(); 
                }}
            >
                <div className="form-group">
                    <label htmlFor="name">{language === "english" ? "Subject's Name" : "Nome da Disciplina"}</label>
                    <input 
                        id="name"
                        type="text"
                        placeholder={language === "english" ? "Write Subject's Name" : "Digite o Nome da Disciplina"}
                        value={subject.name}
                        onChange={(e) => setSubject({ ...subject, name: e.target.value })} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">{language === "english" ? "Description" : "Descrição"}</label>
                    <textarea 
                        id="description"
                        placeholder={language === "english" ? "Write the Description" : "Digite a descrição"}
                        value={subject.description}
                        onChange={(e) => setSubject({ ...subject, description: e.target.value })} 
                        required
                        maxLength={300}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">{language === "english" ? "Teachers" : "Professores"}</label>
                    {selectedProfessor.map((value, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <select
                                value={value}
                                onChange={(e) => changeProfessor(index, e.target.value)}
                            >
                                <option value="">{language === "english" ? "Select a Teacher" : "Selecione o Professor"}</option>
                                {professor.map((prof) => (
                                    <option key={prof.id} value={prof.id}>
                                        {prof.name}
                                    </option>
                                ))}
                            </select>
                            {selectedProfessor.length > 1 && (
                                <button type="button" onClick={() => removeProfessor(index)}>
                                    {language === "english" ? "Remove" : "Remover"}
                                </button>
                            )}
                        </div>
                    ))}

                    <button type="button" onClick={addProfessor}>{language === "english" ? "Add Teacher" : "Adicionar Professor"}</button>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => navigate("/subjects")}
                    >
                        {language === "english" ? "Cancel" : "Cancelar"}
                    </button>
                    <button type="submit" className="submit-button">
                        {id 
                            ? language === "english" ? "Edit Subject" : "Editar Disciplina"
                            : language === "english" ? "Create Subject" : "Criar Disciplina"
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
