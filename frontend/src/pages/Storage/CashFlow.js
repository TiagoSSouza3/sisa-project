import '../../styles/global.css';
import '../../styles/cash-flow.css';
import { useLanguage } from '../../components/LanguageContext';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { dateToString, StringToDate } from '../../utils/utils';

export default function CashFlow() {
    const { language } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [storage, setStorage] = useState([]);
    const [month, setMonth ] = useState();
    const [year, setYear ] = useState();
    const [parseDataError, setParseDataError ] = useState(false);

    const loadStorageByMonth = async () => {
        setLoading(true);
        
        if(!month || !year){
            setLoading(false);
            setParseDataError(true)
            return;
        }
        setParseDataError(false)

        try {
            const storage_res = await API.post(`/storage/log`, { month, year });
            console.log("Storage response:", storage_res.data); 

            setStorage(storage_res.data);
        } catch (err) {
            console.log("Erro ao carregar estoque:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(token !== null);
    }, []);

    function calculateMonths() {
        storage.map((item) => {
            const data = dateToString(item.created_at)
            console.log(data)
            console.log(item.amount)
            console.log(item.last_price)

            
        })
    }

    const handleMonthChange = (e) =>{
        setMonth(e.target.value)
    }

    const handleYearChange = (e) =>{
        setYear(e.target.value)
    }

    return (
        <div className="cash-flow">
        { isLoggedIn && !loading &&
            <div className="cash-flow-container">
                {parseDataError && 
                <div>
                    Coloque o mes e o ano
                </div>
                }
                <select value={month} onChange={handleMonthChange}>
                    <option value="">
                        {language === "english" ? "Select a month" : "Selecione um mês"}
                    </option>
                    <option value="01">
                        {language === "english" ? "January" : "Janeiro"}
                    </option>
                    <option value="02">
                        {language === "english" ? "February" : "Fevereiro"}
                    </option>
                    <option value="03">
                        {language === "english" ? "March" : "Março"}
                    </option>
                    <option value="04">
                        {language === "english" ? "April" : "Abril"}
                    </option>
                    <option value="05">
                        {language === "english" ? "May" : "Maio"}
                    </option>
                    <option value="06">
                        {language === "english" ? "June" : "Junho"}
                    </option>
                    <option value="07">
                        {language === "english" ? "July" : "Julho"}
                    </option>
                    <option value="08">
                        {language === "english" ? "August" : "Agosto"}
                    </option>
                    <option value="09">
                        {language === "english" ? "September" : "Setembro"}
                    </option>
                    <option value="10">
                        {language === "english" ? "October" : "Outubro"}
                    </option>
                    <option value="11">
                        {language === "english" ? "November" : "Novembro"}
                    </option>
                    <option value="12">
                        {language === "english" ? "December" : "Dezembro"}
                    </option>
                </select>
                {month}

                <select value={year} onChange={handleYearChange}>
                    <option value="">
                        {language === "english" ? "Select a year" : "Selecione um ano"}
                    </option>
                    <option value="2025"> 2025 </option>
                    <option value="2026"> 2026 </option>
                    <option value="2027"> 2027 </option>
                    <option value="2028"> 2028 </option>
                    <option value="2029"> 2029 </option>
                    <option value="2030"> 2030 </option>
                </select>
                {year}

                <button onClick={loadStorageByMonth}>
                    buscar
                </button>
            </div>
        }
        </div>
    );
}