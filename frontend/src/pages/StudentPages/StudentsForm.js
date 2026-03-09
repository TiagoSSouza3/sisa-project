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
    const [emailError, setEmailError] = useState("");
    const [childAge, setChildAge] = useState("");
    const [ageError, setAgeError] = useState("");
    const [cepError, setCepError] = useState("");
    const [loadingCep, setLoadingCep] = useState(false);
    const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
    
    // Estados para parentes
    const [parents, setParents] = useState({
        parent1: null, // Primeiro pai
        parent2: null, // Segundo pai
        responsible: null // Responsável (obrigatório)
    });
    const [parentErrors, setParentErrors] = useState({
        parent1: {},
        parent2: {},
        responsible: {}
    });
    const [parentSearchResults, setParentSearchResults] = useState({
        parent1: [],
        parent2: [],
        responsible: []
    });
    const [parentSearchLoading, setParentSearchLoading] = useState({
        parent1: false,
        parent2: false,
        responsible: false
    });
    const [parentSearchTerms, setParentSearchTerms] = useState({
        parent1: "",
        parent2: "",
        responsible: ""
    });
    const [parentModified, setParentModified] = useState({
        parent1: false,
        parent2: false,
        responsible: false
    });
    const [showParent2, setShowParent2] = useState(false);

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
        address_number: "",
        neighborhood: "",
        cep: "",
        notes: "",
        active: false,
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
            const studentData = response.data;
            
            // Separar endereço e número se o endereço contiver vírgula e número
            let address = studentData.address || "";
            let address_number = "";
            
            if (address) {
                // Tenta separar endereço e número (formato: "Rua Exemplo, 123")
                const addressMatch = address.match(/^(.+?),\s*(\d+.*)$/);
                if (addressMatch) {
                    address = addressMatch[1].trim();
                    address_number = addressMatch[2].trim();
                }
            }
            
            setStudent({
                ...studentData,
                address: address,
                address_number: address_number
            });
            setChildAge(validadeAge(studentData.birth_date));
            
            // Carregar parentes se existirem
            if (studentData.parent) {
                setParents(prev => ({ ...prev, parent1: studentData.parent }));
                setParentSearchTerms(prev => ({ ...prev, parent1: studentData.parent.name || "" }));
            } else {
                // Inicializar parent1 vazio para sempre mostrar campos
                setParents(prev => ({ 
                    ...prev, 
                    parent1: {
                        name: "",
                        birth_date: "",
                        RG: "",
                        CPF: "",
                        occupation: "",
                        phone: "",
                        degree_of_kinship: ""
                    }
                }));
            }
            if (studentData.second_parent) {
                setParents(prev => ({ ...prev, parent2: studentData.second_parent }));
                setParentSearchTerms(prev => ({ ...prev, parent2: studentData.second_parent.name || "" }));
                setShowParent2(true);
            }
            if (studentData.responsible_parent) {
                setParents(prev => ({ ...prev, responsible: studentData.responsible_parent }));
                setParentSearchTerms(prev => ({ ...prev, responsible: studentData.responsible_parent.name || "" }));
            }
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
        if (!cpfNumber) return true;
        
        const cleanCPF = cpfNumber.replace(/\D/g, '');
        
        // Se não tiver 11 dígitos, ainda está digitando (não é inválido ainda)
        if (cleanCPF.length < 11) {
            return true;
        }
        
        // Se tiver mais de 11 dígitos, é inválido
        if (cleanCPF.length > 11) {
            return false;
        }
        
        // Valida apenas quando tiver 11 dígitos completos
        return cpf.isValid(cleanCPF);
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
                        // Mantém o número se já existir
                        address_number: prev.address_number || "",
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

    const handleCPFChange = (e) => {
        const cpfValue = e.target.value;
        const formattedCPF = formatCPF(cpfValue);
        
        setStudent({ ...student, CPF: formattedCPF });
        
        // Valida apenas quando o CPF estiver completo (11 dígitos)
        const cleanCPF = cpfValue.replace(/\D/g, '');
        if (cleanCPF.length === 11 && !validateCPF(cpfValue)) {
            setCpfError("CPF inválido");
        } else {
            setCpfError("");
        }
    };

    const handleRGChange = (e) => {
        const rgValue = e.target.value;
        
        setStudent({ ...student, RG: rgValue });
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

    // Funções para gerenciar parentes
    const searchParentsDebounce = (() => {
        let timeout;
        return (searchTerm, parentType) => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                if (searchTerm && searchTerm.trim().length >= 2) {
                    setParentSearchLoading(prev => ({ ...prev, [parentType]: true }));
                    try {
                        const response = await API.get(`/parents/search?name=${encodeURIComponent(searchTerm)}`);
                        setParentSearchResults(prev => ({ ...prev, [parentType]: response.data }));
                    } catch (err) {
                        console.error("Erro ao buscar parentes:", err);
                        setParentSearchResults(prev => ({ ...prev, [parentType]: [] }));
                    } finally {
                        setParentSearchLoading(prev => ({ ...prev, [parentType]: false }));
                    }
                } else {
                    setParentSearchResults(prev => ({ ...prev, [parentType]: [] }));
                }
            }, 300);
        };
    })();

    const handleParentNameChange = (e, parentType) => {
        const value = e.target.value;
        setParentSearchTerms(prev => ({ ...prev, [parentType]: value }));
        
        // Atualiza o nome no parent também (se o parent existe)
        if (parents[parentType]) {
            const updatedParent = { ...parents[parentType], name: value };
            setParents(prev => ({ ...prev, [parentType]: updatedParent }));
            setParentModified(prev => ({ ...prev, [parentType]: true }));
        } else {
            // Se não existe, cria um novo parent vazio
            const newParent = {
                name: value,
                birth_date: "",
                RG: "",
                CPF: "",
                occupation: "",
                phone: "",
                degree_of_kinship: ""
            };
            setParents(prev => ({ ...prev, [parentType]: newParent }));
        }
        
        // Busca quando o usuário digita
        if (value && value.trim().length >= 2) {
            searchParentsDebounce(value, parentType);
        } else {
            setParentSearchResults(prev => ({ ...prev, [parentType]: [] }));
        }
    };

    const handleSelectParent = (parent, parentType) => {
        setParents(prev => ({ ...prev, [parentType]: parent }));
        setParentSearchTerms(prev => ({ ...prev, [parentType]: parent.name }));
        setParentSearchResults(prev => ({ ...prev, [parentType]: [] }));
        setParentModified(prev => ({ ...prev, [parentType]: false }));
        setParentErrors(prev => ({ ...prev, [parentType]: {} }));
    };

    const handleParentFieldChange = (field, value, parentType) => {
        const currentParent = parents[parentType];
        if (!currentParent) return;
        
        const updatedParent = { ...currentParent, [field]: value };
        setParents(prev => ({ ...prev, [parentType]: updatedParent }));
        setParentModified(prev => ({ ...prev, [parentType]: true }));
        
        // Validações em tempo real
        const currentErrors = parentErrors[parentType] || {};
        const errors = { ...currentErrors };
        
        if (field === 'CPF') {
            if (!value || !value.trim()) {
                // Se o campo estiver vazio, remove o erro de CPF
                delete errors.CPF;
            } else {
                const cleanCPF = value.replace(/\D/g, '');
                // Valida apenas quando o CPF estiver completo (11 dígitos)
                if (cleanCPF.length === 11) {
                    if (!validateCPF(value)) {
                        errors.CPF = "CPF inválido";
                    } else {
                        // Limpa o erro se o CPF for válido
                        delete errors.CPF;
                    }
                } else if (cleanCPF.length > 11) {
                    errors.CPF = "CPF inválido";
                } else {
                    // Limpa o erro enquanto está digitando (menos de 11 dígitos)
                    delete errors.CPF;
                }
            }
        }
        
        if (field === 'phone') {
            if (!value || !value.trim()) {
                delete errors.phone;
            } else if (!validatePhoneNumber(value)) {
                errors.phone = "Telefone inválido";
            } else {
                delete errors.phone;
            }
        }
        
        setParentErrors(prev => ({ 
            ...prev, 
            [parentType]: errors
        }));
    };

    const validateParent = (parent, parentType) => {
        const errors = {};
        
        if (!parent.name || !parent.name.trim()) {
            errors.name = language === "english" ? "Name is required" : "Nome é obrigatório";
        }
        if (!parent.birth_date) {
            errors.birth_date = language === "english" ? "Birth date is required" : "Data de nascimento é obrigatória";
        }
        if (!parent.CPF || !parent.CPF.trim()) {
            errors.CPF = language === "english" ? "CPF is required" : "CPF é obrigatório";
        } else {
            const cleanCPF = parent.CPF.replace(/\D/g, '');
            if (cleanCPF.length === 11 && !validateCPF(parent.CPF)) {
                errors.CPF = "CPF inválido";
            } else if (cleanCPF.length > 0 && cleanCPF.length < 11) {
                errors.CPF = language === "english" ? "CPF must have 11 digits" : "CPF deve ter 11 dígitos";
            }
        }
        if (!parent.degree_of_kinship || !parent.degree_of_kinship.trim()) {
            errors.degree_of_kinship = language === "english" ? "Degree of kinship is required" : "Grau de parentesco é obrigatório";
        }
        if (parent.phone && !validatePhoneNumber(parent.phone)) {
            errors.phone = "Telefone inválido";
        }
        
        return errors;
    };

    const handleSaveParent = async (parentType) => {
        const parent = parents[parentType];
        if (!parent) return null;
        
        const errors = validateParent(parent, parentType);
        if (Object.keys(errors).length > 0) {
            setParentErrors(prev => ({ ...prev, [parentType]: errors }));
            return null;
        }
        
        try {
            let savedParent;
            if (parent.id) {
                // Atualizar parent existente
                const response = await API.put(`/parents/${parent.id}`, parent);
                savedParent = response.data;
            } else {
                // Criar novo parent
                const response = await API.post("/parents", parent);
                savedParent = response.data;
            }
            
            setParents(prev => ({ ...prev, [parentType]: savedParent }));
            setParentModified(prev => ({ ...prev, [parentType]: false }));
            setParentErrors(prev => ({ ...prev, [parentType]: {} }));
            return savedParent;
        } catch (err) {
            console.error("Erro ao salvar parent:", err);
            setParentErrors(prev => ({ 
                ...prev, 
                [parentType]: { 
                    ...prev[parentType], 
                    save: language === "english" ? "Error saving parent" : "Erro ao salvar parente" 
                } 
            }));
            return null;
        }
    };

    const handleAddNewParent = (parentType) => {
        const newParent = {
            name: "",
            birth_date: "",
            RG: "",
            CPF: "",
            occupation: "",
            phone: "",
            degree_of_kinship: ""
        };
        setParents(prev => ({ ...prev, [parentType]: newParent }));
        setParentSearchTerms(prev => ({ ...prev, [parentType]: "" }));
        setParentSearchResults(prev => ({ ...prev, [parentType]: [] }));
        setParentModified(prev => ({ ...prev, [parentType]: false }));
        setParentErrors(prev => ({ ...prev, [parentType]: {} }));
        if (parentType === 'parent2') {
            setShowParent2(true);
        }
    };
    
    // Inicializar parent1 quando componente carrega
    useEffect(() => {
        if (!parents.parent1) {
            setParents(prev => ({ 
                ...prev, 
                parent1: {
                    name: "",
                    birth_date: "",
                    RG: "",
                    CPF: "",
                    occupation: "",
                    phone: "",
                    degree_of_kinship: ""
                }
            }));
        }
    }, []);

    const handleRemoveParent = (parentType) => {
        setParents(prev => ({ ...prev, [parentType]: null }));
        setParentSearchTerms(prev => ({ ...prev, [parentType]: "" }));
        setParentSearchResults(prev => ({ ...prev, [parentType]: [] }));
        setParentModified(prev => ({ ...prev, [parentType]: false }));
        setParentErrors(prev => ({ ...prev, [parentType]: {} }));
    };

    const handleCreate = async () => {
        // Validar responsável (obrigatório)
        if (!parents.responsible) {
            setParentErrors(prev => ({ 
                ...prev, 
                responsible: { 
                    ...prev.responsible, 
                    required: language === "english" ? "Responsible parent is required" : "Responsável é obrigatório" 
                } 
            }));
            return;
        }
        
        // Validar todos os parentes
        const responsibleErrors = validateParent(parents.responsible, 'responsible');
        if (Object.keys(responsibleErrors).length > 0) {
            setParentErrors(prev => ({ ...prev, responsible: responsibleErrors }));
            return;
        }
        
        if (parents.parent1) {
            const parent1Errors = validateParent(parents.parent1, 'parent1');
            if (Object.keys(parent1Errors).length > 0) {
                setParentErrors(prev => ({ ...prev, parent1: parent1Errors }));
                return;
            }
        }
        
        if (parents.parent2) {
            const parent2Errors = validateParent(parents.parent2, 'parent2');
            if (Object.keys(parent2Errors).length > 0) {
                setParentErrors(prev => ({ ...prev, parent2: parent2Errors }));
                return;
            }
        }
        
        // Salvar parentes modificados antes de salvar o aluno
        try {
            // Salvar responsável
            let responsibleParentId = null;
            if (parentModified.responsible || !parents.responsible.id) {
                const response = parents.responsible.id 
                    ? await API.put(`/parents/${parents.responsible.id}`, parents.responsible)
                    : await API.post("/parents", parents.responsible);
                responsibleParentId = response.data.id;
            } else {
                responsibleParentId = parents.responsible.id;
            }
            
            // Salvar parent1 - verifica se existe pelo nome primeiro
            let parent1Id = null;
            if (parents.parent1 && parents.parent1.name && parents.parent1.name.trim()) {
                // Busca se já existe um parent com esse nome
                try {
                    const searchResponse = await API.get(`/parents/search?name=${encodeURIComponent(parents.parent1.name.trim())}`);
                    const existingParent = searchResponse.data.find(p => 
                        p.name.trim().toLowerCase() === parents.parent1.name.trim().toLowerCase()
                    );
                    
                    if (existingParent) {
                        // Se existe, apenas associa o ID
                        parent1Id = existingParent.id;
                    } else {
                        // Se não existe, cria novo
                        const response = await API.post("/parents", parents.parent1);
                        parent1Id = response.data.id;
                    }
                } catch (err) {
                    // Se erro na busca, cria novo
                    const response = await API.post("/parents", parents.parent1);
                    parent1Id = response.data.id;
                }
            }
            
            // Salvar parent2 se existir
            let parent2Id = null;
            if (parents.parent2 && parents.parent2.name && parents.parent2.name.trim()) {
                // Busca se já existe um parent com esse nome
                try {
                    const searchResponse = await API.get(`/parents/search?name=${encodeURIComponent(parents.parent2.name.trim())}`);
                    const existingParent = searchResponse.data.find(p => 
                        p.name.trim().toLowerCase() === parents.parent2.name.trim().toLowerCase()
                    );
                    
                    if (existingParent) {
                        // Se existe, apenas associa o ID
                        parent2Id = existingParent.id;
                    } else {
                        // Se não existe, cria novo
                        const response = parents.parent2.id 
                            ? await API.put(`/parents/${parents.parent2.id}`, parents.parent2)
                            : await API.post("/parents", parents.parent2);
                        parent2Id = response.data.id;
                    }
                } catch (err) {
                    // Se erro na busca, cria novo
                    const response = parents.parent2.id 
                        ? await API.put(`/parents/${parents.parent2.id}`, parents.parent2)
                        : await API.post("/parents", parents.parent2);
                    parent2Id = response.data.id;
                }
            }
            
            // Validar aluno
            if (student.CPF) {
                const cleanCPF = student.CPF.replace(/\D/g, '');
                if (cleanCPF.length === 11 && !validateCPF(student.CPF)) {
                    setCpfError("CPF inválido");
                    return;
                }
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

            // Preparar dados do aluno com IDs dos parentes
            // Concatena endereço com número se houver número
            const fullAddress = student.address_number 
                ? `${student.address}, ${student.address_number}`.trim()
                : student.address;
            
            const studentData = {
                ...student,
                address: fullAddress,
                parent_id: parent1Id,
                second_parent_id: parent2Id,
                responsible_parent_id: responsibleParentId
            };

            if(id){
                showConfirmation({
                    type: 'edit',
                    title: language === "english" ? "Edit Student" : "Editar Aluno",
                    message: language === "english" 
                      ? `Do you want to edit student "${student?.name}"?`
                      : `Deseja editar o aluno "${student?.name}"?`,
                    confirmText: language === "english" ? "Edit" : "Editar",
                    onConfirm: async () => {
                        await API.put(`/students/${id}`, studentData);
                        navigate("/students");
                    }
                });
            } else {
                await API.post("/students", studentData);
                navigate("/students");
            }
        } catch (err) {
            console.error("Erro ao salvar parentes:", err);
            alert(language === "english" ? "Error saving parents" : "Erro ao salvar parentes");
        }
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

                {/* Seção de Parentes */}
                <div className="parents-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
                    <h3 style={{ marginBottom: '20px' }}>{language === "english" ? "Parents/Guardians" : "Pais/Responsáveis"}</h3>
                    
                    {/* Responsável (Obrigatório) */}
                    <div className="parent-form-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '2px solid #e0e0e0', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--surface-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, fontWeight: 600, color: '#d32f2f' }}>
                                {language === "english" ? "Responsible Parent *" : "Responsável *"}
                            </h4>
                            {parents.responsible && (
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveParent('responsible')}
                                    className="cancel-button"
                                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                >
                                    {language === "english" ? "Remove" : "Remover"}
                                </button>
                            )}
                        </div>
                        
                        <div>
                            <div className="form-group">
                                <label>{language === "english" ? "Name *" : "Nome *"}</label>
                                <input
                                    type="text"
                                    placeholder={language === "english" ? "Type name to search or add new..." : "Digite o nome para buscar ou adicionar novo..."}
                                    value={parents.responsible?.name || parentSearchTerms.responsible || ''}
                                    onChange={(e) => handleParentNameChange(e, 'responsible')}
                                    required
                                />
                                {parentSearchLoading.responsible && <span className="info-message" style={{ fontSize: '0.9rem', color: '#666' }}>{language === "english" ? "Searching..." : "Buscando..."}</span>}
                                {parentSearchResults.responsible.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', border: '2px solid #e0e0e0', borderRadius: 'var(--border-radius)', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' }}>
                                        {parentSearchResults.responsible.map((parent) => (
                                            <div
                                                key={parent.id}
                                                onClick={() => handleSelectParent(parent, 'responsible')}
                                                style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                {parent.name} {parent.CPF && `- CPF: ${parent.CPF}`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {parentErrors.responsible.name && <span className="error-message">{parentErrors.responsible.name}</span>}
                            </div>
                            
                            
                            {(parents.responsible || parentSearchTerms.responsible) && (
                                <>
                                    <div className="form-group">
                                        <label>{language === "english" ? "Birth Date *" : "Data de Nascimento *"}</label>
                                        <input
                                            type="date"
                                            max={new Date().toISOString().split('T')[0]}
                                            value={parents.responsible?.birth_date ? dateToString(parents.responsible.birth_date) : ''}
                                            onChange={(e) => handleParentFieldChange('birth_date', StringToDate(e.target.value), 'responsible')}
                                            required
                                        />
                                        {parentErrors.responsible.birth_date && <span className="error-message">{parentErrors.responsible.birth_date}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>CPF *</label>
                                        <input
                                            type="text"
                                            value={parents.responsible?.CPF || ''}
                                            onChange={(e) => handleParentFieldChange('CPF', formatCPF(e.target.value), 'responsible')}
                                            required
                                        />
                                        {parentErrors.responsible.CPF && <span className="error-message">{parentErrors.responsible.CPF}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>RG</label>
                                        <input
                                            type="text"
                                            value={parents.responsible?.RG || ''}
                                            onChange={(e) => handleParentFieldChange('RG', e.target.value, 'responsible')}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{language === "english" ? "Degree of Kinship *" : "Grau de Parentesco *"}</label>
                                        <select
                                            value={parents.responsible?.degree_of_kinship || ''}
                                            onChange={(e) => handleParentFieldChange('degree_of_kinship', e.target.value, 'responsible')}
                                            required
                                        >
                                            <option value="">{language === "english" ? "Select degree of kinship" : "Selecione o grau de parentesco"}</option>
                                            <option value="Pai">{language === "english" ? "Father" : "Pai"}</option>
                                            <option value="Mãe">{language === "english" ? "Mother" : "Mãe"}</option>
                                            <option value="Avô">{language === "english" ? "Grandfather" : "Avô"}</option>
                                            <option value="Avó">{language === "english" ? "Grandmother" : "Avó"}</option>
                                            <option value="Tio">{language === "english" ? "Uncle" : "Tio"}</option>
                                            <option value="Tia">{language === "english" ? "Aunt" : "Tia"}</option>
                                            <option value="Padrasto">{language === "english" ? "Stepfather" : "Padrasto"}</option>
                                            <option value="Madrasta">{language === "english" ? "Stepmother" : "Madrasta"}</option>
                                            <option value="Responsável Legal">{language === "english" ? "Legal Guardian" : "Responsável Legal"}</option>
                                            <option value="Tutor">{language === "english" ? "Tutor" : "Tutor"}</option>
                                            <option value="Outro">{language === "english" ? "Other" : "Outro"}</option>
                                        </select>
                                        {parentErrors.responsible.degree_of_kinship && <span className="error-message">{parentErrors.responsible.degree_of_kinship}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>{language === "english" ? "Occupation" : "Ocupação"}</label>
                                        <input
                                            type="text"
                                            value={parents.responsible?.occupation || ''}
                                            onChange={(e) => handleParentFieldChange('occupation', e.target.value, 'responsible')}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{language === "english" ? "Phone" : "Telefone"}</label>
                                        <input
                                            type="text"
                                            value={parents.responsible?.phone || ''}
                                            onChange={(e) => handleParentFieldChange('phone', formatPhoneNumber(e.target.value), 'responsible')}
                                        />
                                        {parentErrors.responsible.phone && <span className="error-message">{parentErrors.responsible.phone}</span>}
                                    </div>
                                    {parentModified.responsible && parents.responsible?.id && (
                                        <button
                                            type="button"
                                            onClick={() => handleSaveParent('responsible')}
                                            className="add-student-button"
                                            style={{ width: 'auto', marginTop: '0.5rem', backgroundColor: 'var(--success-color)' }}
                                        >
                                            {language === "english" ? "Save Changes" : "Salvar Alterações"}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        {parentErrors.responsible.required && <span className="error-message">{parentErrors.responsible.required}</span>}
                    </div>

                    {/* Primeiro Pai - Sempre visível */}
                    {parents.parent1 && (
                        <div className="parent-form-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '2px solid #e0e0e0', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--surface-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontWeight: 600 }}>{language === "english" ? "Parent 1" : "Pai/Mãe 1"}</h4>
                            </div>
                            
                            <div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Name *" : "Nome *"}</label>
                                    <input
                                        type="text"
                                        placeholder={language === "english" ? "Type name to search or add new..." : "Digite o nome para buscar ou adicionar novo..."}
                                        value={parents.parent1.name || ''}
                                        onChange={(e) => handleParentNameChange(e, 'parent1')}
                                        required
                                    />
                                    {parentSearchLoading.parent1 && <span className="info-message" style={{ fontSize: '0.9rem', color: '#666' }}>{language === "english" ? "Searching..." : "Buscando..."}</span>}
                                    {parentSearchResults.parent1.length > 0 && (
                                        <div style={{ marginTop: '0.5rem', border: '2px solid #e0e0e0', borderRadius: 'var(--border-radius)', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' }}>
                                            {parentSearchResults.parent1.map((parent) => (
                                                <div
                                                    key={parent.id}
                                                    onClick={() => handleSelectParent(parent, 'parent1')}
                                                    style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                >
                                                    {parent.name} {parent.CPF && `- CPF: ${parent.CPF}`}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {parentErrors.parent1.name && <span className="error-message">{parentErrors.parent1.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Birth Date *" : "Data de Nascimento *"}</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        value={parents.parent1.birth_date ? dateToString(parents.parent1.birth_date) : ''}
                                        onChange={(e) => handleParentFieldChange('birth_date', StringToDate(e.target.value), 'parent1')}
                                        required
                                    />
                                    {parentErrors.parent1.birth_date && <span className="error-message">{parentErrors.parent1.birth_date}</span>}
                                </div>
                                <div className="form-group">
                                    <label>CPF *</label>
                                    <input
                                        type="text"
                                        value={parents.parent1.CPF || ''}
                                        onChange={(e) => handleParentFieldChange('CPF', formatCPF(e.target.value), 'parent1')}
                                        required
                                    />
                                    {parentErrors.parent1.CPF && <span className="error-message">{parentErrors.parent1.CPF}</span>}
                                </div>
                                <div className="form-group">
                                    <label>RG</label>
                                    <input
                                        type="text"
                                        value={parents.parent1.RG || ''}
                                        onChange={(e) => handleParentFieldChange('RG', e.target.value, 'parent1')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Degree of Kinship *" : "Grau de Parentesco *"}</label>
                                    <select
                                        value={parents.parent1.degree_of_kinship || ''}
                                        onChange={(e) => handleParentFieldChange('degree_of_kinship', e.target.value, 'parent1')}
                                        required
                                    >
                                        <option value="">{language === "english" ? "Select degree of kinship" : "Selecione o grau de parentesco"}</option>
                                        <option value="Pai">{language === "english" ? "Father" : "Pai"}</option>
                                        <option value="Mãe">{language === "english" ? "Mother" : "Mãe"}</option>
                                        <option value="Avô">{language === "english" ? "Grandfather" : "Avô"}</option>
                                        <option value="Avó">{language === "english" ? "Grandmother" : "Avó"}</option>
                                        <option value="Tio">{language === "english" ? "Uncle" : "Tio"}</option>
                                        <option value="Tia">{language === "english" ? "Aunt" : "Tia"}</option>
                                        <option value="Padrasto">{language === "english" ? "Stepfather" : "Padrasto"}</option>
                                        <option value="Madrasta">{language === "english" ? "Stepmother" : "Madrasta"}</option>
                                        <option value="Responsável Legal">{language === "english" ? "Legal Guardian" : "Responsável Legal"}</option>
                                        <option value="Tutor">{language === "english" ? "Tutor" : "Tutor"}</option>
                                        <option value="Outro">{language === "english" ? "Other" : "Outro"}</option>
                                    </select>
                                    {parentErrors.parent1.degree_of_kinship && <span className="error-message">{parentErrors.parent1.degree_of_kinship}</span>}
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Occupation" : "Ocupação"}</label>
                                    <input
                                        type="text"
                                        value={parents.parent1.occupation || ''}
                                        onChange={(e) => handleParentFieldChange('occupation', e.target.value, 'parent1')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Phone" : "Telefone"}</label>
                                    <input
                                        type="text"
                                        value={parents.parent1.phone || ''}
                                        onChange={(e) => handleParentFieldChange('phone', formatPhoneNumber(e.target.value), 'parent1')}
                                    />
                                    {parentErrors.parent1.phone && <span className="error-message">{parentErrors.parent1.phone}</span>}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Botão para adicionar segundo parente */}
                    {!showParent2 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button
                                type="button"
                                onClick={() => handleAddNewParent('parent2')}
                                className="add-student-button"
                                style={{ width: 'auto', padding: '0.8rem 1.5rem' }}
                            >
                                {language === "english" ? "+ Add Second Parent" : "+ Adicionar Segundo Pai/Mãe"}
                            </button>
                        </div>
                    )}

                    {/* Segundo Pai - Aparece apenas quando showParent2 é true */}
                    {showParent2 && parents.parent2 && (
                        <div className="parent-form-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '2px solid #e0e0e0', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--surface-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontWeight: 600 }}>{language === "english" ? "Parent 2" : "Pai/Mãe 2"}</h4>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        handleRemoveParent('parent2');
                                        setShowParent2(false);
                                    }}
                                    className="cancel-button"
                                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                >
                                    {language === "english" ? "Remove" : "Remover"}
                                </button>
                            </div>
                            
                            <div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Name *" : "Nome *"}</label>
                                    <input
                                        type="text"
                                        placeholder={language === "english" ? "Type name to search or add new..." : "Digite o nome para buscar ou adicionar novo..."}
                                        value={parents.parent2.name || ''}
                                        onChange={(e) => handleParentNameChange(e, 'parent2')}
                                        required
                                    />
                                    {parentSearchLoading.parent2 && <span className="info-message" style={{ fontSize: '0.9rem', color: '#666' }}>{language === "english" ? "Searching..." : "Buscando..."}</span>}
                                    {parentSearchResults.parent2.length > 0 && (
                                        <div style={{ marginTop: '0.5rem', border: '2px solid #e0e0e0', borderRadius: 'var(--border-radius)', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' }}>
                                            {parentSearchResults.parent2.map((parent) => (
                                                <div
                                                    key={parent.id}
                                                    onClick={() => handleSelectParent(parent, 'parent2')}
                                                    style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                >
                                                    {parent.name} {parent.CPF && `- CPF: ${parent.CPF}`}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {parentErrors.parent2.name && <span className="error-message">{parentErrors.parent2.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Birth Date *" : "Data de Nascimento *"}</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        value={parents.parent2.birth_date ? dateToString(parents.parent2.birth_date) : ''}
                                        onChange={(e) => handleParentFieldChange('birth_date', StringToDate(e.target.value), 'parent2')}
                                        required
                                    />
                                    {parentErrors.parent2.birth_date && <span className="error-message">{parentErrors.parent2.birth_date}</span>}
                                </div>
                                <div className="form-group">
                                    <label>CPF *</label>
                                    <input
                                        type="text"
                                        value={parents.parent2.CPF || ''}
                                        onChange={(e) => handleParentFieldChange('CPF', formatCPF(e.target.value), 'parent2')}
                                        required
                                    />
                                    {parentErrors.parent2.CPF && <span className="error-message">{parentErrors.parent2.CPF}</span>}
                                </div>
                                <div className="form-group">
                                    <label>RG</label>
                                    <input
                                        type="text"
                                        value={parents.parent2.RG || ''}
                                        onChange={(e) => handleParentFieldChange('RG', e.target.value, 'parent2')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Degree of Kinship *" : "Grau de Parentesco *"}</label>
                                    <select
                                        value={parents.parent2.degree_of_kinship || ''}
                                        onChange={(e) => handleParentFieldChange('degree_of_kinship', e.target.value, 'parent2')}
                                        required
                                    >
                                        <option value="">{language === "english" ? "Select degree of kinship" : "Selecione o grau de parentesco"}</option>
                                        <option value="Pai">{language === "english" ? "Father" : "Pai"}</option>
                                        <option value="Mãe">{language === "english" ? "Mother" : "Mãe"}</option>
                                        <option value="Avô">{language === "english" ? "Grandfather" : "Avô"}</option>
                                        <option value="Avó">{language === "english" ? "Grandmother" : "Avó"}</option>
                                        <option value="Tio">{language === "english" ? "Uncle" : "Tio"}</option>
                                        <option value="Tia">{language === "english" ? "Aunt" : "Tia"}</option>
                                        <option value="Padrasto">{language === "english" ? "Stepfather" : "Padrasto"}</option>
                                        <option value="Madrasta">{language === "english" ? "Stepmother" : "Madrasta"}</option>
                                        <option value="Responsável Legal">{language === "english" ? "Legal Guardian" : "Responsável Legal"}</option>
                                        <option value="Tutor">{language === "english" ? "Tutor" : "Tutor"}</option>
                                        <option value="Outro">{language === "english" ? "Other" : "Outro"}</option>
                                    </select>
                                    {parentErrors.parent2.degree_of_kinship && <span className="error-message">{parentErrors.parent2.degree_of_kinship}</span>}
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Occupation" : "Ocupação"}</label>
                                    <input
                                        type="text"
                                        value={parents.parent2.occupation || ''}
                                        onChange={(e) => handleParentFieldChange('occupation', e.target.value, 'parent2')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === "english" ? "Phone" : "Telefone"}</label>
                                    <input
                                        type="text"
                                        value={parents.parent2.phone || ''}
                                        onChange={(e) => handleParentFieldChange('phone', formatPhoneNumber(e.target.value), 'parent2')}
                                    />
                                    {parentErrors.parent2.phone && <span className="error-message">{parentErrors.parent2.phone}</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-group" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
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
                
                {(student.is_on_school === true || student.is_on_school === "true") && (
                    <>
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
                    </>
                )}
                <div className="form-group" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
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
                    <label htmlFor="address">{language === "english" ? "Address" : "Endereço"}</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <input 
                                id="address"
                                type="text"
                                placeholder={language === "english" ? "Street/Logradouro" : "Rua/Logradouro"}
                                value={student.address}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div style={{ width: '150px' }}>
                            <input 
                                id="address_number"
                                type="text"
                                placeholder={language === "english" ? "Number" : "Número"}
                                value={student.address_number || ''}
                                onChange={(e) => {
                                    const value = sanitizeText(e.target.value);
                                    // Limita a 20 caracteres para número
                                    if (value.length <= 20) {
                                        setStudent({ ...student, address_number: value });
                                    }
                                }}
                            />
                        </div>
                    </div>
                    {student.address && !validateFreeText(student.address) && (
                        <span className="error-message">
                            {language === "english" 
                                ? "Invalid text (max 150 characters, no special code characters)" 
                                : "Texto inválido (máx 150 caracteres, sem caracteres especiais de código)"}
                        </span>
                    )}
                </div>
                <div className="form-group" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
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