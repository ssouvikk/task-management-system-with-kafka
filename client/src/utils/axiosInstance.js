// utils/axiosInstance.js
import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // withCredentials: true,  // যদি cookies প্রয়োজন হয়
});

// Request interceptor: token যোগ করা
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

// Response interceptor: 403 পেলে refresh token; অন্যান্য ক্ষেত্রে toast বার্তা দেখানো
instance.interceptors.response.use(
  (response) => {
    // যদি API response-এ message থাকে, তাহলে success toast দেখান
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, { token: refreshToken });
        if (res.status === 200) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    // যদি error response-এ message থাকে, তাহলে error toast দেখান
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
