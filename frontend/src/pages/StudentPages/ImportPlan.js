import React, { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import "../../styles/global.css";
import "../../styles/importPlan.css";

const DEFAULT_COLUMN_MAP = {
  name: "B",
  registration: "C",
  CPF: "E",
  phone: "X",
  second_phone:  "Y",
  gender: "G",
  RG: "I",
  school_year: "AD",
  school_name: "AE",
  school_period: "AF",
  address: "U",
  neighborhood: "V",
  cep: "W",
  notes: "AG",
  active: "AH",
  is_on_school: "AC",
  birth_date: "F"
};

const DATA_START_ROW = 3;

const columnLetterToIndex = (letter) => {
  const normalized = String(letter || "").trim().toUpperCase();
  if (!normalized) return -1;

  let index = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    if (code < 65 || code > 90) return -1;
    index = index * 26 + (code - 64);
  }

  return index - 1;
};

const readColumn = (row, letter) => {
  const idx = columnLetterToIndex(letter);
  if (idx < 0) return "";
  const value = row[idx];
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

export default function ImportPlan() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState(null);
  const [columnMap, setColumnMap] = useState(DEFAULT_COLUMN_MAP);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token !== null);
  }, []);

  const handleMapChange = (field, value) => {
    setColumnMap((prev) => ({ ...prev, [field]: value.toUpperCase() }));
  };

  const handleParseFile = async () => {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Selecione um arquivo .xlsx, .xls ou .csv para continuar.");
      return;
    }

    setIsParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("Nenhuma aba encontrada no arquivo.");
      }

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
      const dataRows = rows.slice(DATA_START_ROW - 1);

      const parsed = dataRows
        .filter((row) => Array.isArray(row) && row.some((cell) => String(cell || "").trim() !== ""))
        .map((row) => {
          const subjects = [
            readColumn(row, columnMap.subject_1),
            readColumn(row, columnMap.subject_2),
            readColumn(row, columnMap.subject_3)
          ].filter((subject) => subject !== "");

          return {
            name: readColumn(row, columnMap.name),
            registration: readColumn(row, columnMap.registration),
            CPF: readColumn(row, columnMap.CPF),
            email: readColumn(row, columnMap.email),
            phone: readColumn(row, columnMap.phone),
            subjects
          };
        })
        .filter((student) => student.name);

      if (parsed.length === 0) {
        throw new Error("Nenhum aluno válido encontrado. Confira as colunas e se os dados começam na linha 3.");
      }

      setParsedStudents(parsed);
      setSuccess(`${parsed.length} aluno(s) pronto(s) para importação.`);
    } catch (parseError) {
      setParsedStudents([]);
      setError(parseError.message || "Não foi possível ler o arquivo.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    setError("");
    setSuccess("");

    if (parsedStudents.length === 0) {
      setError("Faça a leitura do arquivo antes de importar.");
      return;
    }

    setIsImporting(true);
    try {
      const response = await API.post("/students/bulk-import", { students: parsedStudents });
      const data = response.data || {};
      const failed = Number(data.failed || 0);

      if (failed > 0) {
        setError(`Importação finalizada com ${failed} erro(s). Revise os dados e tente novamente.`);
      } else {
        setSuccess(`Importação concluída! Criados: ${data.created || 0}, atualizados: ${data.updated || 0}, inscrições: ${data.subscribed || 0}.`);
      }

      setTimeout(() => navigate("/students"), 1800);
    } catch (importError) {
      const backendError = importError?.response?.data?.error;
      setError(backendError || "Erro ao importar inscrições.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="import-container">
      <div className="import-card">
        <h2>Importar inscrições por planilha</h2>
        <p className="import-description">
          Baixe sua planilha do Google Sheets, envie aqui e importe os alunos com inscrição automática nas matérias.
        </p>

        {!isLoggedIn && <div className="error">Você precisa estar logado para importar.</div>}
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="import-field">
          <label>Arquivo da planilha</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </div>

        <div className="import-actions">
          <button className="summary-data-button" onClick={handleParseFile} disabled={!isLoggedIn || isParsing || isImporting}>
            {isParsing ? "Lendo planilha..." : "Ler planilha"}
          </button>
          <button className="add-student-button" onClick={handleImport} disabled={!isLoggedIn || isImporting || isParsing || parsedStudents.length === 0}>
            {isImporting ? "Importando..." : "Importar e inscrever"}
          </button>
          <button className="clear-button" onClick={() => navigate("/students")} disabled={isImporting}>
            Voltar
          </button>
        </div>

        {parsedStudents.length > 0 && (
          <div className="preview-area">
            <h3>Prévia ({parsedStudents.length})</h3>
            <div className="preview-table-wrapper">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>CPF</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedStudents.slice(0, 10).map((student, idx) => (
                    <tr key={`${student.name}-${idx}`}>
                      <td>{student.name}</td>
                      <td>{student.registration || "-"}</td>
                      <td>{student.CPF || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedStudents.length > 10 && <p className="preview-note">Mostrando apenas os 10 primeiros registros.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
