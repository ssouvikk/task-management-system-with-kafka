// pages/login.js
import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../context/AuthContext';
import axiosInstance, { updateToken } from '../utils/axiosInstance';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { setTokens } from '../utils/tokenManager';

const Login = () => {
    const { authData, setAuthData } = useContext(AuthContext);
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (authData?.user) {
            const redirectPath = router.query.redirect || '/';
            router.replace(redirectPath);
        }
    }, [authData, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axiosInstance.post('/api/auth/login', { email, password });
            const data = res.data;
            if (res.status === 200) {
                const { accessToken, refreshToken, user } = data.data;

                setTokens({ accessToken, refreshToken });
                updateToken(accessToken)
                setAuthData({ user, accessToken });
                router.replace(router.query.redirect || '/');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message || 'There was a problem connecting to the server');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" style={{ backgroundColor: '#b2cdee' }}>
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@example.com"
                        required
                        className="w-full"
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 text-gray-700">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full"
                    />
                </div>
                <Button type="submit" className="w-full">
                    Login
                </Button>
                <p className="mt-6 text-center text-gray-600">
                    New user?{' '}
                    <Link href="/register" className="text-blue-500 hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
};

Login.noLayout = true;
export default Login;
