import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import API from "../../api";

export default function DocumentEdition() {
    const { id } = useParams();
    const [doc, setDoc] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        getDocuments()
    }, [id]);

    const getDocuments = async () => {
        await API.get(`/documents/${id}`).then(res => 
            setDoc(res.data)
        );
    }

    const handleChange = (field, value) => {
        setDoc({ ...doc, content: { ...doc.content, [field]: value } });
    };

    const handleExportPDF = () => {
        const pdf = new jsPDF();
        pdf.text(JSON.stringify(doc.content, null, 2), 10, 10);
        pdf.save(`${doc.name}.pdf`);
    };

    const handleExportDoc = () => {
        const blob = new Blob([
            `Documento: ${doc.name}\n\n` +
            Object.entries(doc.content).map(([k, v]) => `${k}: ${v}`).join("\n")
        ], { type: "application/msword" });
        saveAs(blob, `${doc.name}.doc`);
    };

    if (!doc) return <div>Carregando...</div>;

    return (
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Editando: {doc.name}</h1>
            <button onClick={() => setEditMode(!editMode)} className="bg-blue-500 text-white px-3 py-1 rounded">
                {editMode ? "Modo Visualização" : "Modo Edição"}
            </button>
        </div>
        <div className="space-y-3">
        {Object.entries(doc.content).map(([key, value]) => (
            <div key={key}>
            <label className="block font-semibold mb-1">{key}</label>
            {editMode ? (
                <input
                className="border p-2 w-full"
                value={value}
                onChange={e => handleChange(key, e.target.value)}
                />
            ) : (
                <p className="bg-gray-100 p-2 rounded">{value}</p>
            )}
            </div>
        ))}
        </div>
        <div className="mt-6 flex gap-4">
            <button onClick={handleExportPDF} className="bg-green-600 text-white px-4 py-2 rounded">Exportar PDF</button>
            <button onClick={handleExportDoc} className="bg-purple-600 text-white px-4 py-2 rounded">Exportar DOC</button>
        </div>
    </div>
    );
}