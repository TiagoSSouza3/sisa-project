import React, { useState } from "react";
import API from "../api";

export default function DocumentUploader({ activityId }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = async () => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(",")[1];
      await API.post("/documents", {
        title,
        activity_id: activityId,
        file_name: file.name,
        file_type: file.type,
        file_data: base64,
        created_by: 1
      });
      alert("Documento enviado!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h4>Enviar Documento</h4>
      <input type="text" placeholder="Título" onChange={e => setTitle(e.target.value)} />
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Enviar</button>
    </div>
  );
}
