import axios from "axios";

const base_url = process.env.REACT_APP_API_BASE_URL
  || process.env.REACT_APP_API_DEVELOPMENT
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? "http://localhost:5000/api"
      : "https://sisa.up.railway.app/api");
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
    console.error('Erro na requisição:', error);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    return Promise.reject(error);
  }
);

export default API;
