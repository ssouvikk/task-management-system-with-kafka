// utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // API বেস URL, যেমন: http://localhost:5000
  // withCredentials: true, // যদি cookies প্রয়োজন হয়
});

// Request interceptor: যদি token থাকে, সেটি Authorization হেডারে যোগ করা হচ্ছে
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

export default instance;
