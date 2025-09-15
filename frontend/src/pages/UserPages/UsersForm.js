import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';
import { validateEmail } from '../../utils/validation';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';

import '../../styles/global.css';
import '../../styles/users-creation.css';

export default function UsersForm() {
    const { id } = useParams();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
    const [user, setUser] = useState({
        name: "",
        email: "",
        occupation_id: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        if (id) {
            getUserById();
        }
    }, [id]);

    const getUserById = async () => {
        try {
            const response = await API.get(`/users/${id}`);
            setUser(response.data);
        } catch (err) {
            console.error("Erro ao buscar usuário:", err);
            navigate("/users");
        }
    }

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setUser({ ...user, email: emailValue });
        
        if (emailValue) {
            const emailValidation = validateEmail(emailValue);
            if (!emailValidation.isValid) {
                setEmailError(emailValidation.message);
            } else {
                setEmailError("");
            }
        } else {
            setEmailError("");
        }
    };

    const handleSave = async () => {
        // Validar campos obrigatórios
        if (!user.name.trim()) {
            setError(language === "english" ? "Name is required" : "Nome é obrigatório");
            return;
        }

        if (!user.email.trim()) {
            setError(language === "english" ? "Email is required" : "Email é obrigatório");
            return;
        }

        if (!user.occupation_id) {
            setError(language === "english" ? "Occupation is required" : "Função é obrigatória");
            return;
        }

        // Validar email
        const emailValidation = validateEmail(user.email);
        if (!emailValidation.isValid) {
            setEmailError(emailValidation.message);
            setError(language === "english" ? "Please fix the email error" : "Por favor, corrija o erro no email");
            return;
        }

        if (!id) {
            await API.post("/users", user);
        }
        else {
            showConfirmation({
                type: 'edit',
                title: language === "english" ? "Edit User" : "Editar Usuário",
                message: language === "english" 
                ? `Do you want to edit user "${user?.name}"?`
                : `Deseja editar o usuário "${user?.name}"?`,
                confirmText: language === "english" ? "Edit" : "Editar",
                onConfirm: async () => {
                    await API.put(`/users/${id}`, user);
                    setUser({
                        name: "",
                        email: "",
                        occupation_id: ""
                    });
                    navigate("/users");
                }
            });
        }
    }

    const handleCancel = () => {
        navigate("/users");
    };

    if(isLoggedIn && localStorage.getItem("occupation_id") === occupationEnum.professor){
        return (
            <div className="users-container">
                access denied
            </div>
        );
    }

    return (
        <div className="users-creation-container">
            <div className="users-creation-form">
                { id != null
                    ? <h2>{language === "english" ? "Edit User" : "Editar Usuario"}</h2>
                    : <h2>{language === "english" ? "Create New user" : "Criar Novo Usuário"}</h2> 
                }
                
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="name">{language === "english" ? "Name" : "Nome"} *</label>
                    <input
                        id="name"
                        type="text"
                        placeholder={language === "english" ? "Write the Name" : "Digite o Nome"}
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                        id="email"
                        type="text"
                        placeholder={language === "english" ? "Write the Email Address" : "Digite o Email"}
                        value={user.email}
                        onChange={handleEmailChange}
                        required
                    />
                    {emailError && <span className="error-message">{emailError}</span>}
                </div>

                {/* Password field removed - users will receive email to set password */}
                {!id && (
                    <div className="info-message">
                        <p>{language === "english" 
                            ? "The user will receive an email to set their password." 
                            : "O usuário receberá um email para definir sua senha."
                        }</p>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="role">{language === "english" ? "Occupation" : "Função"} *</label>
                    <select
                        id="role"
                        value={user.occupation_id}
                        onChange={(e) => setUser({ ...user, occupation_id: e.target.value})}
                        required
                    >
                        <option value="">{language === "english" ? "Select the occupation" : "Selecione a função"}</option>
                        <option value="1">Administrador</option>
                        <option value="3">Professor</option>
                        <option value="2">Colaborador</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button className="cancel-button" onClick={handleCancel}>
                        {language === "english" ? "Cancel" : "Cancelar"}
                    </button>
                    <button className="submit-button" onClick={handleSave}>
                        { id 
                            ? language === "english" ? "Edit User" : "Editar usuário" 
                            : language === "english" ? "Create User" : "Criar usuário"
                        }
                    </button>
                </div>
            </div>

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