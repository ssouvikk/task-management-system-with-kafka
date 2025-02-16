// utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // উদাহরণ: http://localhost:5000
  // withCredentials: true,  // যদি cookies ব্যবহার করতে চান
});

// Request interceptor: প্রতিটি রিকোয়েস্টে localStorage থেকে token যোগ করা
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

// Response interceptor: 403 (অথবা 401) পাওয়া গেলে refresh token API call করা
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // যদি error response status 403 হয় এবং _retry flag না থাকে
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // localStorage থেকে refresh token নিন
        const refreshToken = localStorage.getItem('refreshToken');
        // Refresh token API call করুন (Backend এ /api/auth/refresh-token endpoint থাকা উচিত)
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, { token: refreshToken });
        if (res.status === 200) {
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          // নতুন token গুলো localStorage-এ সংরক্ষণ করুন
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          // original request-এর authorization header আপডেট করুন
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          // original request পুনরায় retry করুন
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token invalid হলে, token মুছে ফেলা এবং লগইন পৃষ্ঠায় redirect করুন
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
