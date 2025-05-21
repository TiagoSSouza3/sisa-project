import React, { useEffect, useState } from "react";
import API from "../api";

export default function Activities() {
  const [list, setList] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", description: "" });

  const load = async () => {
    const res = await API.get("/activities");
    setList(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    await API.post("/activities", { ...newItem, professor_id: 1 });
    load();
  };

  const handleDelete = async (id) => {
    await API.delete(`/activities/${id}`);
    load();
  };

  return (
    <div>
      <h2>Atividades</h2>
      <input placeholder="Nome" onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
      <textarea placeholder="Descrição" onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
      <button onClick={handleCreate}>Criar</button>

      <ul>
        {list.map(act => (
          <li key={act.id}>
            {act.name} - {act.description}
            <button onClick={() => handleDelete(act.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
