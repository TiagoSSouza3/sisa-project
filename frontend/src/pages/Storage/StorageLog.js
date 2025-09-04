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
    const navigate = useNavigate();
    const [storage, setStorage] = useState([]);

    const loadStorage = async () => {
        try {
            const storage =  await API.get(`/storage/log/${id}`)
            setStorage(storage.data);

        } catch (err) {
            console.log("Erro ao carregar estoque");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);0
        loadStorage();
    }, []);

    if(!isLoggedIn) return <navigate to="/" />

    return (
        <div className="storage-container">
            <div className="storage-header">
                <button onClick={() => navigate("/storage")} className="transparent-button">
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
                <h2>{language === "english" ? "Storage Log" : "Historico Estoque"}</h2>
            </div>

            <div className="storage-items-list">
                {storage.length === 0 ? (
                    <div className="empty-state">{language === "english" ? "Empty Storage" : "Estoque Vazio"}</div>
                ) : (
                storage.map((item, index) => (
                    <div key={item.id} className="storage-item">
                        <div className="storage-item-info">
                            <h3 className="storage-item-date">{item.date}</h3>
                            <h3 className="storage-item-title">{item.name}</h3>
                            <p className="storage-item-description">{item.description}</p>
                            <p className="storage-item-last-price">{item.last_price}</p>
                            <p className="storage-item-last-price-date">{item.last_price_date}</p>
                            <p className="storage-item-amount">{item.amount}</p>
                        </div>
                    </div>
                ))
                )}
            </div>
        </div>
    );
} 