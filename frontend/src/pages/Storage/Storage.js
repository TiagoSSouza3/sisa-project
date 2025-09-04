import { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/storage.css';

export default function Storage() {
    const { language } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        last_price: "",
        last_price_date: "",
        amount: ""
    });
    const [storage, setStorage] = useState([]);

    const loadStorage = async () => {
        try {
            const storage_res = await API.get(`/storage`);
            const storageWithAmount = storage_res.data.map((item) => ({
                ...item,
                amountToAdd: "",
                isEditingPrice: false,
                isEditingDate: false,
                editingPrice: null,
                editingDate: null
            }));
            setStorage(storageWithAmount);
        } catch (err) {
            console.log("Erro ao carregar estoque");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        loadStorage();
    }, []);

    const addAmount = (index, type) => {
        const item = storage[index];
        const amountToAdd = item.amountToAdd || 0;
        
        if (amountToAdd <= 0) {
            console.log("Quantidade deve ser maior que 0");
            return;
        }

        const newAmount = type === "plus" 
            ? item.amount + amountToAdd
            : item.amount - amountToAdd;
            
        if (newAmount < 0) {
            console.log("Quantidade não pode ser negativa");
            return;
        }

        const updatedItem = {
            ...item,
            amount: newAmount,
            amountToAdd: ""
        };

        saveStorage(updatedItem, index);
    }

    const saveStorage = async (item, index) => {
        try {
            const itemToSend = { ...item };
            delete itemToSend.amountToAdd;
            delete itemToSend.isEditingPrice;
            delete itemToSend.isEditingDate;
            delete itemToSend.editingPrice;
            delete itemToSend.editingDate;
            
            console.log("=== DEBUG saveStorage ===");
            console.log("Item original:", item);
            console.log("Item sendo enviado:", itemToSend);
            console.log("Index:", index);
            
            const res = await API.put(`/storage/${item.id}`, itemToSend);
            
            console.log("Resposta da API:", res);
            console.log("Status:", res.status);
            console.log("Dados retornados:", res.data);
            
            if (res.status === 200) {
                console.log("Sucesso! Atualizando estado local...");
                // Mantém os dados locais atualizados, apenas adiciona os campos de controle
                const updatedStorage = [...storage];
                updatedStorage[index] = {
                    ...updatedStorage[index], // Mantém os dados locais
                    amountToAdd: "",
                    isEditingPrice: false,
                    isEditingDate: false,
                    editingPrice: null,
                    editingDate: null
                };
                console.log("Estado final:", updatedStorage[index]);

                setStorage(updatedStorage);

                loadStorage()
            }
        } catch (error) {
            console.log("Erro ao salvar:", error);
        }
    }
    
    const handleInputChange = (e, index) => {
        let newValue = Number(e.target.value);
        
        if (newValue < 0) return;

        if (newValue === 0) newValue = "";

        const updatedStorage = [...storage];
        updatedStorage[index] = {
            ...updatedStorage[index],
            amountToAdd: newValue
        };

        setStorage(updatedStorage);
    };
    
    const handleNewStorageItem = async () => {
        await API.post("/storage", newItem);
        setNewItem({
            name: "",
            description: "",
            last_price: 0,
            last_price_date: "",
            amount: 0
        });
        loadStorage();
    };

    // Funções para edição inline do preço
    const startPriceEdit = (index) => {
        const updatedStorage = [...storage];
        updatedStorage[index] = {
            ...updatedStorage[index],
            isEditingPrice: true,
            editingPrice: updatedStorage[index].last_price
        };
        setStorage(updatedStorage);
    };

    const handlePriceEdit = (e, index) => {
        const value = e.target.value;
        const numValue = value === '' ? 0 : parseFloat(value);
        
        if (!isNaN(numValue) && numValue >= 0) {
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                editingPrice: numValue
            };
            setStorage(updatedStorage);
        }
    };

    const savePriceEdit = async (index) => {
        const item = storage[index];
        const newPrice = parseFloat(item.editingPrice) || 0;
        
        if (newPrice !== item.last_price) {
            const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD para o banco
            const updatedItem = {
                ...item,
                last_price: newPrice,
                last_price_date: today
            };
            
            // Atualiza o estado local ANTES de chamar saveStorage
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                last_price: newPrice,
                last_price_date: today,
                isEditingPrice: false,
                editingPrice: null
            };
            setStorage(updatedStorage);
            
            // Chama saveStorage para persistir no banco
            await saveStorage(updatedItem, index);
        } else {
            // Se não houve mudança, apenas remove o modo de edição
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                isEditingPrice: false,
                editingPrice: null
            };
            setStorage(updatedStorage);
        }
    };

    // Funções para edição inline da data
    const startDateEdit = (index) => {
        const updatedStorage = [...storage];
        updatedStorage[index] = {
            ...updatedStorage[index],
            isEditingDate: true,
            editingDate: updatedStorage[index].last_price_date
        };
        setStorage(updatedStorage);
    };

    const handleDateEdit = (e, index) => {
        const newDateValue = e.target.value;
        console.log("=== DEBUG handleDateEdit ===");
        console.log("Novo valor da data:", newDateValue);
        console.log("Index:", index);
        console.log("Item atual:", storage[index]);
        
        const updatedStorage = [...storage];
        updatedStorage[index] = {
            ...updatedStorage[index],
            editingDate: newDateValue
        };
        
        console.log("Item atualizado:", updatedStorage[index]);
        setStorage(updatedStorage);
    };

    const saveDateEdit = async (index) => {
        const item = storage[index];
        const newDate = item.editingDate || item.last_price_date;
        
        console.log("=== DEBUG saveDateEdit ===");
        console.log("Item atual:", item);
        console.log("newDate:", newDate);
        console.log("item.last_price_date:", item.last_price_date);
        console.log("São diferentes?", newDate !== item.last_price_date);
        
        if (newDate !== item.last_price_date) {
            console.log("Salvando nova data:", newDate);
            
            const updatedItem = {
                ...item,
                last_price_date: newDate
            };
            
            console.log("Item para enviar:", updatedItem);
            
            // Atualiza o estado local ANTES de chamar saveStorage
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                last_price_date: newDate,
                isEditingDate: false,
                editingDate: null
            };
            
            console.log("Estado local atualizado:", updatedStorage[index]);
            setStorage(updatedStorage);
            
            // Chama saveStorage para persistir no banco
            await saveStorage(updatedItem, index);
        } else {
            console.log("Nenhuma mudança detectada");
            // Se não houve mudança, apenas remove o modo de edição
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                isEditingDate: false,
                editingDate: null
            };
            setStorage(updatedStorage);
        }
    };

    // Função auxiliar para formatar preço no formato brasileiro
    const formatPrice = (price) => {
        if (price === null || price === undefined) return "R$0,00";
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return "R$0,00";
        return `R$${numPrice.toFixed(2).replace(".", ",")}`;
    };

    // Função auxiliar para formatar data no formato brasileiro DD/MM/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch (error) {
            return "N/A";
        }
    };

    return (
        <div className="storage-container">
            <div className="storage-header">
                <h2>{language === "english" ? "Storage" : "Estoque"}</h2>
                { isLoggedIn && localStorage.getItem("occupation_id") !== occupationEnum.professor && 
                    <button 
                        className="storage-log-button"
                        onClick={() => navigate("/storage_log")}
                    >
                        {language === "english" ? "Logs" : "Historico"}
                    </button>
                }
            </div>

            <div className="storage-items-list">
                <div className="storage-item">
                    <form
                        className="storage-form"
                        onSubmit={(e) => { 
                            e.preventDefault(); 
                            handleNewStorageItem(); 
                        }}
                    >
                        <div className="form-field">
                            <label htmlFor="name">{language === "english" ? "Name" : "Nome"}</label>
                            <input 
                                id="name"
                                type="text"
                                placeholder={language === "english" ? "Enter name" : "Digite o nome"}
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="description">{language === "english" ? "Description" : "Descrição"}</label>
                            <input 
                                id="description"
                                type="text"
                                placeholder={language === "english" ? "Enter description" : "Digite a descrição"}
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="last_price">{language === "english" ? "Last Price" : "Último Preço"}</label>
                            <input 
                                id="last_price"
                                type="number"
                                min="0"
                                placeholder={language === "english" ? "Enter price" : "Digite o preço"}
                                value={newItem.last_price}
                                onChange={(e) => setNewItem({ ...newItem, last_price: parseFloat(e.target.value) || 0 })}
                            />
                         </div>

                        <div className="form-field">
                            <label htmlFor="last_price_date">{language === "english" ? "Last Price Date" : "Data do Último Preço"}</label>
                            <input 
                                id="last_price_date"
                                type="date"
                                placeholder={language === "english" ? "Enter date" : "Digite a data"}
                                value={newItem.last_price_date}
                                onChange={(e) => setNewItem({ ...newItem, last_price_date: e.target.value })}
                            />
                         </div>

                        <div className="form-field">
                            <label htmlFor="amount">{language === "english" ? "Amount" : "Quantidade"}</label>
                            <input 
                                id="amount"
                                type="number"
                                min="0"
                                placeholder={language === "english" ? "Enter amount" : "Digite a quantidade"}
                                value={newItem.amount}
                                onChange={(e) => setNewItem({ ...newItem, amount: parseInt(e.target.value) || 0 })}
                            />  
                         </div>

                        <button 
                            className="create-item-button"
                            type="submit"
                        > 
                        {language === "english" ? "Create" : "Criar"}
                        </button>
                    </form>
                </div>
                <div className="storage-items-list-titles">
                    <h3>{language === "english" ? "Name" : "Nome"}</h3>
                    <h3>{language === "english" ? "Description" : "Descrição"}</h3>
                    <h3>{language === "english" ? "Last Price" : "Ultimo Preço"}</h3>
                    <h3>{language === "english" ? "Date Of Last Purchase " : "Data Da Ultima Compra"}</h3>
                    <h3>{language === "english" ? "Amount" : "Quantidade"}</h3>
                    <h3>{language === "english" ? "Amount to Add/remove" : "Quantidade de entrada/saida"}</h3>
                </div>
                {storage.map((item, index) => (
                    !!item ?
                    <div key={item.id} className="storage-item">
                        <div className="storage-item-info">
                            <h3 className="storage-item-title">{item.name}</h3>
                            <p className="storage-item-description">{item.description}</p>
                            <div className="storage-item-last-price">
                                {item.isEditingPrice ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="edit-price-input"
                                        value={item.editingPrice || item.last_price}
                                        onChange={(e) => handlePriceEdit(e, index)}
                                        onBlur={() => savePriceEdit(index)}
                                        onKeyPress={(e) => e.key === 'Enter' && savePriceEdit(index)}
                                        autoFocus
                                    />
                                ) : (
                                                                         <span 
                                         className="editable-price"
                                         onClick={() => startPriceEdit(index)}
                                     >
                                         {formatPrice(item.last_price)}
                                     </span>
                                )}
                            </div>
                            <div className="storage-item-last-price-date">
                                {item.isEditingDate ? (
                                    <input
                                        type="date"
                                        className="edit-date-input"
                                        value={item.editingDate || item.last_price_date}
                                        onChange={(e) => handleDateEdit(e, index)}
                                        onBlur={() => saveDateEdit(index)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveDateEdit(index)}
                                        autoFocus
                                    />
                                ) : (
                                                                         <span 
                                         className="editable-date"
                                         onClick={() => startDateEdit(index)}
                                     >
                                         {formatDate(item.last_price_date)}
                                     </span>
                                )}
                            </div>
                            <p className="storage-item-amount">{item.amount}</p>
                        </div>
                        <div className="storage-item-actions">
                            <div className="storage-item-change-amount">
                                <button 
                                    className="minus-button"
                                    onClick={() => addAmount(index, "minus")}
                                > - </button>

                                <input 
                                    className="amount-input"
                                    type="number" 
                                    min="0"
                                    value={item.amountToAdd}
                                    onChange={(e) => handleInputChange(e, index)}
                                />

                                <button 
                                    className="plus-button"
                                    onClick={() => addAmount(index, "plus")}
                                > + </button>
                            </div>
                            <button 
                                className="edit-button"
                                onClick={() => navigate(`/storage_log/${item.id}`)}
                            >
                            {language === "english" ? "Product Log" : "Historico do Produto"}
                            </button>
                        </div>
                    </div>
                : <div className="empty-state">{language === "english" ? "Empty Storage" : "Estoque Vazio"}</div>
                ))}
            </div>
        </div>
    );
} 