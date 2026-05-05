export const dateToString = (date) => {
    console.log(date, typeof date)
    if (date === "" || date === null || date === undefined) return "";

    // Firestore Timestamp (server side) or similar objects
    if (date && typeof date === "object" && typeof date.toDate === "function") {
        date = date.toDate();
    }

    // If it's already a string, try to normalize it to yyyy-MM-dd
    if (typeof date === "string") {
        // Tenta criar um Date a partir da string (suporta 'yyyy-MM-dd' e ISO completo)
        const parsed = new Date(date);
        if (!isNaN(parsed)) {
            date = parsed;
        } else {
            // Se não deu para converter, retorna a string original
            return date;
        }
    }

    if (!(date instanceof Date)) {
        return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`;
}

export const StringToDate = (value) => {
    if (value === "" || value === null || value === undefined) return "";

    // Já é Date
    if (value instanceof Date) return value;

    // Firestore Timestamp ou objeto semelhante
    if (value && typeof value === "object") {
        return new Date(value._seconds * 1000);
    }

    if (typeof value === "string") {
        // Suporta tanto 'yyyy-MM-dd' quanto ISO completo
        const parsed = new Date(value);
        if (!isNaN(parsed)) {
            return parsed;
        }

        // Fallback para o formato antigo 'yyyy-MM-dd'
        const [year, month, day] = value.split("-").map(Number);
        if (!year || !month || !day) return "";
        return new Date(year, month - 1, day);
    }

    return "";
}