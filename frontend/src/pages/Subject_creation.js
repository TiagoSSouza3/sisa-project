import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles.css";

const loadSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.log("Erro ao carregar disciplinas");
    }
  };

const handleCreate = async () => {
    try {
      const res = await API.post("/subjects", newSubject);
      setNewSubject({
        name: "",
        description: ""
      });
      loadSubjects();
    } catch (err) {
      console.log("Erro ao criar disciplina");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/subjects/${id}`);
      loadSubjects();
    } catch (err) {
      console.log("Erro ao remover disciplina");
    }
  };