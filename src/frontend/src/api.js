import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});

api.interceptors.request.use(cfg => {
  try {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch (e) {}
  return cfg;
});

export default api;
