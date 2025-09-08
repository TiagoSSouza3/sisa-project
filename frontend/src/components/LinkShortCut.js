import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from './LanguageContext';
import '../styles/LinkShortCut.css';

export default function LinkShortCut({ name, linkToPage}) {
    const location = useLocation();
    const isActive = (path) => (location.pathname === path ? "active" : "");
    const { language } = useLanguage();

    useEffect(() => {}, [location]);

    const getIcon = () => {
        switch (linkToPage) {
            case "/users":
                return "👥";
            case "/students":
                return "🎓";
            case "/subjects":
                return "📚";
            case "/documents":
                return "📄";
            case "/storage":
                return "📦";
            default:
                return "";
        }
    }

    return (
        <div className="shortcut">
            <button className="link-button">
                <Link to={linkToPage} className={isActive(linkToPage)} id="link">
                    <div className="title">
                        <span role="img" aria-label={name}>{getIcon()}</span> 
                        {name}
                    </div>
                    {language === "english" ? "Go to Page" : "Ir Para Pagina"}
                </Link>
            </button>
        </div>
    );
}