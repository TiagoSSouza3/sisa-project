export const dateToString = (date) => {
    if(date === "") return `yyyy-MM-dd`;
    if(typeof date === "string") return date;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`;
}

export const StringToDate = (string) => {
    if(string === "") return "";

    const [year, month, day] = string.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date;
}