// utils/tokenManager.js
import axiosInstance from './axiosInstance';

let currentAccessToken = null;
let currentRefreshToken = null;

export const initializeTokens = () => {
    if (typeof window !== 'undefined') {
        currentAccessToken = localStorage.getItem('accessToken');
        currentRefreshToken = localStorage.getItem('refreshToken');
        if (currentAccessToken) {
            axiosInstance.defaults.headers.common.Authorization = `Bearer ${currentAccessToken}`;
        }
    }
};

export const getAccessToken = () => currentAccessToken;
export const getRefreshToken = () => currentRefreshToken;

export const setTokens = ({ accessToken, refreshToken }) => {
    currentAccessToken = accessToken;
    currentRefreshToken = refreshToken;
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
};
