// axiosConfig.jsx
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://agentmanagement-zf7q.onrender.com',
  withCredentials: true,
});

export default instance;
