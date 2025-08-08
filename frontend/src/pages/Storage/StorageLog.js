import { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/storage.css';

export default function StorageLog() {
    const { id } = useParams();
    const { language } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [amount, setAmount] = useState(0);
    const navigate = useNavigate();
    const [storage, setStorage] = useState([
        {
            id: 1,
            name: "lapis",
            description: "caixas de lapis",
            last_price: "R$3.50",
            last_price_date: "03/04/2019",
            amount: 50
        }
    ]);

    const loadStorage = async () => {
        try {
            const storage =  await API.get(`/storage`)
            setStorage(storage.data);

        } catch (err) {
            console.log("Erro ao carregar estoque");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        //loadStorage();
    }, []);

    const addAmount = (index, type, amount) => {
        storage[index].amount = 
            type === "plus" 
                ? storage[index].amount + amount 
                : storage[index].amount - amount
                
        console.log(storage[index])
        //saveStorage();
    }

    const saveStorage = async () => {
        try {
            res = await API.post(`/storage`, storage);
            
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    }

    const handleInputChange = (e) => {
        setAmount(Number(e.target.value));
        console.log(amount)
    };

    return (
        <div className="storage-container">
            <div className="storage-header">
                <h2>{language === "english" ? "Storage Log" : "Historico Estoque"}</h2>
            </div>

            <div className="storage-items-list">
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
                            {language === "english" ? "Product History" : "Historico do Produto"}
                            </button>
                        </div>
                    </div>
                ))
                )}
            </div>
        </div>
    );
} 