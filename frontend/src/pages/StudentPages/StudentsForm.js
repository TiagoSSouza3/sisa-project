import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { cpf } from "cpf-cnpj-validator";
import { useLanguage } from '../../components/LanguageContext';

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
        birth_date: Date,
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
        } catch (err) {
            console.error("Erro ao buscar aluno:", err);
            navigate("/students");
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
        
        if (cleanRG.length < 8 || cleanRG.length > 14) {
            return false;
        }
        
        return true;
    };

    const formatCPF = (cpfNumber) => {
        const cleanCPF = cpfNumber.replace(/\D/g, '');
        if (cleanCPF.length === 11) {
            return cpf.format(cleanCPF);
        }
        return cpfNumber;
    };

    const formatRG = (rg) => {
        const cleanRG = rg.replace(/\D/g, '');
        if (cleanRG.length >= 8) {
            return cleanRG.replace(/^(\d{2})(\d{3})(\d{3})(\d{1}|X).*/, '$1.$2.$3-$4');
        }
        return rg;
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
            setRgError("RG inválido. Deve conter entre 8 e 14 caracteres.");
        } else {
            setRgError("");
        }
    };

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

        try {
            if (id) {
                await API.put(`/students/${id}`, student);
            } else {
                console.log(student)
                await API.post("/students", student);
            }
            navigate("/students");
        } catch (err) {
            console.error("Erro ao salvar aluno:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        }
    };

    return (
        <div className="student-form-container">
            <button onClick={() => navigate("/students")} className="transparent-button">
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
            <form
                id="studentForm"
                className="student-form" 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                }}
            >
                <h3>{id 
                    ?  language === "english" ? "Edit Student" : "Editar Aluno"
                    : language === "english" ? "Create Student" : "Criar Aluno"
                }
                </h3>

                <div className="form-group">
                <label htmlFor="name">{language === "english" ? "Name" : "Nome"}</label>
                <input 
                    id="name"
                    type="text"
                    placeholder={language === "english" ? "Write the Student's Name" : "Digite o Nome do Aluno"}
                    value={student?.name}
                    onChange={(e) => setStudent({ ...student, name: e.target.value })}
                    required
                />
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
                <label htmlFor="skin_color">{language === "english" ? "Skin Color" : "Cor Da Pele"}</label>
                <input 
                    id="skin_color"
                    type="text"
                    placeholder={language === "english" ? "Write the Student's Skin Color" : "Digite a cor da pele"}
                    value={student.skin_color}
                    onChange={(e) => setStudent({ ...student, skin_color: e.target.value })}
                />
                </div>
                <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
                    placeholder={language === "english" ? "Write the Email Address" : "Digite o Email"}
                    value={student.email}
                    onChange={(e) => setStudent({ ...student, email: e.target.value })}
                />
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
                <button type="submit" className="add-student-button">
                    {id 
                    ? language === "english" ? "Save changes" : "Salvar Alterações"
                    : language === "english" ? "Create Student" : "Criar Aluno"
                    }
                </button>
            </form>
        </div>
    );
};