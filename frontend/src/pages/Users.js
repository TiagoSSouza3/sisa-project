import React, { useEffect, useState } from "react";
import API from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [novo, setNovo] = useState({ name: "", email: "", password: "", occupation_id: 3 });

  useEffect(() => {
    API.get("/users").then(res => setUsers(res.data));
  }, []);

  const handleCreate = async () => {
    await API.post("/users", novo);
    const updated = await API.get("/users");
    setUsers(updated.data);
  };

  const handleDelete = async (id) => {
    await API.delete(`/users/${id}`);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div>
      <h2>Usuários</h2>
      <input placeholder="Nome" onChange={(e) => setNovo({ ...novo, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
      <input placeholder="Senha" onChange={(e) => setNovo({ ...novo, password: e.target.value })} />
      <select onChange={(e) => setNovo({ ...novo, occupation_id: Number(e.target.value) })}>
        <option value="1">Administrador</option>
        <option value="2">Colaborador</option>
        <option value="3">Professor</option>
      </select>
      <button onClick={handleCreate}>Criar</button>

      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email}) 
            <button onClick={() => handleDelete(user.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
