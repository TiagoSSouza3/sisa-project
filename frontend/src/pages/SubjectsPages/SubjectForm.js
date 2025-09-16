import { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from '../../components/LanguageContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';
import '../../styles/global.css';
import '../../styles/subject-creation.css';

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
            // Filtrar apenas usuários com occupation_id = "3" (professores) ou "PROFESSOR"
            const professores = response.data.filter(user => 
                user.occupation_id === "3" || 
                user.occupation_id === 3 || 
                user.occupation_id === "PROFESSOR"
            );
            setProfessor(professores);
            console.log("Professores encontrados:", professores); // Debug
        } catch (err) {
            console.error("Erro ao carregar professores:", err);
            navigate(`/subject_infos/${id}`);
        }
    };

    const handleSubmit = async () => {
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
