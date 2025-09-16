import { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from '../../components/LanguageContext';

import '../../styles/global.css';
import '../../styles/storage.css';
import '../../styles/storage-log.css';

export default function StorageLog() {
    const { id } = useParams();
    const { language } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [storage, setStorage] = useState([]);

    const loadStorage = async () => {
        try {
            let storage;
            if(id){
                storage =  await API.get(`/storage/log/${id}`);
            } else {
                storage =  await API.get(`/storage/log`);
            }
            const data = storage.data;
            console.log("Storage Log Data:", data);
            
            // Calcular variação de preço para cada log
            let storageWithPriceChange;
            
            if (id) {
                // Quando há ID, calcular variação sequencialmente (lógica original)
                storageWithPriceChange = data.map((item, index) => {
                    let priceChange = null;
                    
                    const currentPrice = parseFloat(item.last_price) || 0;
                    const previousLog = data[index + 1] || null;
                    const previousPrice = previousLog ? previousLog.last_price : null;

                    console.log(currentPrice, index)
                    console.log(previousPrice, index+1)
                    
                    if (!!previousPrice && previousPrice > 0) {
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
                        priceChange: priceChange
                    };
                });
            } else {
                // Quando não há ID, agrupar por produto e calcular variação dentro de cada grupo
                const groupedByProduct = {};
                
                // Agrupar logs por id_item
                data.forEach(item => {
                    if (!groupedByProduct[item.id_item]) {
                        groupedByProduct[item.id_item] = [];
                    }
                    groupedByProduct[item.id_item].push(item);
                });
                
                // Ordenar cada grupo por data (mais recente primeiro)
                Object.keys(groupedByProduct).forEach(productId => {
                    groupedByProduct[productId].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                });
                
                // Calcular variação para cada grupo
                const allLogsWithPriceChange = [];
                Object.keys(groupedByProduct).forEach(productId => {
                    const productLogs = groupedByProduct[productId];
                    
                    productLogs.forEach((item, index) => {
                        let priceChange = null;
                        
                        const currentPrice = parseFloat(item.last_price) || 0;
                        const previousLog = productLogs[index + 1] || null;
                        const previousPrice = previousLog ? previousLog.last_price : null;

                        console.log(`Produto ${productId} - Log ${index}:`, currentPrice)
                        console.log(`Produto ${productId} - Log anterior:`, previousPrice)
                        
                        if (!!previousPrice && previousPrice > 0) {
                            const change = ((currentPrice - previousPrice) / previousPrice) * 100;
                            priceChange = {
                                percentage: change,
                                isPositive: change > 0,
                                isNegative: change < 0,
                                isNeutral: change === 0
                            };
                        }
                        
                        allLogsWithPriceChange.push({
                            ...item,
                            priceChange: priceChange
                        });
                    });
                });
                
                // Ordenar todos os logs por data (mais recente primeiro) para exibição
                storageWithPriceChange = allLogsWithPriceChange.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            
            setStorage(storageWithPriceChange);

        } catch (err) {
            console.log("Erro ao carregar estoque:", err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
        loadStorage();
    }, []);

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

    // Função auxiliar para formatar horário no formato HH:MM:SS
    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            
            return `${hours}:${minutes}:${seconds}`;
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

    // Função auxiliar para obter classe CSS da variação de preço
    const getPriceChangeClass = (priceChange) => {
        if (!priceChange) return "neutral";
        if (priceChange.percentage === 0) return "neutral";
        if (priceChange.isPositive) return "positive";
        if (priceChange.isNegative) return "negative";
        return "neutral";
    };

    return (
        <div className="storage-container storage-log-page">
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
                <h2>{language === "english" ? "Storage Log" : "Histórico"}</h2>
            </div>

            <div className="storage-items-list">
                {storage.length === 0 ? (
                    <div className="empty-state">{language === "english" ? "Empty Storage" : "Estoque Vazio"}</div>
                ) : (
                <div className="storage-log-center">
                    <div className="storage-items-list-titles storage-log-titles">
                        <h3>{language === "english" ? "Name" : "Nome"}</h3>
                        <h3>{language === "english" ? "Description" : "Descrição"}</h3>
                        <h3>{language === "english" ? "Last Price" : "Ultimo Preço"}</h3>
                        <h3>{language === "english" ? "Price Change" : "Variação de Preço"}</h3>
                        <h3>{language === "english" ? "Date Of Last Purchase " : "Data Da Ultima Compra"}</h3>
                        <h3>{language === "english" ? "Amount" : "Quantidade"}</h3>
                        <h3>{language === "english" ? "Date" : "Data"}</h3>
                    </div>
                    {storage.map((item, index) => (
                        <div key={item.id} className="storage-item storage-log-item">
                            <div className="storage-item-info">
                                <h3 className="storage-item-date">{formatDate(item.created_at)}<br />{formatTime(item.created_at)}</h3>
                                <h3 className="storage-item-title">{item.name}</h3>
                                <p className="storage-item-description">{item.description}</p>
                                <p className="storage-item-last-price">{formatPrice(item.last_price)}</p>
                                <div className={`storage-item-price-change ${getPriceChangeClass(item.priceChange)}`}>
                                    {formatPriceChange(item.priceChange)}
                                </div>
                                <p className="storage-item-last-price-date">{formatDate(item.last_price_date)}</p>
                                <p className="storage-item-amount">{item.amount}</p>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
} 