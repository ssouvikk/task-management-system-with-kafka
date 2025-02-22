// utils/axiosInstance.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { getRefreshToken, getAccessToken, setTokens  } from './tokenManager';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

instance.defaults.headers.common['Authorization'] = `Bearer ${getAccessToken()}`;

// Request interceptor: টোকেন আপডেট করা হলে সেট করবো
instance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 403 হলে রিফ্রেশ টোকেন
instance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
          token: getRefreshToken(),
        });

        if (res.status === 200) {
          const { accessToken, refreshToken } = res.data.data;
          setTokens({ accessToken, refreshToken });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
