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
    const [amount, setAmount] = useState(0);
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState({
            name: "",
            description: "",
            last_price: 0,
            last_price_date: "",
            amount: 0
        });
    const [storage, setStorage] = useState([
        {
            id: 1,
            name: "lapis",
            description: "caixas de lapis",
            last_price: 3.50,
            last_price_date: "03/04/2019",
            amount: 50
        }
    ]);

    const loadStorage = async () => {
        try {
            const storage_res =  await API.get(`/storage`)
            setStorage([...storage, storage_res.data]);

        } catch (err) {
            console.log("Erro ao carregar estoque");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        loadStorage();
    }, []);

    const addAmount = (index, type, amount) => {
        const item = storage[index]
        item.amount = 
            type === "plus" 
                ? item.amount + amount 
                : item.amount - amount
                
        saveStorage(item);
    }

    const saveStorage = async (item) => {
        try {
            res = await API.put(`/storage/${item.id}`, item);
            
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    }
    
    const handleInputChange = (e) => {
        setAmount(Number(e.target.value));
    };
    
    const handleNewStorageItem = async () => {
        await API.post(`/storage`, newItem);
        setNewItem({
            name: "",
            description: "",
            last_price: 0,
            last_price_date: "",
            amount: 0
        });
        loadStorage();
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
                <div className="subject-card">
                    <form
                        className="storage-form"
                        onSubmit={(e) => { 
                            e.preventDefault(); 
                            handleNewStorageItem(); 
                        }}
                    >
                        <input 
                            id="name"
                            type="text"
                            placeholder={language === "english" ? "Name" : "Nome"}
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            required
                        ></input>

                        <input 
                            id="description"
                            type="text"
                            placeholder={language === "english" ? "Description" : "Descrição"}
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        ></input>

                        <input 
                            id="last_price"
                            type="text"
                            placeholder={language === "english" ? "Last Price" : "Ultimo Preço"}
                            value={newItem.last_price}
                            onChange={(e) => setNewItem({ ...newItem, last_price: e.target.value })}
                        ></input>

                        <input 
                            id="last_price_date"
                            type="text"
                            placeholder={language === "english" ? "Last Price Date" : "Data Ultimo Preço"}
                            value={newItem.last_price_date}
                            onChange={(e) => setNewItem({ ...newItem, last_price_date: e.target.value })}
                        ></input>

                        <input 
                            id="amount"
                            type="text"
                            placeholder={language === "english" ? "Amount" : "Quantidade"}
                            value={newItem.amount}
                            onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        ></input>

                        <button 
                            className="create-item-button"
                            type="submit"
                        > 
                        {language === "english" ? "Create" : "Criar"}
                        </button>
                    </form>
                </div>
                {storage.length === 0 ? (
                    <div className="empty-state">{language === "english" ? "Empty Storage" : "Estoque Vazio"}</div>
                ) : (
                    storage.map((item, index) => (
                        <div key={item.id} className="subject-card">
                            <h3 className="storage-item-title">{item.name}</h3>
                            <p className="storage-item-description">{item.description}</p>
                            <p className="storage-item-last-price">{item.last_price}</p>
                            <p className="storage-item-last-price-date">{item.last_price_date}</p>
                            <p className="storage-item-amount">{item.amount}</p>
                            <div className="storage-item-actions">
                                <div className="storage-item-change-amount">
                                    <button 
                                        className="minus-button"
                                        onClick={() => addAmount(index, "minus", amount)}
                                    > - </button>

                                    <input 
                                        className="amount-input"
                                        type="number" 
                                        min="1"
                                        value={amount}
                                        onChange={handleInputChange}
                                    />

                                    <button 
                                        className="plus-button"
                                        onClick={() => addAmount(index, "plus", amount)}
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
                    ))
                )}
            </div>
        </div>
    );
} 