import axios from "axios";

const base_url = process.env.REACT_APP_API_DEVELOPMENT || (
  process.env.NODE_ENV === "development" 
    ? "http://localhost:5000/api" // Local backend URL
    : "https://sisa-project.up.railway.app" // Correct backend URL without port
);
const API = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na requisição:', {
      config: error.config,
      response: error.response,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default API;
