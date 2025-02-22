// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(undefined);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                // লগইন বা রেজিস্টার পেজে থাকলে প্রোফাইল API কল হবে না
                if (['/login', '/register'].includes(router.pathname)) {
                    setAuthData(null);
                    return;
                }

                if (!accessToken) {
                    setAuthData(null);
                    return;
                }

                // প্রোফাইল API কল করে ব্যবহারকারী তথ্য সেট করা
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

        // প্রথমবার শুধু তখনই রান হবে, যখন authData === undefined
        if (authData === undefined) {
            checkAuth();
        }
    }, [authData]); // authData আপডেট হলে পুনরায় রান হবে না

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
