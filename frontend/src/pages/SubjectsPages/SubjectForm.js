import { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from '../../components/LanguageContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';
import '../../styles/global.css';
import '../../styles/subject-creation.css';
import { occupationEnum } from "../../enums/occupationEnum";

export default function SubjectForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { language } = useLanguage();
    const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

    const [subject, setSubject] = useState({
        name: "",
        description: "",
        professor_id: 0
    });
    const [professor, setProfessor] = useState([]);
    const [selectedProfessor, setSelectedProfessor] = useState([]);
    const [nameError, setNameError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");

    // Flag para ativar/desativar validação de palavras inapropriadas
    const ENABLE_INAPPROPRIATE_WORDS_CHECK = false;

    // Lista de palavras inapropriadas (blacklist) - DESATIVADA
    // Para ativar, mude ENABLE_INAPPROPRIATE_WORDS_CHECK para true
    const inappropriateWords = [
        // Adicione palavras inapropriadas aqui quando necessário
    ];

    useEffect(() => {
        loadProfessor();

        if (id) {
            loadSubject();
        }
    }, [id]);

    const mergeProfessorLists = (current = [], incoming = []) => {
        const listMap = new Map(
            current.map((prof) => [String(prof.id), { ...prof, id: String(prof.id) }])
        );

        incoming.forEach((prof) => {
            if (!prof) return;
            const normalized = { ...prof, id: String(prof.id) };
            if (!listMap.has(normalized.id)) {
                listMap.set(normalized.id, normalized);
            }
        });

        return Array.from(listMap.values());
    };

    const loadSubject = async () => {
        try {
            const response = await API.get(`/subjects/withProfessor/${id}`);
            await setSubject(response.data);

            if (response.data.professores && response.data.professores.length > 0) {
                const ids = response.data.professores.map(p => String(p.id));
                setSelectedProfessor(ids);
                setProfessor(prev => mergeProfessorLists(prev, response.data.professores));
            } else {
                setSelectedProfessor(['']);
            }
        } catch (err) {
            console.error("Erro ao carregar disciplina:", err);
            navigate(`/subject_infos/${id}`);
        }
    };

    // Função para normalizar texto (remove pontuação, espaços, etc)
    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[^a-z0-9]/g, ''); // Remove tudo exceto letras e números
    };

    // Função para verificar palavras inapropriadas
    const containsInappropriateWords = (text) => {
        // Se a validação estiver desativada, sempre retorna false
        if (!ENABLE_INAPPROPRIATE_WORDS_CHECK) return false;
        
        if (!text) return false;
        
        const normalizedText = normalizeText(text);
        
        // Verifica cada palavra da blacklist
        for (const word of inappropriateWords) {
            const normalizedWord = normalizeText(word);
            
            // Verifica se a palavra aparece no texto normalizado
            if (normalizedText.includes(normalizedWord)) {
                return true;
            }
            
            // Verifica variações com espaços entre letras (ex: b u n d a)
            const spacedPattern = normalizedWord.split('').join('.*');
            const regex = new RegExp(spacedPattern, 'i');
            if (regex.test(normalizedText)) {
                return true;
            }
        }
        
        return false;
    };

    // Função para sanitizar texto (remove caracteres perigosos)
    const sanitizeText = (text) => {
        if (!text) return '';
        const dangerous = /<|>|{|}|\[|\]|\\|\/script|<script|javascript:|onerror=|onclick=/gi;
        return text.replace(dangerous, '');
    };

    const loadProfessor = async () => {
        try {
            const response = await API.get(`/users/`);
            const professores = response.data.filter(user => 
                user.occupation_id === "3" || 
                user.occupation_id === 3 || 
                user.occupation_id === occupationEnum.professor ||
                user.occupation_id === "1" ||
                user.occupation_id === 1 ||
                user.occupation_id === occupationEnum.administrador
            );
            setProfessor(prev => mergeProfessorLists(prev, professores));
        } catch (err) {
            console.error("Erro ao carregar professores:", err);
            navigate(`/subject_infos/${id}`);
        }
    };

    const handleSubmit = async () => {
        // Validações antes de enviar
        if (containsInappropriateWords(subject.name)) {
            setNameError(language === "english" 
                ? "Subject name contains inappropriate content" 
                : "Nome da disciplina contém conteúdo inapropriado");
            return;
        }

        if (containsInappropriateWords(subject.description)) {
            setDescriptionError(language === "english" 
                ? "Description contains inappropriate content" 
                : "Descrição contém conteúdo inapropriado");
            return;
        }

        const payload = {
            ...subject,
            professores: selectedProfessor.filter(p => p !== '')
        };

        if(!id){
            await API.post("/subjects", payload);
            navigate("/subjects");
        }

        showConfirmation({
            type: 'edit',
            title: language === "english" ? "Edit subject" : "Editar Disciplina",
            message: language === "english" 
            ? `Do you want to edit subject "${subject?.name}"?`
            : `Deseja editar a Disciplina "${subject?.name}"?`,
            confirmText: language === "english" ? "Edit" : "Editar",
            onConfirm: async () => {
                try {
                    await API.put(`/subjects/${id}`, payload);
                    
                    navigate(`/subject_infos/${id}`);
                } catch (err) {
                    console.error("Erro ao salvar disciplina:", {
                        message: err.message,
                        response: err.response?.data,
                        status: err.response?.status
                    });
                }
            }
        });
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

    const handleCancell = () => {
        if(id) navigate(`/subject_infos/${id}`);
        else navigate("/subjects");
    }

    const handleDelete = async () => {
        if(!id) return;
        showConfirmation({
            type: 'delete',
            title: language === "english" ? "Delete Subject" : "Excluir Disciplina",
            message: language === "english" 
                ? `Are you sure you want to delete subject "${subject?.name}"? This action cannot be undone.`
                : `Tem certeza que deseja excluir a disciplina "${subject?.name}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                try {
                    await API.delete(`/subjects/${id}`);
                    navigate('/subjects');
                } catch (err) {
                    console.error('Erro ao excluir disciplina:', err);
                }
            }
        });
    }

    return (
        <div className="subject-creation-container">
            <form
                className="subject-form"
                onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSubmit(); 
                }}
            >
                <div className="form-header">
                    <button onClick={() => navigate(id ? `/subject_infos/${id}` : `/subjects/`)} className="transparent-button back-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                        </svg>
                    </button>
                    <h2>{id 
                        ? (language === "english" ? "Edit Subject" : "Editar Disciplina")
                        : (language === "english" ? "Create New Subject" : "Criar Nova Disciplina")
                    }
                    </h2>
                </div>
                <div className="form-group">
                    <label htmlFor="name">{language === "english" ? "Subject's Name" : "Nome da Disciplina"}</label>
                    <input 
                        id="name"
                        type="text"
                        placeholder={language === "english" ? "Write Subject's Name" : "Digite o Nome da Disciplina"}
                        value={subject.name}
                        onChange={(e) => {
                            const value = sanitizeText(e.target.value);
                            if (value.length <= 150) {
                                setSubject({ ...subject, name: value });
                                setNameError("");
                                
                                // Verifica palavras inapropriadas em tempo real
                                if (containsInappropriateWords(value)) {
                                    setNameError(language === "english" 
                                        ? "Subject name contains inappropriate content" 
                                        : "Nome da disciplina contém conteúdo inapropriado");
                                }
                            }
                        }} 
                        required 
                    />
                    {nameError && <span className="error-message">{nameError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">{language === "english" ? "Description" : "Descrição"}</label>
                    <textarea 
                        id="description"
                        placeholder={language === "english" ? "Write the Description" : "Digite a descrição"}
                        value={subject.description}
                        onChange={(e) => {
                            const value = sanitizeText(e.target.value);
                            const textWithoutSpaces = value.replace(/\s/g, '');
                            if (textWithoutSpaces.length <= 150) {
                                setSubject({ ...subject, description: value });
                                setDescriptionError("");
                                
                                // Verifica palavras inapropriadas em tempo real
                                if (containsInappropriateWords(value)) {
                                    setDescriptionError(language === "english" 
                                        ? "Description contains inappropriate content" 
                                        : "Descrição contém conteúdo inapropriado");
                                }
                            }
                        }} 
                        required
                    />
                    {descriptionError && <span className="error-message">{descriptionError}</span>}
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
                        onClick={handleCancell}
                    >
                        {language === "english" ? "Cancel" : "Cancelar"}
                    </button>
                    {id && (
                        <button 
                            type="button" 
                            className="delete-button"
                            onClick={handleDelete}
                        >
                            {language === "english" ? "Delete" : "Excluir"}
                        </button>
                    )}
                    <button type="submit" className="submit-button">
                        {id 
                            ? language === "english" ? "Edit Subject" : "Editar Disciplina"
                            : language === "english" ? "Create Subject" : "Criar Disciplina"
                        }
                    </button>
                </div>
            </form>

            <ConfirmationModal
                isOpen={confirmationState.isOpen}
                onClose={hideConfirmation}
                onConfirm={handleConfirm}
                title={confirmationState.title}
                message={confirmationState.message}
                confirmText={confirmationState.confirmText}
                cancelText={confirmationState.cancelText}
                type={confirmationState.type}
                isLoading={confirmationState.isLoading}
            />
        </div>
    );
}
