import { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { occupationEnum } from "../../enums/occupationEnum";
import { useLanguage } from '../../components/LanguageContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';

import '../../styles/global.css';
import '../../styles/storage.css';

export default function Storage() {
    const { language } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        last_price: "",
        last_price_date: "",
        amount: ""
    });
    const [storage, setStorage] = useState([]);

    const loadStorage = async () => {
        setLoading(true);

        try {
            const storage_res = await API.get(`/storage`);
            console.log("Storage response:", storage_res.data); 

            const storageWithAmount = await Promise.all(
                storage_res.data.map(async (item) => {
                    const storage_log_res = await API.get(`/storage/log/${item.id}`);
                    const data = storage_log_res.data;

                    let priceChange = null;

                    const currentPrice = parseFloat(item.last_price) || 0;
                    const previousLog = data[1] || null;
                    const previousPrice = previousLog ? previousLog.last_price : null;

                    if (!!previousLog && previousPrice > 0) {
                        const change = ((currentPrice - previousPrice) / previousPrice) * 100;
                        priceChange = {
                            percentage: change,
                            isPositive: change > 0,
                            isNegative: change < 0,
                            isNeutral: change === 0
                        };
                    }

                    return {
                        ...item,
                        priceChange: priceChange,
                        amountToAdd: "",
                        isEditingPrice: false,
                        editingPrice: null
                    };
                })
            );

            setStorage(storageWithAmount);
        } catch (err) {
            console.log("Erro ao carregar estoque:", err);
        } finally {
            setLoading(false);
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
    };

    const saveStorage = async (item, index) => {
        try {
            const itemToSend = { ...item };
            delete itemToSend.amountToAdd;
            delete itemToSend.isEditingPrice;
            delete itemToSend.editingPrice;
            
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
                const updatedStorage = [...storage];
                updatedStorage[index] = {
                    ...updatedStorage[index],
                    amountToAdd: "",
                    isEditingPrice: false,
                    editingPrice: null
                };

                console.log("Estado final:", updatedStorage[index]);
                setStorage(updatedStorage);

                loadStorage();
            }
        } catch (error) {
            console.log("Erro ao salvar:", error);
        }
    };
    
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
        const last_price_date = Date.now();
        await API.post("/storage", { ...newItem, last_price_date: last_price_date });
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
        const numValue = value === '' ? '' : parseFloat(value);
        
        if (!isNaN(numValue) && numValue >= 0) {
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                editingPrice: numValue
            };
            setStorage(updatedStorage);
        }
    };

    const handleDelete = async (e) => {
        const id = e.target.value;
        const item = storage.find(item => item.id === parseInt(id));
        
        showConfirmation({
            type: 'delete',
            title: language === "english" ? "Delete Item" : "Excluir Item",
            message: language === "english" 
                ? `Are you sure you want to delete "${item?.name}"? This action cannot be undone.`
                : `Tem certeza que deseja excluir "${item?.name}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                await API.delete(`/storage/${id}`);
                loadStorage();
            }
        });
    };

    const savePriceEdit = async (index) => {
        const item = storage[index];
        const newPrice = parseFloat(item.editingPrice) || 0;
        
        if (newPrice !== item.last_price) {
            // Atualiza last_price_date automaticamente para hoje
            const today = new Date().toISOString().split('T')[0];
            const updatedItem = {
                ...item,
                last_price: newPrice,
                last_price_date: today
            };
            
            // Atualiza localmente
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                last_price: newPrice,
                last_price_date: today,
                isEditingPrice: false,
                editingPrice: null
            };
            setStorage(updatedStorage);
            
            // Salva no banco
            await saveStorage(updatedItem, index);
        } else {
            // Apenas sai do modo de edição
            const updatedStorage = [...storage];
            updatedStorage[index] = {
                ...updatedStorage[index],
                isEditingPrice: false,
                editingPrice: null
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

    // Função auxiliar para formatar variação de preço
    const formatPriceChange = (priceChange) => {
        if (!priceChange) return "--//--";
        if (priceChange.percentage === 0) return "0,00%";
        
        const sign = priceChange.isPositive ? "+" : "";
        return `${sign}${priceChange.percentage.toFixed(2).replace(".", ",")}%`;
    };

    const getPriceChangeClass = (priceChange) => {
        if (!priceChange) return "neutral";
        if (priceChange.percentage === 0) return "neutral";
        if (priceChange.isPositive) return "positive";
        if (priceChange.isNegative) return "negative";
        return "neutral";
    };

    if (loading) {
        return (
          <div className="all-documents-loading">
            <div className="loading-spinner-large"></div>
            <p>{language === "english" ? "Loading..." : "Carregando..."}</p>
          </div>
        );
    }

    return (
        <div className="storage-container">
            <div className="storage-header">
                <h2>{language === "english" ? "Storage" : "Estoque"}</h2>
                { isLoggedIn && localStorage.getItem("occupation_id") !== occupationEnum.professor && 
                <div>
                    <button 
                        className="storage-log-button"
                        onClick={() => navigate("/storage_log")}
                    >
                        {language === "english" ? "Logs" : "Historico"}
                    </button>
                    <button 
                        className="cash-flow-button"
                        onClick={() => navigate("/cash_flow")}
                    >
                        {language === "english" ? "Cash Flow" : "Fluxo de Caixa"}
                    </button>
                </div>
                }
            </div>

            <div className="storage-form-container">
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

            <div className="storage-items-list">
                <div className="storage-items-list-titles">
                    <h3>{language === "english" ? "Name" : "Nome"}</h3>
                    <h3>{language === "english" ? "Description" : "Descrição"}</h3>
                    <h3>{language === "english" ? "Last Price" : "Ultimo Preço"}</h3>
                    <h3>{language === "english" ? "Price Change" : "Variação de Preço"}</h3>
                    <h3>{language === "english" ? "Date Of Last Purchase" : "Data Da Ultima Compra"}</h3>
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
                            <div className={`storage-item-price-change ${getPriceChangeClass(item.priceChange)}`}>
                                {formatPriceChange(item.priceChange)}
                            </div>
                            <div className="storage-item-last-price-date">
                                {formatDate(item.last_price_date)}
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
                            {language === "english" ? "Product Log" : "Historico"}
                            </button>
                        </div>
                        <div className="storage-item-delete">
                            <button 
                                className="delete-button"
                                value={item.id}
                                onClick={handleDelete}
                            >🗑️</button>
                        </div>
                    </div>
                : <div className="empty-state">{language === "english" ? "Empty Storage" : "Estoque Vazio"}</div>
                ))}
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
