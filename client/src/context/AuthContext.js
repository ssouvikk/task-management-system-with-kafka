// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';
import { getAccessToken } from '../utils/tokenManager';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(undefined);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accessToken = getAccessToken();
                if (!accessToken || ['/login', '/register'].includes(router.pathname)) {
                    setAuthData(null);
                    return;
                }
                const response = await axiosInstance.get('/api/auth/profile');
                setAuthData({ accessToken, user: response.data.user });
            } catch (error) {
                console.error('Auth check failed:', error);
                setAuthData(null);
                localStorage.clear();
            }
        };
        if (authData === undefined) {
            checkAuth();
        }
    }, [authData]);

    return (
        <AuthContext.Provider value={{ authData, setAuthData }}>
            {authData === undefined ? (
                <div className="h-screen flex items-center justify-center">Loading...</div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export default AuthContext;
