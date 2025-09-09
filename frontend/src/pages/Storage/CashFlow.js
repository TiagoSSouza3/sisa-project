import '../../styles/global.css';
import '../../styles/cash-flow.css';
import { useLanguage } from '../../components/LanguageContext';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

export default function CashFlow() {
    const { language } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [storage, setStorage] = useState([]);
    const [monthsCashFLow, setMonthsCashFLow ] = useState([]);

    const loadStorage = async () => {
        setLoading(true);

        try {
            const storage_res = await API.get(`/storage/log`);
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
        loadStorage();
    }, []);

    useEffect(() => {
        if (storage.length > 0) {
            calculateMonths();
        }
    }, [storage]);

    function calculateMonths() {
        storage.map((item) => {
            console.log(item)
        })
    }

    return (
        <div className="cash-flow">
        { isLoggedIn && 
            <div className="cash-flow-container">

            </div>
        }
        </div>
    );
}