import axios from 'axios';

axios.defaults.baseURL = 'https://agentmanagement-zf7q.onrender.com';
axios.defaults.withCredentials = true;

export default axios;