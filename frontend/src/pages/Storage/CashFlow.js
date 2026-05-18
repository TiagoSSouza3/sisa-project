import '../../styles/global.css';
import '../../styles/cash-flow.css';
import { useLanguage } from '../../components/LanguageContext';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { getAuthToken } from "../../utils/auth";

export default function CashFlow() {
    const { language } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [get, setGet] = useState(false);
    const navigate = useNavigate();
    const [storage, setStorage] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [month, setMonth] = useState();
    const [year, setYear] = useState();
    const [parseDataError, setParseDataError] = useState(false);

    /**
     * Função inteligente para calcular o gasto mensal baseado nos logs.
     * Rastreia mudanças de preço e quantidade de forma independente,
     * considerando a ordem temporal das alterações.
     */
    function calculateMonthExpenses(storage) {
        if (!storage || storage.length === 0) return 0;

        let totalGasto = 0;

        // Agrupar logs por id_item
        const itemsGrouped = storage.reduce((acc, log) => {
            if (!acc[log.id_item]) acc[log.id_item] = [];
            acc[log.id_item].push(log);
            return acc;
        }, {});

        // Processar cada item individualmente
        Object.values(itemsGrouped).forEach((logs) => {
            // Ordenar por data (created_at) para processar em ordem cronológica
            logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            let currentPrice = null;
            let priceHistory = []; // Array para rastrear histórico de preços

            logs.forEach((log) => {
                // Se o item foi deletado, ignoramos
                if (log.last_change === "deleted") return;

                // Caso seja a criação do item
                if (log.last_change === "created") {
                    if (log.last_price !== null && log.last_price !== undefined) {
                        currentPrice = parseFloat(log.last_price);
                        priceHistory.push({
                            price: currentPrice,
                            date: new Date(log.created_at)
                        });
                    }
                    // Se tiver quantidade inicial na criação, calcular gasto
                    if (log.amount > 0 && currentPrice !== null) {
                        totalGasto += currentPrice * log.amount;
                    }
                    return;
                }

                // Atualização de preço
                if (log.last_change === "price_update") {
                    if (log.last_price !== null && log.last_price !== undefined) {
                        currentPrice = parseFloat(log.last_price);
                        priceHistory.push({
                            price: currentPrice,
                            date: new Date(log.created_at)
                        });
                    }
                    return;
                }

                // Entrada de estoque (aumento de quantidade)
                if (log.last_change === "amount_increase") {
                    if (log.value_diference > 0) {
                        // Usar o preço atual (que pode ter sido atualizado antes desta entrada)
                        if (currentPrice !== null) {
                            totalGasto += currentPrice * log.value_diference;
                        }
                    }
                    return;
                }

                // Logs de outras mudanças (nome, descrição) não afetam o cálculo
                if (log.last_change.includes("_update")) {
                    return;
                }
            });
        });

        return totalGasto;
    }

    const loadStorageByMonth = async () => {
        setLoading(true);
        
        if (!month || !year) {
            setLoading(false);
            setParseDataError(true);
            return;
        }
        setParseDataError(false);

        try {
            const storage_res = await API.post(`/storage/log`, { month, year });
            console.log("Storage response:", storage_res.data); 

            setStorage(storage_res.data);
        } catch (err) {
            console.log("Erro ao carregar estoque:", err);
        } finally {
            setLoading(false);
            setGet(true);
        }
    };

    useEffect(() => {
        const token = getAuthToken();
        setIsLoggedIn(token !== null);
    }, []);

    // Sempre que o storage mudar, recalcular o gasto do mês
    useEffect(() => {
        if (storage.length > 0) {
            const total = calculateMonthExpenses(storage);
            setTransactions([{ total }]);
        } else {
            setTransactions([]);
        }
    }, [storage]);

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
        setGet(false);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
        setGet(false);
    };

    return (
        <div className="cash-flow">
            {isLoggedIn && !loading &&
                <div className="cash-flow-container">
                    <div className="cash-flow-header">
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
                        <h1 className="cash-flow-title">
                            {language === "english" ? "Monthly Expenses" : "Gastos Mensais"}
                        </h1>
                        <p className="cash-flow-subtitle">
                            {language === "english" ? "Track your monthly inventory expenses" : "Acompanhe seus gastos mensais com estoque"}
                        </p>
                    </div>

                    <div className="cash-flow-inputs">
                        {parseDataError && 
                            <div className="error-message">
                                <span>⚠️</span>
                                {language === "english" ? "Please select a month and year" : "Por favor, selecione um mês e ano"}
                            </div>
                        }

                        <div className="inputs-row">
                            <div className="input-group">
                                <label htmlFor="month-select">
                                    {language === "english" ? "Month" : "Mês"}
                                </label>
                                <select 
                                    id="month-select"
                                    value={month} 
                                    onChange={handleMonthChange}
                                >
                                    <option value="">
                                        {language === "english" ? "Select a month" : "Selecione um mês"}
                                    </option>
                                    <option value="01">{language === "english" ? "January" : "Janeiro"}</option>
                                    <option value="02">{language === "english" ? "February" : "Fevereiro"}</option>
                                    <option value="03">{language === "english" ? "March" : "Março"}</option>
                                    <option value="04">{language === "english" ? "April" : "Abril"}</option>
                                    <option value="05">{language === "english" ? "May" : "Maio"}</option>
                                    <option value="06">{language === "english" ? "June" : "Junho"}</option>
                                    <option value="07">{language === "english" ? "July" : "Julho"}</option>
                                    <option value="08">{language === "english" ? "August" : "Agosto"}</option>
                                    <option value="09">{language === "english" ? "September" : "Setembro"}</option>
                                    <option value="10">{language === "english" ? "October" : "Outubro"}</option>
                                    <option value="11">{language === "english" ? "November" : "Novembro"}</option>
                                    <option value="12">{language === "english" ? "December" : "Dezembro"}</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="year-select">
                                    {language === "english" ? "Year" : "Ano"}
                                </label>
                                <select 
                                    id="year-select"
                                    value={year} 
                                    onChange={handleYearChange}
                                >
                                    <option value="">
                                        {language === "english" ? "Select a year" : "Selecione um ano"}
                                    </option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                    <option value="2028">2028</option>
                                    <option value="2029">2029</option>
                                    <option value="2030">2030</option>
                                </select>
                            </div>

                            <button className="search-button" onClick={loadStorageByMonth}>
                                <span>🔍</span>
                                {language === "english" ? "Search" : "Buscar"}
                            </button>
                        </div>
                    </div>

                    <div className="cash-flow-content">
                        {transactions.length === 0 && month && year && get ? (
                            <div className="no-data-message">
                                {language === "english" ? "No Purchases Made in Month " : "Nenhuma Compra Foi Feita No Mês "} 
                                {month}/{year}
                            </div>
                        ) : (
                            transactions.map((item, idx) => (
                                <div key={idx} className="expense-result">
                                    <div className="expense-label">
                                        {language === "english" ? "Total Expenses" : "Total Gasto"}
                                    </div>
                                    <div className="expense-value">
                                        R$ {item.total.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            }

            {loading && (
                <div className="loading">
                    {language === "english" ? "Loading..." : "Carregando..."}
                </div>
            )}
        </div>
    );
}
