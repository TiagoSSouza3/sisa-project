import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import DocumentUploader from "../../components/DocumentUploader";

export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getDocuments()
    }, []);

    const getDocuments = async () => {
        await API.get(`/documents`).then(res => 
            setDocuments(res.data)
        );
        console.table(documents)
    }

    return (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Seus Documentos</h1>
        <DocumentUploader onUpload={getDocuments} />
        <ul className="space-y-2">
            {documents.map(doc => (
            <li 
                key={doc.id} 
                className="border rounded p-2 hover:bg-gray-100 cursor-pointer" 
                onClick={() => navigate(`/document_edition/${doc.id}`)}
            >
                {doc.name}
            </li>
            ))}
        </ul>
    </div>
    );
}