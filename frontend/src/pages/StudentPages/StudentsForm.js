import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { cpf } from "cpf-cnpj-validator";
import { useLanguage } from '../../components/LanguageContext';
import { validadeAge, validateEmail } from '../../utils/validation';
import { dateToString, StringToDate } from '../../utils/utils';
import useConfirmation from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/global.css';
import '../../styles/students-creation.css';

export default function StudentsForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [phoneError, setPhoneError] = useState("");
    const [secondPhoneError, setSecondPhoneError] = useState("");
    const [cpfError, setCpfError] = useState("");
    const [rgError, setRgError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [childAge, setChildAge] = useState("");
    const [ageError, setAgeError] = useState("");
    const [cepError, setCepError] = useState("");
    const [loadingCep, setLoadingCep] = useState(false);
    const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

    const [student, setStudent] = useState({
        name: "",
        registration: 0,
        CPF: "",
        gender: "",
        skin_color: "",
        RG: "",
        email: "",
        phone: "",
        second_phone: "",
        responsable: "",
        degree_of_kinship: "",
        UBS: "",
        is_on_school: false,
        school_year: "",
        school_name: "",
        school_period: "",
        birth_date: "",
        address: "",
        neighborhood: "",
        cep: "",
        notes: "",
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    useEffect(() => {
        if (id) {
            getStudentById();
        }
    }, [id]);

    const getStudentById = async () => {
        try {
            const response = await API.get(`/students/${id}`);
            setStudent(response.data);
            setChildAge(validadeAge(response.data.birth_date))
        } catch (err) {
            console.error("Erro ao buscar aluno:", err);
        }
    };

    const validatePhoneNumber = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        
        if (!cleanPhone) return true;
        
        if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
            return false;
        }
        
        const areaCode = parseInt(cleanPhone.substring(0, 2));
        if (areaCode < 11 || areaCode > 99) {
            return false;
        }
        
        return true;
    };

    const formatPhoneNumber = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
        }
        
        return phone;
    };

    const handlePhoneChange = (e, isSecondPhone = false) => {
        const phoneValue = e.target.value;
        const formattedPhone = formatPhoneNumber(phoneValue);
        
        if (isSecondPhone) {
            setStudent({ ...student, second_phone: formattedPhone });
            if (phoneValue && !validatePhoneNumber(phoneValue)) {
                setSecondPhoneError("Telefone inválido. Use um número de telefone brasileiro válido.");
            } else {
                setSecondPhoneError("");
            }
        } else {
            setStudent({ ...student, phone: formattedPhone });
            if (phoneValue && !validatePhoneNumber(phoneValue)) {
                setPhoneError("Telefone inválido. Use um número de telefone brasileiro válido.");
            } else {
                setPhoneError("");
            }
        }
    };

    const validateCPF = (cpfNumber) => {
        const cleanCPF = cpfNumber.replace(/\D/g, '');
        
        if (!cleanCPF) return true;
        
        return cpf.isValid(cleanCPF);
    };

    const validateRG = (rg) => {
        const cleanRG = rg.replace(/[^\dX]/gi, '');
        
        if (!cleanRG) return true;
        
        if (cleanRG.length < 6 || cleanRG.length > 11) {
            return false;
        }
        
        return true;
    };

    const validateName = (name) => {
        if (!name) return true;
        
        // Remove espaços extras e divide em palavras
        const words = name.trim().split(/\s+/);
        
        // Verifica se tem no máximo 10 palavras
        if (words.length > 10) {
            return false;
        }
        
        // Verifica se cada palavra contém apenas letras
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
        return nameRegex.test(name);
    };

    const sanitizeText = (text) => {
        if (!text) return '';
        
        // Remove caracteres perigosos que podem ser usados para injeção de código
        // Remove <, >, {, }, [, ], \, /, script tags, etc
        const dangerous = /<|>|{|}|\[|\]|\\|\/script|<script|javascript:|onerror=|onclick=/gi;
        
        return text.replace(dangerous, '');
    };

    const validateFreeText = (text, maxLength = 150) => {
        if (!text) return true;
        
        // Remove espaços para contar apenas caracteres
        const textWithoutSpaces = text.replace(/\s/g, '');
        
        // Verifica se excede o limite
        if (textWithoutSpaces.length > maxLength) {
            return false;
        }
        
        // Verifica se contém caracteres perigosos
        const dangerous = /<|>|{|}|\[|\]|\\|\/script|<script|javascript:|onerror=|onclick=/gi;
        if (dangerous.test(text)) {
            return false;
        }
        
        return true;
    };

    const handleNameChange = (e) => {
        const nameValue = e.target.value;
        
        // Limita a 10 palavras
        const words = nameValue.trim().split(/\s+/);
        if (words.length <= 10 && validateName(nameValue)) {
            setStudent({ ...student, name: nameValue });
        }
    };

    const handleNeighborhoodChange = (e) => {
        const value = sanitizeText(e.target.value);
        const textWithoutSpaces = value.replace(/\s/g, '');
        
        // Limita a 150 caracteres (sem contar espaços)
        if (textWithoutSpaces.length <= 150) {
            setStudent({ ...student, neighborhood: value });
        }
    };

    const handleAddressChange = (e) => {
        const value = sanitizeText(e.target.value);
        const textWithoutSpaces = value.replace(/\s/g, '');
        
        // Limita a 150 caracteres (sem contar espaços)
        if (textWithoutSpaces.length <= 150) {
            setStudent({ ...student, address: value });
        }
    };

    const handleNotesChange = (e) => {
        const value = sanitizeText(e.target.value);
        const textWithoutSpaces = value.replace(/\s/g, '');
        
        // Limita a 700 caracteres (sem contar espaços)
        if (textWithoutSpaces.length <= 700) {
            setStudent({ ...student, notes: value });
        }
    };

    const formatCEP = (cep) => {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length <= 8) {
            if (cleanCEP.length === 8) {
                return cleanCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2');
            }
            return cleanCEP;
        }
        return cep.substring(0, 9); // Limita ao formato XXXXX-XXX
    };

    const handleCEPChange = async (e) => {
        const cepValue = e.target.value;
        const formattedCEP = formatCEP(cepValue);
        
        setStudent({ ...student, cep: formattedCEP });
        
        const cleanCEP = cepValue.replace(/\D/g, '');
        
        // Se o CEP tiver 8 dígitos, busca na API ViaCEP
        if (cleanCEP.length === 8) {
            setLoadingCep(true);
            setCepError("");
            
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
                const data = await response.json();
                
                if (data.erro) {
                    setCepError(language === "english" ? "CEP not found" : "CEP não encontrado");
                } else {
                    // Preenche automaticamente os campos
                    setStudent(prev => ({
                        ...prev,
                        cep: formattedCEP,
                        address: data.logradouro || prev.address,
                        neighborhood: data.bairro || prev.neighborhood,
                        // Você pode adicionar cidade/estado se tiver esses campos
                    }));
                    setCepError("");
                }
            } catch (error) {
                setCepError(language === "english" ? "Error searching CEP" : "Erro ao buscar CEP");
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const formatCPF = (cpfNumber) => {
        const cleanCPF = cpfNumber.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        if (cleanCPF.length > 11) {
            return cpfNumber.substring(0, 14);
        }
        
        // Formata em tempo real conforme digita
        if (cleanCPF.length <= 3) {
            return cleanCPF;
        } else if (cleanCPF.length <= 6) {
            // XXX.XXX
            return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
        } else if (cleanCPF.length <= 9) {
            // XXX.XXX.XXX
            return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
        } else {
            // XXX.XXX.XXX-XX
            return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`;
        }
    };

    const formatRG = (rg) => {
        const cleanRG = rg.replace(/\D/g, '');
        if (cleanRG.length > 11) {
            return rg.substring(0, 14); // Limita a 11 dígitos com formatação
        }
        if (cleanRG.length >= 8) {
            return cleanRG.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3-$4');
        }
        return cleanRG;
    };

    const handleCPFChange = (e) => {
        const cpfValue = e.target.value;
        const formattedCPF = formatCPF(cpfValue);
        
        setStudent({ ...student, CPF: formattedCPF });
        
        if (cpfValue && !validateCPF(cpfValue)) {
            setCpfError("CPF inválido");
        } else {
            setCpfError("");
        }
    };

    const handleRGChange = (e) => {
        const rgValue = e.target.value;
        const formattedRG = formatRG(rgValue);
        
        setStudent({ ...student, RG: formattedRG });
        
        if (rgValue && !validateRG(rgValue)) {
            setRgError("RG inválido.");
        } else {
            setRgError("");
        }
    };

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setStudent({ ...student, email: emailValue });
        
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

    const handleBirthDate = (e) => {
        const birthDate = StringToDate(e.target.value);
        const res = validadeAge(birthDate);

        if(typeof res != "number"){
            setAgeError(res.message);
            setChildAge("");
        } else if (res > 120) {
            setAgeError(language === "english" ? "Age cannot exceed 120 years" : "Idade não pode exceder 120 anos");
            setChildAge("");
        } else {
            setAgeError("");
            setStudent({ ...student, birth_date: birthDate});
            setChildAge(res);
        }
    }

    const handleCreate = async () => {
        if (!validateCPF(student.CPF)) {
            setCpfError("CPF inválido");
            return;
        }
        
        if (student.RG && !validateRG(student.RG)) {
            setRgError("RG inválido");
            return;
        }

        if (!validatePhoneNumber(student.phone)) {
            setPhoneError("Telefone principal inválido");
            return;
        }
        
        if (student.second_phone && !validatePhoneNumber(student.second_phone)) {
            setSecondPhoneError("Telefone secundário inválido");
            return;
        }
        
        if (student.birth_date >= (new Date(Date.now()))) {
            setAgeError("Erro da Data de nascimento");
            return;
        }

        if (student.email) {
            const emailValidation = validateEmail(student.email);
            if (!emailValidation.isValid) {
                setEmailError(emailValidation.message);
                return;
            }
        }

        showConfirmation({
            type: 'edit',
            title: language === "english" ? "Edit Student" : "Editar Aluno",
            message: language === "english" 
              ? `Do you want to edit student "${student?.name}"?`
              : `Deseja editar o aluno "${student?.name}"?`,
            confirmText: language === "english" ? "Edit" : "Editar",
            onConfirm: async () => {
                if (id) {
                    await API.put(`/students/${id}`, student);
                } else {
                    console.log(student)
                    await API.post("/students", student);
                }
                navigate("/students");
            }
        });

    };

    return (
        <div className="student-form-container">
            <form
                id="studentForm"
                className="student-form" 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                }}
            >
                <div className="form-header">
                    <button onClick={() => navigate("/students")} className="transparent-button back-button">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            >
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                        </svg>
                    </button>
                    <h2>{id 
                        ?  language === "english" ? "Edit Student" : "Editar Aluno"
                        : language === "english" ? "Create Student" : "Criar Aluno"
                    }
                    </h2>
                </div>

                <div className="form-group">
                <label htmlFor="name">{language === "english" ? "Name" : "Nome"}</label>
                <input 
                    id="name"
                    type="text"
                    placeholder={language === "english" ? "Write the Student's Name" : "Digite o Nome do Aluno"}
                    value={student?.name}
                    onChange={handleNameChange}
                    required
                />
                {student?.name && !validateName(student.name) && (
                    <span className="error-message">
                        {language === "english" ? "Name must contain only letters and max 10 words" : "Nome deve conter apenas letras e no máximo 10 palavras"}
                    </span>
                )}
                </div>
                <div className="form-group">
                <label htmlFor="CPF">CPF</label>
                <input 
                    id="CPF"
                    type="text"
                    placeholder={language === "english" ? "Write the CPF" : "Digite o CPF"}
                    value={student.CPF}
                    onChange={handleCPFChange}
                />
                {cpfError && <span className="error-message">{cpfError}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="RG">RG</label>
                <input 
                    id="RG"
                    type="text"
                    placeholder={language === "english" ? "Write the RG" : "Digite o RG"}
                    value={student.RG}
                    onChange={handleRGChange}
                />
                {rgError && <span className="error-message">{rgError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="gender">{language === "english" ? "Gender" : "Sexo"}</label>
                    <div className="radio-group">
                        <input 
                            id="gender-male"
                            type="radio"
                            name="gender"
                            value="Masculino"
                            checked={student.gender === "Masculino"}
                            onChange={(e) => setStudent({ ...student, gender: e.target.value })}
                        />
                        <label htmlFor="gender-male">{language === "english" ? "Male" : "Masculino"}</label>
                        <input 
                            id="gender-female"
                            type="radio"
                            name="gender"
                            value="Feminino"
                            checked={student.gender === "Feminino"}
                            onChange={(e) => setStudent({ ...student, gender: e.target.value })}
                        />
                        <label htmlFor="gender-female">{language === "english" ? "Female" : "Feminino"}</label>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="birth_date">{language === "english" ? "Birth Date" : "Data de Nascimento"}</label>
                    <div className="dob-wrapper">
                        <input 
                            id="birth_date"
                            className="dob-input"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                            value={dateToString(student.birth_date)}
                            onChange={handleBirthDate}
                        />
                        <button
                            type="button"
                            className="calendar-button"
                            aria-label={language === "english" ? "Open calendar" : "Abrir calendário"}
                            onClick={() => {
                                const el = document.getElementById('birth_date');
                                if (el) el.showPicker ? el.showPicker() : el.focus();
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 10h5v5H7z"/><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 17H5V9h14v12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="birth_date">{language === "english" ? "Child's age: " : "Idade Da Criança: "} {childAge}</label>
                    {ageError && <span className="error-message">{ageError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="neighborhood">{language === "english" ? "Neighborhood" : "Bairro"}</label>
                    <input 
                        id="neighborhood"
                        type="text"
                        placeholder={language === "english" ? "Write the neighborhood" : "Digite o Bairro"}
                        value={student.neighborhood}
                        onChange={handleNeighborhoodChange}
                    />
                    {student.neighborhood && !validateFreeText(student.neighborhood) && (
                        <span className="error-message">
                            {language === "english" 
                                ? "Invalid text (max 150 characters, no special code characters)" 
                                : "Texto inválido (máx 150 caracteres, sem caracteres especiais de código)"}
                        </span>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="skin_color">{language === "english" ? "Skin Color" : "Cor da Pele"}</label>
                    <select 
                        id="skin_color"
                        value={student.skin_color}
                        onChange={(e) => setStudent({ ...student, skin_color: e.target.value })}
                    >
                        <option value="">{language === "english" ? "Select skin color" : "Selecione a cor da pele"}</option>
                        <option value="Branca">{language === "english" ? "White" : "Branca"}</option>
                        <option value="Preta">{language === "english" ? "Black" : "Preta"}</option>
                        <option value="Parda">{language === "english" ? "Brown" : "Parda"}</option>
                        <option value="Amarela">{language === "english" ? "Yellow" : "Amarela"}</option>
                        <option value="Indígena">{language === "english" ? "Indigenous" : "Indígena"}</option>
                        <option value="Não informado">{language === "english" ? "Not informed" : "Não informado"}</option>
                        <option value="Prefiro não declarar">{language === "english" ? "Prefer not to say" : "Prefiro não declarar"}</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email para Contato</label>
                    <input 
                        id="email"
                        type="text"
                        placeholder={language === "english" ? "Write the Email Address to contact" : "Digite o Email para contato"}
                        value={student.email}
                        onChange={handleEmailChange}
                    />
                    {emailError && <span className="error-message">{emailError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="phone">{language === "english" ? "Phone Number" : "Telefone"}</label>
                    <input 
                        id="phone"
                        type="text"
                        placeholder={language === "english" ? "Write the Phone Number" : "Digite o Telefone"}
                        value={student.phone}
                        onChange={(e) => handlePhoneChange(e, false)}
                    />
                    {phoneError && <span className="error-message">{phoneError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="second_phone">{language === "english" ? "Secondary Phone Number" : "Telefone Secundario"}</label>
                    <input 
                        id="second_phone"
                        type="text"
                        placeholder={language === "english" ? "Write the Phone Number" : "Digite o Telefone"}
                        value={student.second_phone}
                        onChange={(e) => handlePhoneChange(e, true)}
                    />
                    {secondPhoneError && <span className="error-message">{secondPhoneError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="is_on_school">{language === "english" ? "Is on School Actually?" : "Esta na Escola Atualmente?"}</label>
                    <div className="radio-group">
                        <input 
                            id="is-school"
                            type="radio"
                            name="No"
                            value="false"
                            checked={student.is_on_school === false || student.is_on_school === "false"}
                            onChange={(e) => setStudent({ ...student, is_on_school: e.target.value })}
                        />
                        <label htmlFor="isnt-school">{language === "english" ? "No" : "Não"}</label>
                        <input 
                            id="isnt-school"
                            type="radio"
                            name="Yes"
                            value="true"
                            checked={student.is_on_school === true || student.is_on_school === "true"}
                            onChange={(e) => setStudent({ ...student, is_on_school: e.target.value })}
                        />
                        <label htmlFor="isnt-school">{language === "english" ? "Yes" : "Sim"}</label>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="school_year">{language === "english" ? "School Year" : "Ano Escolar"}</label>
                    <input 
                        id="school_year"
                        type="text"
                        placeholder={language === "english" ? "Write the school year" : "Digite o ano escolar"}
                        value={student.school_year}
                        onChange={(e) => {
                            const value = sanitizeText(e.target.value);
                            // Limita a 80 caracteres
                            if (value.length <= 80) {
                                setStudent({ ...student, school_year: value });
                            }
                        }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="school_name">{language === "english" ? "School Name" : "Nome da Escola"}</label>
                    <input 
                        id="school_name"
                        type="text"
                        placeholder={language === "english" ? "Write the School's Name" : "Digite o Nome da Escola"}
                        value={student.school_name}
                        onChange={(e) => {
                            const value = sanitizeText(e.target.value);
                            // Limita a 80 caracteres
                            if (value.length <= 80) {
                                setStudent({ ...student, school_name: value });
                            }
                        }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="school_period">{language === "english" ? "School Period" : "Período Escolar"}</label>
                    <input 
                        id="school_period"
                        type="text"
                        placeholder={language === "english" ? "Write the School's period" : "Digite o Período escolar"}
                        value={student.school_period}
                        onChange={(e) => {
                            const value = sanitizeText(e.target.value);
                            // Limita a 80 caracteres
                            if (value.length <= 80) {
                                setStudent({ ...student, school_period: value });
                            }
                        }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cep">CEP</label>
                    <input 
                        id="cep"
                        type="text"
                        placeholder={language === "english" ? "Write the CEP (auto-fills address)" : "Digite o CEP (preenche endereço automaticamente)"}
                        value={student.cep}
                        onChange={handleCEPChange}
                    />
                    {loadingCep && <span className="info-message">{language === "english" ? "Searching CEP..." : "Buscando CEP..."}</span>}
                    {cepError && <span className="error-message">{cepError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="address">{language === "english" ? "Address" : "Endereço"}</label>
                    <input 
                        id="address"
                        type="text"
                        placeholder={language === "english" ? "Write the address" : "Digite o endereço"}
                        value={student.address}
                        onChange={handleAddressChange}
                    />
                    {student.address && !validateFreeText(student.address) && (
                        <span className="error-message">
                            {language === "english" 
                                ? "Invalid text (max 150 characters, no special code characters)" 
                                : "Texto inválido (máx 150 caracteres, sem caracteres especiais de código)"}
                        </span>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="notes">{language === "english" ? "Additional Notes" : "Informações Adicionais"}</label>
                    <textarea 
                        id="notes"
                        rows="4"
                        placeholder={language === "english" ? "Write additional notes" : "Digite as Informações Adicionais"}
                        value={student.notes}
                        onChange={handleNotesChange}
                    />
                    {student.notes && !validateFreeText(student.notes, 700) && (
                        <span className="error-message">
                            {language === "english" 
                                ? "Invalid text (no special code characters)" 
                                : "Texto inválido (sem caracteres especiais de código)"}
                        </span>
                    )}
                </div>
                <button type="submit" className="add-student-button">
                    {id 
                    ? language === "english" ? "Save changes" : "Salvar Alterações"
                    : language === "english" ? "Create Student" : "Criar Aluno"
                    }
                </button>
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
};