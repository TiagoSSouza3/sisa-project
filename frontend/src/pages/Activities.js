import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles.css";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadActivities = async () => {
    try {
      const res = await API.get("/activities");
      setActivities(res.data);
    } catch (err) {
      setError("Erro ao carregar atividades");
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleCreate = async () => {
    try {
      await API.post("/activities", newActivity);
      setNewActivity({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "active"
      });
      setSuccess("Atividade criada com sucesso!");
      loadActivities();
    } catch (err) {
      setError("Erro ao criar atividade");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/activities/${id}`);
      setSuccess("Atividade removida com sucesso!");
      loadActivities();
    } catch (err) {
      setError("Erro ao remover atividade");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container">
      <h2>Atividades</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
        <input 
          placeholder="Nome da Atividade" 
          value={newActivity.name}
          onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })} 
          required 
        />
        <textarea 
          placeholder="Descrição" 
          value={newActivity.description}
          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} 
          required
        />
        <div className="date-inputs">
          <input 
            type="date"
            placeholder="Data de Início" 
            value={newActivity.start_date}
            onChange={(e) => setNewActivity({ ...newActivity, start_date: e.target.value })} 
            required
          />
          <input 
            type="date"
            placeholder="Data de Término" 
            value={newActivity.end_date}
            onChange={(e) => setNewActivity({ ...newActivity, end_date: e.target.value })} 
            required
          />
        </div>
        <select
          value={newActivity.status}
          onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}
          required
        >
          <option value="active">Ativa</option>
          <option value="completed">Concluída</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <button type="submit">Criar Atividade</button>
      </form>

      <div className="list">
        {activities.map(activity => (
          <div key={activity.id} className="list-item">
            <div>
              <strong>{activity.name}</strong>
              <p>{activity.description}</p>
              <div className="activity-dates">
                <span>Início: {formatDate(activity.start_date)}</span>
                <span>Término: {formatDate(activity.end_date)}</span>
              </div>
              <div className={`status ${activity.status}`}>
                {activity.status === 'active' && 'Ativa'}
                {activity.status === 'completed' && 'Concluída'}
                {activity.status === 'cancelled' && 'Cancelada'}
              </div>
            </div>
            <button onClick={() => handleDelete(activity.id)} className="delete-btn">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 