import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { cpf } from "cpf-cnpj-validator";

import '../styles/global.css';
import '../styles/students-creation.css';

export default function StudentsCreation() {
    const navigate = useNavigate();
    const [phoneError, setPhoneError] = useState("");
    const [secondPhoneError, setSecondPhoneError] = useState("");
    const [cpfError, setCpfError] = useState("");
    const [rgError, setRgError] = useState("");

    const [newStudent, setNewStudent] = useState({
        name: "",
        registration: "",
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
        active: true
      });

      useEffect(() => {
        loadStudents();
      }, []);

      const loadStudents = async () => {
        try {
          const res = await API.get("/students");
          setNewStudent(res.data);
        } catch (err) {
          console.error("Erro ao carregar alunos:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
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
            setNewStudent({ ...newStudent, second_phone: formattedPhone });
            if (phoneValue && !validatePhoneNumber(phoneValue)) {
                setSecondPhoneError("Telefone inválido. Use um número de telefone brasileiro válido.");
            } else {
                setSecondPhoneError("");
            }
        } else {
            setNewStudent({ ...newStudent, phone: formattedPhone });
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
        
        setNewStudent({ ...newStudent, CPF: formattedCPF });
        
        if (cpfValue && !validateCPF(cpfValue)) {
            setCpfError("CPF inválido");
        } else {
            setCpfError("");
        }
    };

    const handleRGChange = (e) => {
        const rgValue = e.target.value;
        const formattedRG = formatRG(rgValue);
        
        setNewStudent({ ...newStudent, RG: formattedRG });
        
        if (rgValue && !validateRG(rgValue)) {
            setRgError("RG inválido. Deve conter entre 8 e 14 caracteres.");
        } else {
            setRgError("");
        }
    };

    const handleCreate = async () => {
        if (!validateCPF(newStudent.CPF)) {
            setCpfError("CPF inválido");
            return;
        }
        
        if (newStudent.RG && !validateRG(newStudent.RG)) {
            setRgError("RG inválido");
            return;
        }

        if (!validatePhoneNumber(newStudent.phone)) {
            setPhoneError("Telefone principal inválido");
            return;
        }
        
        if (newStudent.second_phone && !validatePhoneNumber(newStudent.second_phone)) {
            setSecondPhoneError("Telefone secundário inválido");
            return;
        }

        try {
            await API.post("/students", newStudent);
            await loadStudents();
            setNewStudent({
                name: "",
                registration: "",
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
                active: true
            });
            navigate("/students");
        } catch (err) {
            console.error("Erro ao criar aluno:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        }
    };

    return (
        <div className="student-creation-container">
            <form
                id="studentForm"
                className="student-form" 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                }}
            >
                <h3>Adicionar Novo Aluno</h3>
                <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input 
                    id="name"
                    type="text"
                    placeholder="Digite o nome do aluno"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    required
                />
                </div>
                <div className="form-group">
                <label htmlFor="CPF">CPF</label>
                <input 
                    id="CPF"
                    type="text"
                    placeholder="Digite o CPF"
                    value={newStudent.CPF}
                    onChange={handleCPFChange}
                />
                {cpfError && <span className="error-message">{cpfError}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="RG">RG</label>
                <input 
                    id="RG"
                    type="text"
                    placeholder="Digite o RG"
                    value={newStudent.RG}
                    onChange={handleRGChange}
                />
                {rgError && <span className="error-message">{rgError}</span>}
                </div>
                <div className="form-group">
                <label htmlFor="gender">Sexo</label>
                <div className="radio-group">
                  <input 
                      id="gender-male"
                      type="radio"
                      name="gender"
                      value="Masculino"
                      checked={newStudent.gender === "Masculino"}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  />
                  <label htmlFor="gender-male">Masculino</label>
                  <input 
                      id="gender-female"
                      type="radio"
                      name="gender"
                      value="Feminino"
                      checked={newStudent.gender === "Feminino"}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  />
                  <label htmlFor="gender-female">Feminino</label>
                </div>
                </div>
                <div className="form-group">
                <label htmlFor="skin_color">Cor da pele</label>
                <input 
                    id="skin_color"
                    type="text"
                    placeholder="Digite a cor da pele"
                    value={newStudent.skin_color}
                    onChange={(e) => setNewStudent({ ...newStudent, skin_color: e.target.value })}
                />
                </div>
                <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
                    placeholder="Digite o email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Telefone</label>
                    <input 
                        id="phone"
                        type="text"
                        placeholder="Digite o telefone"
                        value={newStudent.phone}
                        onChange={(e) => handlePhoneChange(e, false)}
                    />
                    {phoneError && <span className="error-message">{phoneError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="second_phone">Telefone 2</label>
                    <input 
                        id="second_phone"
                        type="text"
                        placeholder="Digite o telefone"
                        value={newStudent.second_phone}
                        onChange={(e) => handlePhoneChange(e, true)}
                    />
                    {secondPhoneError && <span className="error-message">{secondPhoneError}</span>}
                </div>
                <button type="submit" className="add-student-button">Criar Aluno</button>
            </form>
        </div>
    );
};