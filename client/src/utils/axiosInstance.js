// utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // API বেস URL, যেমন: http://localhost:5000
  // withCredentials: true, // যদি cookies প্রয়োজন হয়
});

// Request interceptor: যদি token থাকে, সেটি Authorization হেডারে যোগ করা হচ্ছে
instance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 403 status code পেলে স্বয়ংক্রিয়ভাবে লগ আউট করা হবে
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Token মুছে দিন
      localStorage.removeItem('token');
      // যদি window অবজেক্ট পাওয়া যায়, তাহলে লগইন পৃষ্ঠায় রিডাইরেক্ট করুন
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
