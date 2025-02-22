// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance, { updateToken } from '../utils/axiosInstance';
import { getAccessToken } from '../utils/tokenManager';
import Loader from '@/components/Loader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(undefined);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accessToken = getAccessToken();
                if (!accessToken) {
                    setAuthData(null);
                    return;
                }
                updateToken(accessToken);
                const response = await axiosInstance.get('/api/auth/profile');
                setAuthData({ accessToken, user: response.data.user });
            } catch (error) {
                console.error('Auth check failed:', error);
                setAuthData(null);
                localStorage.clear();
            }
        };

        // শুধুমাত্র একবার চালানোর জন্য, dependency array এ [] ব্যবহার করুন
        if (authData === undefined) {
            checkAuth();
        }
    }, []);  // <-- এখানে শুধুমাত্র [] ব্যবহার করছি

    return (
        <AuthContext.Provider value={{ authData, setAuthData }}>
            {authData === undefined ? <Loader /> : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
