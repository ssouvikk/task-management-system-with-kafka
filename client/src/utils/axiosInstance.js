import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // https://localhost:5000
  withCredentials: true, // cookies সহ API কলের জন্য
});

// Request interceptor: টোকেন যোগ করা (যদি localStorage-এ থাকে)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Token refresh logic (যদি প্রয়োজন হয়)
// instance.interceptors.response.use(...)

export default instance;
