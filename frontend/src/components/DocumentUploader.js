import { useState, useRef } from "react";
import API from "../api";

export default function DocumentUploader() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [placeholders, setPlaceholders] = useState([]);
  const [fields, setFields] = useState({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file) => {
    if (file.name.endsWith('.docx')) {
      setFile(file);
      setFileName(file.name);
      setError("");
    } else {
      setError("Apenas arquivos .docx são suportados.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return setError("Selecione um arquivo DOCX");
    
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await API.post("/documents/analyze", formData);
      
      setPlaceholders(res.data.placeholders);
      
      const initialFields = {};
      res.data.placeholders.forEach(ph => {
        initialFields[ph] = "";
      });
      setFields(initialFields);
      
    } catch (err) {
      setError(err.response?.data?.message || "Erro na análise");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fields", JSON.stringify(fields));
      
      const res = await API.post("/documents/preview", formData);
      setPreviewHtml(res.data.html);
      
    } catch (err) {
      setError("Erro ao gerar preview");
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (format) => {
    if (!file) return;
    
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fields", JSON.stringify(fields));
      formData.append("format", format);
      
      const res = await API.post("/documents/process", formData, {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName.replace('.docx', '')}_filled.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      setError("Erro no processamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 border rounded bg-white shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Processar Documento DOCX</h2>
      
      {error && <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      
      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 mb-4 cursor-pointer transition-all ${
          dragActive ? 'border-blue-700 bg-blue-50' : 'border-blue-400 hover:bg-blue-50'
        }`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".docx"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <svg width={48} height={48} fill="#2563eb" className="mb-2">
          <path d="M24 4a12 12 0 0 1 12 12v4h2a6 6 0 0 1 0 12h-2v4a12 12 0 0 1-24 0v-4h-2a6 6 0 0 1 0-12h2v-4A12 12 0 0 1 24 4zm0 2a10 10 0 0 0-10 10v4h20v-4A10 10 0 0 0 24 6zm-8 14v4a8 8 0 0 0 16 0v-4H16zm-4 6a4 4 0 0 0 0 8h2v-8h-2zm20 0v8h2a4 4 0 0 0 0-8h-2z" />
        </svg>
        <p className="text-blue-700 font-semibold text-center">
          Arraste e solte o arquivo DOCX<br />ou clique para escolher
        </p>
        {fileName && <p className="mt-2 text-blue-900 font-medium">{fileName}</p>}
      </div>
      
      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 w-full mb-4"
      >
        {loading ? "Analisando..." : "Analisar Documento"}
      </button>
      
      {placeholders.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Preencher Campos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placeholders.map(placeholder => (
              <div key={placeholder} className="flex flex-col">
                <label className="font-medium text-blue-800 mb-1">{placeholder}</label>
                <input
                  type="text"
                  className="border p-2 rounded"
                  value={fields[placeholder] || ""}
                  onChange={e => setFields({...fields, [placeholder]: e.target.value})}
                />
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePreview}
              className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 flex-1"
              disabled={loading}
            >
              Visualizar
            </button>
            <button
              onClick={() => handleProcess('docx')}
              className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 flex-1"
              disabled={loading}
            >
              Exportar DOCX
            </button>
            <button
              onClick={() => handleProcess('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 flex-1"
              disabled={loading}
            >
              Exportar PDF
            </button>
          </div>
        </div>
      )}
      
      {previewHtml && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <h3 className="text-lg font-semibold bg-gray-100 p-3 text-blue-700">Pré-visualização</h3>
          <div 
            className="p-4 bg-white max-h-[500px] overflow-y-auto" 
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}
    </div>
  );
}