// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(undefined);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setAuthData(null);
                    return;
                }

                const response = await axiosInstance.get('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                setAuthData({ accessToken, user: response.data.user });
            } catch (error) {
                console.error('Auth check failed:', error);
                setAuthData(null);
                localStorage.clear();
            }
        };

        checkAuth();
    }, []);

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
