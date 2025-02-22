// utils/tokenManager.js
let currentAccessToken = null;
let currentRefreshToken = null;

export const initializeTokens = () => {
    if (typeof window !== 'undefined') {
        currentAccessToken = localStorage.getItem('accessToken');
        currentRefreshToken = localStorage.getItem('refreshToken');
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
    }
};
