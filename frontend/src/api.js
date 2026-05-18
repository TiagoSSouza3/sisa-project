import axios from "axios";
import { getAuthToken } from "./utils/auth";

const base_url = process.env.REACT_APP_API_DEVELOPMENT
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? "http://localhost:5000/api"
      : "");
const API = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json'
  }
});


API.interceptors.request.use((config) => {
  const token = getAuthToken();
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
