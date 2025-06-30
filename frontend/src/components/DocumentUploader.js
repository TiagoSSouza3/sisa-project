import { useState } from "react";
import API from "../api";

export default function DocumentUploader({ subjectId = null, onUpload }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = async () => {
    if (!file || !title) return alert("Preencha todos os campos");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(",")[1];
      await API.post("/documents", {
        title,
        subject_id: subjectId,
        file_name: file.name,
        file_type: file.type,
        file_data: base64,
        created_by: 1
      });
      alert("Documento enviado!");
      setTitle("");
      setFile(null);
      if (onUpload) onUpload();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-4 p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">Enviar Documento</h2>
      <input
        type="text"
        placeholder="Título"
        className="border p-2 w-full mb-2"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="file"
        className="mb-2"
        onChange={e => setFile(e.target.files[0])}
        accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enviar
      </button>
    </div>
  );
}